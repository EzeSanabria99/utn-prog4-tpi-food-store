export interface UsuarioAuth {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  roles: string[];
}

export interface AdminUsuarioItem extends UsuarioAuth {
  celular?: string | null;
  activo: boolean;
  deleted_at?: string | null;
}

export interface RegisterPayload {
  nombre: string;
  apellido: string;
  email: string;
  celular?: string | null;
  password: string;
}
