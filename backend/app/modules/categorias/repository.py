from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_all_activos(self) -> list[Categoria]:
        stmt = select(Categoria).where(Categoria.deleted_at.is_(None)).order_by(Categoria.id)
        return list(self.session.exec(stmt).all())

    def get_activo_by_id(self, categoria_id: int) -> Optional[Categoria]:
        stmt = select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.deleted_at.is_(None),
        )
        return self.session.exec(stmt).first()

    def soft_delete(self, categoria: Categoria) -> Categoria:
        ahora = datetime.now(timezone.utc)
        categoria.deleted_at = ahora
        categoria.updated_at = ahora
        self.session.add(categoria)
        self.session.flush()
        return categoria
