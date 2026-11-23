from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductoCreate(BaseModel):
    categoria_id: int
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: Optional[str] = ""
    precio_base: float = Field(..., ge=0.0)
    imagen_url: Optional[str] = ""
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    activo: bool = True


class ProductoUpdate(BaseModel):
    categoria_id: int
    nombre: str = Field(min_length=1, max_length=120)
    descripcion: Optional[str] = ""
    precio_base: float = Field(..., ge=0.0)
    imagen_url: Optional[str] = ""
    stock: int = Field(ge=0)
    disponible: bool = True
    activo: Optional[bool] = None


class ProductoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    categoria_id: int
    nombre: str
    descripcion: str
    precio_base: float
    imagen_url: str
    stock: int
    disponible: bool
    activo: bool
