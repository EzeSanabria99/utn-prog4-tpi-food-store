export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
}

export type CategoriaInput = Omit<Categoria, "id">;
