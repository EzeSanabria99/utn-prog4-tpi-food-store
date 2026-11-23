from typing import Optional
from sqlmodel import Session
from app.core.database import engine
from app.modules.categorias.repository import CategoriaRepository
from app.modules.productos.repository import ProductoRepository
from app.modules.usuarios.repository import RolRepository, UsuarioRepository, UsuarioRolRepository


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Optional[Session] = None

    def __enter__(self) -> "UnitOfWork":
        self.session = Session(engine, expire_on_commit=False)
        self.usuarios = UsuarioRepository(self.session)
        self.roles = RolRepository(self.session)
        self.usuario_roles = UsuarioRolRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self.session is None:
            return
        if exc_type is not None:
            self.session.rollback()
        else:
            self.session.commit()
        self.session.close()


def get_uow() -> UnitOfWork:
    return UnitOfWork()
