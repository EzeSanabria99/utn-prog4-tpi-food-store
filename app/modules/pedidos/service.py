from datetime import datetime, timezone
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import select
from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidoUpdateEstado
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic


class PedidoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def listar(self, current_user: UserPublic) -> List[PedidoRead]:
        with self.uow as uow:
            usuario_db = uow.session.exec(
                select(Usuario).where(Usuario.email == current_user.email)
            ).first()
            if usuario_db is None or usuario_db.id is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

            es_admin = "admin" in current_user.roles
            stmt = select(Pedido).options(selectinload(Pedido.detalles))
            if not es_admin:
                stmt = stmt.where(Pedido.usuario_id == usuario_db.id)
            stmt = stmt.order_by(Pedido.id.desc())
            pedidos = uow.session.exec(stmt).all()
            return [PedidoRead.model_validate(p) for p in pedidos]

    def obtener_por_id(self, pedido_id: int, current_user: UserPublic) -> PedidoRead:
        with self.uow as uow:
            usuario_db = uow.session.exec(
                select(Usuario).where(Usuario.email == current_user.email)
            ).first()
            if usuario_db is None or usuario_db.id is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

            pedido = uow.session.exec(
                select(Pedido)
                .options(selectinload(Pedido.detalles))
                .where(Pedido.id == pedido_id)
            ).first()
            if pedido is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado.")

            es_admin = "admin" in current_user.roles
            if not es_admin and pedido.usuario_id != usuario_db.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permiso para ver este pedido.")

            return PedidoRead.model_validate(pedido)

    def crear(self, data: PedidoCreate, current_user: UserPublic) -> PedidoRead:
        with self.uow as uow:
            usuario_db = uow.session.exec(
                select(Usuario).where(Usuario.email == current_user.email)
            ).first()
            if usuario_db is None or usuario_db.id is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

            productos_a_descontar: list[tuple[Producto, int, float]] = []
            total = 0.0

            for item in data.detalles:
                producto = uow.session.get(Producto, item.producto_id)
                if producto is None or not producto.activo:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Producto {item.producto_id} no encontrado o inactivo.",
                    )
                if not producto.disponible:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"El producto '{producto.nombre}' no está disponible para la venta.",
                    )
                if producto.stock < item.cantidad:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock}, solicitado: {item.cantidad}).",
                    )

                subtotal = round(float(producto.precio_base) * item.cantidad, 2)
                total = round(total + subtotal, 2)
                productos_a_descontar.append((producto, item.cantidad, subtotal))

            pedido = Pedido(
                usuario_id=usuario_db.id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=(data.notas or "").strip(),
                total=total,
            )
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)

            for producto, cantidad, subtotal in productos_a_descontar:
                producto.stock -= cantidad
                producto.updated_at = datetime.now(timezone.utc)
                uow.session.add(producto)

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=float(producto.precio_base),
                    subtotal=subtotal,
                )
                uow.session.add(detalle)

            uow.session.flush()
            pedido_completo = uow.session.exec(
                select(Pedido)
                .options(selectinload(Pedido.detalles))
                .where(Pedido.id == pedido.id)
            ).one()
            return PedidoRead.model_validate(pedido_completo)

    def actualizar_estado(
        self, pedido_id: int, data: PedidoUpdateEstado, current_user: UserPublic
    ) -> PedidoRead:
        with self.uow as uow:
            usuario_db = uow.session.exec(
                select(Usuario).where(Usuario.email == current_user.email)
            ).first()
            if usuario_db is None or usuario_db.id is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

            pedido = uow.session.exec(
                select(Pedido)
                .options(selectinload(Pedido.detalles))
                .where(Pedido.id == pedido_id)
            ).first()
            if pedido is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido no encontrado.")

            es_admin = "admin" in current_user.roles
            es_duenio = pedido.usuario_id == usuario_db.id
            if not es_admin and not es_duenio:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tenés permiso para modificar este pedido.")

            estado_actual = pedido.estado
            nuevo_estado = data.estado

            if estado_actual in {"ENTREGADO", "CANCELADO"}:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El pedido está en estado terminal '{estado_actual}' y no puede cambiar de estado.",
                )

            if not es_admin:
                if nuevo_estado != "CANCELADO" or estado_actual != "PENDIENTE":
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Solo podés cancelar tu propio pedido mientras esté en estado PENDIENTE.",
                    )
            else:
                transiciones_validas = {
                    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
                    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
                }
                if nuevo_estado not in transiciones_validas.get(estado_actual, set()):
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Transición de estado no permitida: {estado_actual} -> {nuevo_estado}.",
                    )

            if nuevo_estado == "CANCELADO" and estado_actual != "CANCELADO":
                for det in pedido.detalles:
                    producto = uow.session.get(Producto, det.producto_id)
                    if producto is not None:
                        producto.stock += det.cantidad
                        producto.updated_at = datetime.now(timezone.utc)
                        uow.session.add(producto)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()

            pedido_actualizado = uow.session.exec(
                select(Pedido)
                .options(selectinload(Pedido.detalles))
                .where(Pedido.id == pedido.id)
            ).one()
            return PedidoRead.model_validate(pedido_actualizado)
