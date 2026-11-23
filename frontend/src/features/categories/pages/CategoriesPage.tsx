import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth";
import { useCategories } from "../hooks/useCategories";
import type { Categoria } from "../types/category.types";

export function CategoriesPage() {
  const { isAdmin } = useAuth();
  const {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    isMutating,
  } = useCategories();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() ? descripcion.trim() : null,
    };
    if (editingId !== null) {
      await updateCategory({ id: editingId, data: payload });
      setEditingId(null);
    } else {
      await createCategory(payload);
    }
    setNombre("");
    setDescripcion("");
  };

  const handleEdit = (cat: Categoria) => {
    setEditingId(cat.id);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion ?? "");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Categorías</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Nombre de categoría"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isMutating}
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
            >
              {editingId !== null ? "Guardar" : "Agregar"}
            </button>
            {editingId !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setNombre("");
                  setDescripcion("");
                }}
                className="px-3 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="text-gray-600 dark:text-gray-400">Cargando categorías...</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="py-3 flex items-center justify-between text-gray-900 dark:text-gray-100"
            >
              <div>
                <p className="font-semibold">{cat.nombre}</p>
                {cat.descripcion && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cat.descripcion}</p>
                )}
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(cat)}
                    className="px-3 py-1 rounded text-sm bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteCategory(cat.id)}
                    className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
