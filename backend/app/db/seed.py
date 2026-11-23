from sqlmodel import SQLModel, select
from app.core.database import engine
from app.core.security import hash_password
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.models import Categoria
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Rol, Usuario


def run_seed() -> None:
    SQLModel.metadata.create_all(engine)
    uow = UnitOfWork()
    with uow:
        roles_base = [
            ("admin", "Administrador del sistema con permisos de gestión"),
            ("user", "Usuario estándar autenticado"),
        ]
        roles_map: dict[str, Rol] = {}
        for nombre, descripcion in roles_base:
            rol = uow.roles.get_by_nombre(nombre)
            if rol is None:
                rol = uow.roles.create(Rol(nombre=nombre, descripcion=descripcion))
            roles_map[nombre] = rol

        usuarios_base = [
            ("Admin", "FoodStore", "admin@foodstore.local", "Admin1234!", "admin"),
            ("Cliente", "Demo", "cliente@foodstore.local", "Cliente1234!", "user"),
        ]
        for nombre, apellido, email, password, rol_nombre in usuarios_base:
            usuario = uow.usuarios.get_by_email(email)
            if usuario is None:
                usuario = uow.usuarios.create(
                    Usuario(
                        nombre=nombre,
                        apellido=apellido,
                        email=email,
                        password_hash=hash_password(password),
                    )
                )
            rol = roles_map[rol_nombre]
            if usuario.id is not None and rol.id is not None:
                uow.usuario_roles.asignar(usuario_id=usuario.id, rol_id=rol.id)

        categorias_base = [
            ("Hamburguesas", "Hamburguesas artesanales y combos clásicos"),
            ("Bebidas", "Gaseosas, aguas y bebidas frías"),
            ("Postres", "Helados, brownies y opciones dulces"),
        ]
        cats_map: dict[str, Categoria] = {}
        for nombre, descripcion in categorias_base:
            cat = uow.session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion, activo=True)
                uow.session.add(cat)
                uow.session.flush()
                uow.session.refresh(cat)
            cats_map[nombre] = cat

        productos_base = [
            ("Hamburguesas", "Doble Bacon Cheddar", "Doble medallón de carne, cheddar y panceta", 8500.0, 25, True),
            ("Hamburguesas", "Clásica de la Casa", "Medallón de carne, lechuga, tomate y salsa especial", 6900.0, 30, True),
            ("Bebidas", "Gaseosa Cola 500ml", "Bebida fría en botella de 500ml", 2200.0, 50, True),
            ("Postres", "Cono Vainilla y Chocolate", "Postre helado con cobertura de chocolate", 2800.0, 20, True),
        ]
        for cat_nombre, prod_nombre, desc, precio, stock, disp in productos_base:
            cat = cats_map[cat_nombre]
            existente = uow.session.exec(
                select(Producto).where(Producto.nombre == prod_nombre)
            ).first()
            if existente is None and cat.id is not None:
                prod = Producto(
                    categoria_id=cat.id,
                    nombre=prod_nombre,
                    descripcion=desc,
                    precio_base=precio,
                    imagen_url="",
                    stock=stock,
                    disponible=disp,
                    activo=True,
                )
                uow.session.add(prod)


if __name__ == "__main__":
    run_seed()
    print("Seed del TPI completado correctamente.")
