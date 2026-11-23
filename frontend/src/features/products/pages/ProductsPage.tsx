import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth";
import { useCategories } from "@/features/categories";
import { useCartStore } from "@/features/orders";
import { useNotificationStore } from "@/store/notificationStore";
import { useProducts } from "../hooks/useProducts";
import type { Producto } from "../types/product.types";

export function ProductsPage() {
  const { isAdmin } = useAuth();
  const { categories } = useCategories();
  const addItem = useCartStore((state) => state.addItem);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    isMutating,
  } = useProducts();

  const [categoriaId, setCategoriaId] = useState<number>(1);
  const [nombre, setNombre] = useState("");
  const [precioBase, setPrecioBase] = useState("");
  const [stock, setStock] = useState("10");
  const [descripcion, setDescripcion] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const catSeleccionada = categories.some((c) => c.id === categoriaId)
    ? categoriaId
    : (categories[0]?.id ?? 1);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      categoria_id: catSeleccionada,
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      precio_base: Number(precioBase) || 0,
      imagen_url: "",
      stock: Math.max(0, Number(stock) || 0),
      disponible: true,
      activo: true,
    };
    if (editingId !== null) {
      await updateProduct({ id: editingId, data: payload });
      setEditingId(null);
    } else {
      await createProduct(payload);
    }
    setNombre("");
    setPrecioBase("");
    setStock("10");
    setDescripcion("");
  };

  const handleEdit = (prod: Producto) => {
    setEditingId(prod.id);
    setCategoriaId(prod.categoria_id);
    setNombre(prod.nombre);
    setPrecioBase(String(prod.precio_base));
    setStock(String(prod.stock));
    setDescripcion(prod.descripcion ?? "");
  };

  const handleAgregarAlCarrito = (prod: Producto) => {
    if (!prod.activo || !prod.disponible || prod.stock <= 0) {
      showNotification("El producto no está disponible o no tiene stock.", "error");
      return;
    }
    addItem(
      {
        producto_id: prod.id,
        nombre: prod.nombre,
        precio_unitario: prod.precio_base,
        stock: prod.stock,
      },
      1
    );
    showNotification(`Agregado '${prod.nombre}' al carrito.`, "success");
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Productos</h1>

      {isAdmin && (
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
          <select
            value={catSeleccionada}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <input
            type="text"
            required
            placeholder="Nombre del producto"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <input
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="Precio base"
            value={precioBase}
            onChange={(e) => setPrecioBase(e.target.value)}
            className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <input
            type="number"
            min="0"
            required
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
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
                  setPrecioBase("");
                  setStock("10");
                  setDescripcion("");
                }}
                className="px-3 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                Cancelar
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="md:col-span-5 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </form>
      )}

      {isLoading ? (
        <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {products.map((prod) => {
            const puedeComprar = prod.activo && prod.disponible && prod.stock > 0;
            return (
              <li
                key={prod.id}
                className="py-3 flex flex-wrap items-center justify-between gap-3 text-gray-900 dark:text-gray-100"
              >
                <div>
                  <p className="font-semibold">
                    {prod.nombre} — ${prod.precio_base} · Stock: {prod.stock}
                  </p>
                  {prod.descripcion && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{prod.descripcion}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!puedeComprar}
                    onClick={() => handleAgregarAlCarrito(prod)}
                    className="px-3 py-1 rounded text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white"
                  >
                    {puedeComprar ? "Agregar al carrito" : "Sin stock"}
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(prod)}
                        className="px-3 py-1 rounded text-sm bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteProduct(prod.id)}
                        className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
