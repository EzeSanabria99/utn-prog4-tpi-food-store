from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from app.modules.ingredientes.models import Ingrediente
from app.modules.ingredientes.schemas import IngredienteCreate, IngredienteUpdate, IngredienteRead
from app.modules.ingredientes.repository import IngredienteRepository

router = APIRouter(prefix="/ingredientes", tags=["ingredientes"])

@router.get("", response_model=List[IngredienteRead])
def listar_ingredientes(session: Session = Depends(get_session)):
    repo = IngredienteRepository(session)
    return repo.get_all()

@router.post("", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def crear_ingrediente(data: IngredienteCreate, session: Session = Depends(get_session)):
    repo = IngredienteRepository(session)
    ing = Ingrediente(nombre=data.nombre)
    created = repo.create(ing)
    session.commit()
    session.refresh(created)
    return created

@router.put("/{id}", response_model=IngredienteRead)
def actualizar_ingrediente(id: int, data: IngredienteUpdate, session: Session = Depends(get_session)):
    repo = IngredienteRepository(session)
    ing = repo.get_by_id(id)
    if not ing:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    ing.nombre = data.nombre
    session.add(ing)
    session.commit()
    session.refresh(ing)
    return ing

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ingrediente(id: int, session: Session = Depends(get_session)):
    repo = IngredienteRepository(session)
    ing = repo.get_by_id(id)
    if not ing:
        raise HTTPException(status_code=404, detail="Ingrediente no encontrado")
    session.delete(ing)
    session.commit()
