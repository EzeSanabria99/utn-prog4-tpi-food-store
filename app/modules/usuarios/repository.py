from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.usuarios.models import Rol, Usuario, UsuarioRol


def _normalizar_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_email(self, email: str) -> Optional[Usuario]:
        stmt = select(Usuario).where(Usuario.email == email.strip().lower())
        return self.session.exec(stmt).first()

    def get_all_including_deleted(self) -> list[Usuario]:
        stmt = select(Usuario).order_by(Usuario.id)
        return list(self.session.exec(stmt).all())


class RolRepository(BaseRepository[Rol]):
    def __init__(self, session: Session):
        super().__init__(session, Rol)

    def get_by_nombre(self, nombre: str) -> Optional[Rol]:
        stmt = select(Rol).where(Rol.nombre == nombre)
        return self.session.exec(stmt).first()


class UsuarioRolRepository:
    def __init__(self, session: Session):
        self.session = session

    def asignar(
        self,
        usuario_id: int,
        rol_id: int,
        asignado_por_id: Optional[int] = None,
        expires_at: Optional[datetime] = None,
    ) -> UsuarioRol:
        existente = self.session.get(UsuarioRol, (usuario_id, rol_id))
        if existente is not None:
            existente.asignado_por_id = asignado_por_id
            existente.expires_at = expires_at
            self.session.add(existente)
            self.session.flush()
            return existente

        vinculo = UsuarioRol(
            usuario_id=usuario_id,
            rol_id=rol_id,
            asignado_por_id=asignado_por_id,
            expires_at=expires_at,
        )
        self.session.add(vinculo)
        self.session.flush()
        return vinculo

    def get_roles_vigentes(self, usuario_id: int) -> list[str]:
        ahora = datetime.now(timezone.utc)
        stmt = (
            select(Rol.nombre, UsuarioRol.expires_at)
            .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)
            .where(UsuarioRol.usuario_id == usuario_id)
        )
        filas = self.session.exec(stmt).all()
        vigentes: list[str] = []
        for nombre_rol, expires_at in filas:
            exp_utc = _normalizar_utc(expires_at)
            if exp_utc is None or exp_utc > ahora:
                vigentes.append(nombre_rol)
        return vigentes
