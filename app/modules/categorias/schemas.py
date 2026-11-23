from typing import Optional
from pydantic import BaseModel, ConfigDict, StringConstraints
from typing_extensions import Annotated


class CategoriaCreate(BaseModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
    descripcion: Optional[str] = ""
    activo: bool = True


class CategoriaUpdate(BaseModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=100)]
    descripcion: Optional[str] = ""
    activo: Optional[bool] = None


class CategoriaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    descripcion: str
    activo: bool
