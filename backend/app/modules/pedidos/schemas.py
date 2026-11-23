from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

FormaPagoLiteral = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedidoLiteral = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]


class DetallePedidoItemCreate(BaseModel):
    producto_id: int
    cantidad: int = Field(..., ge=1)


class PedidoCreate(BaseModel):
    forma_pago: FormaPagoLiteral
    direccion_entrega: str = Field(..., min_length=5, max_length=200)
    notas: Optional[str] = ""
    detalles: List[DetallePedidoItemCreate]

    @field_validator("direccion_entrega")
    @classmethod
    def validar_direccion(cls, v: str) -> str:
        limpia = v.strip()
        if len(limpia) < 5 or len(limpia) > 200:
            raise ValueError("La dirección de entrega debe tener entre 5 y 200 caracteres.")
        return limpia

    @model_validator(mode="after")
    def validar_detalles(self):
        if not self.detalles:
            raise ValueError("El pedido debe contener al menos un producto.")
        ids = [d.producto_id for d in self.detalles]
        if len(ids) != len(set(ids)):
            raise ValueError("No se puede repetir el mismo producto dentro del mismo pedido.")
        return self


class PedidoUpdateEstado(BaseModel):
    estado: EstadoPedidoLiteral


class DetallePedidoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pedido_id: int
    producto_id: int
    cantidad: int
    nombre_producto: str
    precio_unitario: float
    subtotal: float


class PedidoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str
    total: float
    created_at: datetime
    updated_at: datetime
    detalles: List[DetallePedidoRead] = []
