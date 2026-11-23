from pydantic import BaseModel, StringConstraints
from typing_extensions import Annotated

class IngredienteCreate(BaseModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class IngredienteUpdate(BaseModel):
    nombre: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]

class IngredienteRead(BaseModel):
    id: int
    nombre: str
