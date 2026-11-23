from typing import Annotated
from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.deps import get_current_active_user, require_role
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    data: UserCreate,
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return UsuarioService(uow).registrar(data)


@router.post("/token")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
    response: Response,
):
    with uow:
        access_token = UsuarioService(uow).autenticar(
            form_data.username, form_data.password
        )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )
    return {"mensaje": "Login exitoso. Sesión iniciada."}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"mensaje": "Sesión cerrada."}


@router.get("/me", response_model=UserPublic)
def me(
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
):
    return current_user


@router.get("/admin/usuarios", response_model=list[UserPublic])
def list_users(
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return UsuarioService(uow).listar_todos()


@router.post("/admin/usuarios/{id}/activar", response_model=UserPublic)
def activate_user(
    id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return UsuarioService(uow).activar(id)


@router.post("/admin/usuarios/{id}/desactivar", response_model=UserPublic)
def deactivate_user(
    id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        return UsuarioService(uow).desactivar(id)
