from typing import List
from sqlmodel import Session, select
from app.core.repository import BaseRepository
from app.modules.pedidos.models import Pedido, DetallePedido

class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_activos(self) -> List[Pedido]:
        return self.session.exec(select(Pedido).where(Pedido.deleted_at == None)).all()

class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)
