from typing import Annotated, Callable
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.core.unit_of_work import UnitOfWork, get_uow
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str | None:
        token = request.cookies.get("access_token")
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No autenticado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
) -> UserPublic:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    email: str | None = payload.get("sub")
    if not email:
        raise credentials_exception

    with uow:
        usuario = uow.usuarios.get_by_email(email)
        if usuario is None:
            raise credentials_exception
        return UsuarioService(uow).to_public(usuario)


async def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    if not current_user.activo or current_user.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(allowed_roles: list[str]) -> Callable:
    async def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
        uow: Annotated[UnitOfWork, Depends(get_uow)],
    ) -> UserPublic:
        with uow:
            roles_vigentes = (
                uow.usuario_roles.get_roles_vigentes(current_user.id)
                if current_user.id
                else []
            )
        if not any(rol in allowed_roles for rol in roles_vigentes):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Permisos insuficientes. Roles vigentes: {roles_vigentes}. "
                    f"Se requiere uno de: {allowed_roles}"
                ),
            )
        current_user.roles = roles_vigentes
        return current_user

    return role_checker
