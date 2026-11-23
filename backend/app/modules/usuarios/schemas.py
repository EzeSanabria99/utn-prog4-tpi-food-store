from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserCreate(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    apellido: str = Field(min_length=1, max_length=100)
    email: EmailStr
    celular: Optional[str] = Field(default=None, max_length=40)
    password: str = Field(min_length=8, max_length=72)

    @field_validator("password")
    @classmethod
    def validar_bytes_password(cls, v: str) -> str:
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes en UTF-8.")
        return v


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    email: EmailStr
    celular: Optional[str] = None
    roles: list[str] = []
    activo: bool = True
    deleted_at: Optional[datetime] = None
