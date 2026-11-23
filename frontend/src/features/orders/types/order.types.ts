export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

export interface DetallePedidoItemInput {
  producto_id: number;
  cantidad: number;
}

export interface PedidoCreateInput {
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string;
  detalles: DetallePedidoItemInput[];
}

export interface DetallePedidoRead {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  nombre_producto: string;
  precio_unitario: number;
  subtotal: number;
}

export interface PedidoRead {
  id: number;
  usuario_id: number;
  estado: EstadoPedido | string;
  forma_pago: FormaPago | string;
  direccion_entrega: string;
  notas: string;
  total: number;
  created_at: string;
  updated_at: string;
  detalles: DetallePedidoRead[];
}

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  stock: number;
  cantidad: number;
}
