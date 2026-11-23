from datetime import datetime, timezone
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_active_user, require_role
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.productos.models import Producto
from app.modules.productos.schemas import ProductoCreate, ProductoRead, ProductoUpdate
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("", response_model=List[ProductoRead])
def listar_productos(
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return uow.productos.get_all_activos()


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        categoria = uow.categorias.get_by_id(data.categoria_id)
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        prod = Producto(
            categoria_id=data.categoria_id,
            nombre=data.nombre.strip(),
            descripcion=data.descripcion or "",
            precio_base=data.precio_base,
            imagen_url=data.imagen_url or "",
            stock=data.stock,
            disponible=data.disponible,
            activo=data.activo,
        )
        created = uow.productos.create(prod)
        uow.session.flush()
        uow.session.refresh(created)
        return created


@router.put("/{id}", response_model=ProductoRead)
def actualizar_producto(
    id: int,
    data: ProductoUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        prod = uow.productos.get_by_id(id)
        if not prod:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        categoria = uow.categorias.get_by_id(data.categoria_id)
        if not categoria:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        prod.categoria_id = data.categoria_id
        prod.nombre = data.nombre.strip()
        prod.descripcion = data.descripcion or ""
        prod.precio_base = data.precio_base
        prod.imagen_url = data.imagen_url or ""
        prod.stock = data.stock
        prod.disponible = data.disponible
        if data.activo is not None:
            prod.activo = data.activo
            prod.deleted_at = None if data.activo else (prod.deleted_at or datetime.now(timezone.utc))
        prod.updated_at = datetime.now(timezone.utc)
        uow.session.add(prod)
        uow.session.flush()
        uow.session.refresh(prod)
        return prod


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        prod = uow.productos.get_by_id(id)
        if not prod:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        ahora = datetime.now(timezone.utc)
        prod.activo = False
        prod.deleted_at = ahora
        prod.updated_at = ahora
        uow.session.add(prod)
        uow.session.flush()
