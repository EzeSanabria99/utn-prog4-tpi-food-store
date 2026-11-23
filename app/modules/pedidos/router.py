from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.deps import get_current_active_user
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidoUpdateEstado
from app.modules.pedidos.service import PedidoService
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


@router.get("", response_model=List[PedidoRead])
def listar_pedidos(
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    return PedidoService(uow).listar(current_user)


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(
    id: int,
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    return PedidoService(uow).obtener_por_id(id, current_user)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    return PedidoService(uow).crear(data, current_user)


@router.put("/{id}", response_model=PedidoRead)
def actualizar_estado_pedido(
    id: int,
    data: PedidoUpdateEstado,
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    return PedidoService(uow).actualizar_estado(id, data, current_user)


@router.patch("/{id}/estado", response_model=PedidoRead)
def patch_estado_pedido(
    id: int,
    data: PedidoUpdateEstado,
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    return PedidoService(uow).actualizar_estado(id, data, current_user)


@router.delete("/{id}", status_code=status.HTTP_405_METHOD_NOT_ALLOWED)
def eliminar_pedido_no_permitido():
    raise HTTPException(
        status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
        detail="Los pedidos no se eliminan; deben cancelarse cambiando su estado a CANCELADO.",
    )
