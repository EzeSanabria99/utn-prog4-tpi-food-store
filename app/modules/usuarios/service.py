from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.core.security import create_access_token, hash_password, verify_password
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic


class UsuarioService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def to_public(self, usuario: Usuario) -> UserPublic:
        roles = self.uow.usuario_roles.get_roles_vigentes(usuario.id) if usuario.id else []
        return UserPublic(
            id=usuario.id,
            nombre=usuario.nombre,
            apellido=usuario.apellido,
            email=usuario.email,
            celular=usuario.celular,
            roles=roles,
            activo=usuario.deleted_at is None,
            deleted_at=usuario.deleted_at,
        )

    def registrar(self, data: UserCreate) -> UserPublic:
        email_normalizado = data.email.strip().lower()
        if self.uow.usuarios.get_by_email(email_normalizado) is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un usuario registrado con ese email.",
            )

        rol_user = self.uow.roles.get_by_nombre("user")
        if rol_user is None or rol_user.id is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="El rol 'user' no está inicializado en la base de datos.",
            )

        usuario = Usuario(
            nombre=data.nombre.strip(),
            apellido=data.apellido.strip(),
            email=email_normalizado,
            celular=data.celular.strip() if data.celular else None,
            password_hash=hash_password(data.password),
        )
        creado = self.uow.usuarios.create(usuario)
        if creado.id is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo generar el identificador del usuario.",
            )

        self.uow.usuario_roles.asignar(
            usuario_id=creado.id,
            rol_id=rol_user.id,
            asignado_por_id=None,
            expires_at=None,
        )
        return self.to_public(creado)

    def autenticar(self, email_o_username: str, password: str) -> str:
        usuario = self.uow.usuarios.get_by_email(email_o_username)
        if usuario is None or not verify_password(password, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if usuario.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cuenta de usuario desactivada",
            )

        roles = self.uow.usuario_roles.get_roles_vigentes(usuario.id) if usuario.id else []
        return create_access_token(data={"sub": usuario.email, "roles": roles})

    def listar_todos(self) -> list[UserPublic]:
        usuarios = self.uow.usuarios.get_all_including_deleted()
        return [self.to_public(u) for u in usuarios]

    def activar(self, usuario_id: int) -> UserPublic:
        usuario = self.uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado.",
            )
        usuario.deleted_at = None
        usuario.updated_at = datetime.now(timezone.utc)
        self.uow.session.add(usuario)
        self.uow.session.flush()
        return self.to_public(usuario)

    def desactivar(self, usuario_id: int) -> UserPublic:
        usuario = self.uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuario no encontrado.",
            )
        ahora = datetime.now(timezone.utc)
        usuario.deleted_at = ahora
        usuario.updated_at = ahora
        self.uow.session.add(usuario)
        self.uow.session.flush()
        return self.to_public(usuario)
