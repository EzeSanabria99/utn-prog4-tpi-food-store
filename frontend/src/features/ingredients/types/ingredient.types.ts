export interface Ingrediente {
  id: number;
  nombre: string;
  unidad?: string | null;
  stock?: number | null;
}

export type IngredienteInput = Omit<Ingrediente, "id">;
