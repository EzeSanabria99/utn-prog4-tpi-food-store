import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth";
import { useIngredients } from "../hooks/useIngredients";
import type { Ingrediente } from "../types/ingredient.types";

export function IngredientsPage() {
  const { isAdmin } = useAuth();
  const {
    ingredients,
    isLoading,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    isMutating,
  } = useIngredients();

  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      nombre: nombre.trim(),
      unidad: unidad.trim() ? unidad.trim() : null,
    };
    if (editingId !== null) {
      await updateIngredient({ id: editingId, data: payload });
      setEditingId(null);
    } else {
      await createIngredient(payload);
    }
    setNombre("");
    setUnidad("");
  };

  const handleEdit = (ing: Ingrediente) => {
    setEditingId(ing.id);
    setNombre(ing.nombre);
    setUnidad(ing.unidad ?? "");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Ingredientes</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            required
            placeholder="Nombre del ingrediente"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            placeholder="Unidad (opcional)"
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
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
                  setUnidad("");
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
        <p className="text-gray-600 dark:text-gray-400">Cargando ingredientes...</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {ingredients.map((ing) => (
            <li
              key={ing.id}
              className="py-3 flex items-center justify-between text-gray-900 dark:text-gray-100"
            >
              <div>
                <p className="font-semibold">{ing.nombre}</p>
                {ing.unidad && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Unidad: {ing.unidad}</p>
                )}
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(ing)}
                    className="px-3 py-1 rounded text-sm bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteIngredient(ing.id)}
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
