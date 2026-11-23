import { useEffect, useState } from "react";
import { api } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { AdminUsuarioItem } from "../types/auth.types";

export function AdminUsersPage() {
  const [usuarios, setUsuarios] = useState<AdminUsuarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const showNotification = useNotificationStore((state) => state.showNotification);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<AdminUsuarioItem[]>("/api/v1/auth/admin/usuarios");
      setUsuarios(data);
    } catch {
      showNotification("No se pudo cargar el listado de usuarios.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarUsuarios();
  }, []);

  const handleToggleActivo = async (usuario: AdminUsuarioItem) => {
    try {
      const accion = usuario.activo ? "desactivar" : "activar";
      await api.post(`/api/v1/auth/admin/usuarios/${usuario.id}/${accion}`);
      showNotification("Estado de usuario actualizado.", "success");
      await cargarUsuarios();
    } catch {
      showNotification("No se pudo actualizar el estado del usuario.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Administración de usuarios
      </h1>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Nombre y apellido</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Roles</th>
                <th className="py-2 px-3">Estado</th>
                <th className="py-2 px-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-100 dark:border-gray-700/60 text-gray-900 dark:text-gray-100"
                >
                  <td className="py-2 px-3">{u.id}</td>
                  <td className="py-2 px-3">
                    {u.nombre} {u.apellido}
                  </td>
                  <td className="py-2 px-3">{u.email}</td>
                  <td className="py-2 px-3">{u.roles.join(", ")}</td>
                  <td className="py-2 px-3">{u.activo ? "Activo" : "Inactivo"}</td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => void handleToggleActivo(u)}
                      className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
