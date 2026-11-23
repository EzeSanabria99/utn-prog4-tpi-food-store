from datetime import datetime, timezone
from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from app.core.deps import get_current_active_user, require_role
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(
    _user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return uow.categorias.get_all_activos()


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        cat = Categoria(
            nombre=data.nombre,
            descripcion=data.descripcion or "",
            activo=data.activo,
        )
        try:
            created = uow.categorias.create(cat)
            uow.session.flush()
            uow.session.refresh(created)
            return created
        except IntegrityError:
            uow.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una categoría con ese nombre.",
            )


@router.put("/{id}", response_model=CategoriaRead)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        cat = uow.categorias.get_by_id(id)
        if not cat:
            raise HTTPException(status_code=404, detail="Categoria no encontrada")
        cat.nombre = data.nombre
        cat.descripcion = data.descripcion or ""
        if data.activo is not None:
            cat.activo = data.activo
            cat.deleted_at = None if data.activo else (cat.deleted_at or datetime.now(timezone.utc))
        cat.updated_at = datetime.now(timezone.utc)
        try:
            uow.session.add(cat)
            uow.session.flush()
            uow.session.refresh(cat)
            return cat
        except IntegrityError:
            uow.session.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una categoría con ese nombre.",
            )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        cat = uow.categorias.get_by_id(id)
        if not cat:
            raise HTTPException(status_code=404, detail="Categoria no encontrada")
        ahora = datetime.now(timezone.utc)
        cat.activo = False
        cat.deleted_at = ahora
        cat.updated_at = ahora
        uow.session.add(cat)
        uow.session.flush()
