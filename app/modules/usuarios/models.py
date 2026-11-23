from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    apellido: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=255)
    celular: Optional[str] = Field(default=None, max_length=40)
    password_hash: str
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    deleted_at: Optional[datetime] = Field(default=None)


class Rol(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: str = Field(default="", max_length=255)


class UsuarioRol(SQLModel, table=True):
    usuario_id: int = Field(foreign_key="usuario.id", primary_key=True)
    rol_id: int = Field(foreign_key="rol.id", primary_key=True)
    asignado_por_id: Optional[int] = Field(default=None, foreign_key="usuario.id")
    expires_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=utcnow)
