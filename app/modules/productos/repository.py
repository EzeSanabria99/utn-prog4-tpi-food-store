from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_all_activos(self) -> list[Producto]:
        stmt = select(Producto).where(Producto.deleted_at.is_(None)).order_by(Producto.id)
        return list(self.session.exec(stmt).all())

    def get_activo_by_id(self, producto_id: int) -> Optional[Producto]:
        stmt = select(Producto).where(
            Producto.id == producto_id,
            Producto.deleted_at.is_(None),
        )
        return self.session.exec(stmt).first()

    def soft_delete(self, producto: Producto) -> Producto:
        ahora = datetime.now(timezone.utc)
        producto.deleted_at = ahora
        producto.updated_at = ahora
        self.session.add(producto)
        self.session.flush()
        return producto
