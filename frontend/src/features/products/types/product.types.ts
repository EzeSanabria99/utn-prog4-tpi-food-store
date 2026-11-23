export interface Producto {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
  activo: boolean;
}

export interface ProductoInput {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_url?: string;
  stock: number;
  disponible: boolean;
  activo?: boolean;
}
