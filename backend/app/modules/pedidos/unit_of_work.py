from sqlmodel import Session
from app.core.database import engine
from app.modules.pedidos.repository import PedidoRepository, DetallePedidoRepository
from app.modules.productos.repository import ProductoRepository

class PedidosUnitOfWork:
    def __init__(self):
        self.session_factory = lambda: Session(engine)

    def __enter__(self):
        self.session = self.session_factory()
        self.pedidos = PedidoRepository(self.session)
        self.detalles = DetallePedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type:
                self.session.rollback()
            else:
                self.session.commit()
        finally:
            self.session.close()
