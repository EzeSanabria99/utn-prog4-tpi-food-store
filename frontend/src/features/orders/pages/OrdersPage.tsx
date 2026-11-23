import { useState, type FormEvent } from "react";
import { useAuth } from "@/features/auth";
import { useCartStore } from "../store/cartStore";
import { useOrders } from "../hooks/useOrders";
import type { EstadoPedido, FormaPago } from "../types/order.types";

export function OrdersPage() {
  const { isAdmin } = useAuth();
  const { orders, isLoading, createOrder, updateOrderStatus, isMutating } = useOrders();
  const items = useCartStore((state) => state.items);
  const updateCantidad = useCartStore((state) => state.updateCantidad);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formaPago, setFormaPago] = useState<FormaPago>("EFECTIVO");
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [notas, setNotas] = useState("");

  const totalCarrito = items.reduce(
    (acc, item) => acc + item.precio_unitario * item.cantidad,
    0
  );

  const handleCrearPedido = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    await createOrder({
      forma_pago: formaPago,
      direccion_entrega: direccionEntrega.trim(),
      notas: notas.trim(),
      detalles: items.map((i) => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
      })),
    });

    clearCart();
    setDireccionEntrega("");
    setNotas("");
  };

  const handleCambioEstado = async (pedidoId: number, estado: EstadoPedido) => {
    await updateOrderStatus({ id: pedidoId, estado });
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 space-y-8">
      <section className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Carrito y Checkout
        </h1>

        {items.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Tu carrito está vacío. Agregá productos desde la sección Productos.
          </p>
        ) : (
          <div className="space-y-4">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => (
                <li
                  key={item.producto_id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-semibold">{item.nombre}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${item.precio_unitario} c/u · Stock máx: {item.stock}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.cantidad}
                      onChange={(e) =>
                        updateCantidad(item.producto_id, Number(e.target.value))
                      }
                      className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                    />
                    <span className="font-medium w-24 text-right">
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.producto_id)}
                      className="px-2.5 py-1 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
                    >
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <form
              onSubmit={handleCrearPedido}
              className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Forma de pago</label>
                <select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                >
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Dirección de entrega (5 a 200 caracteres)
                </label>
                <input
                  type="text"
                  required
                  minLength={5}
                  maxLength={200}
                  placeholder="Ej: Av. Hipólito Yrigoyen 120"
                  value={direccionEntrega}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  placeholder="Sin cebolla, timbre 2B..."
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>

              <div className="md:col-span-3 flex items-center justify-between pt-2">
                <p className="text-lg font-bold">
                  Total estimado: ${totalCarrito.toFixed(2)}
                </p>
                <button
                  type="submit"
                  disabled={isMutating}
                  className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium"
                >
                  {isMutating ? "Enviando..." : "Confirmar pedido"}
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      <section className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {isAdmin ? "Gestión de pedidos" : "Mis pedidos"}
        </h2>

        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No hay pedidos registrados.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((pedido) => (
              <div
                key={pedido.id}
                className="p-4 rounded border border-gray-200 dark:border-gray-700 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold">Pedido #{pedido.id}</span> ·{" "}
                    <span className="font-semibold">{pedido.estado}</span> ·{" "}
                    <span>{pedido.forma_pago}</span>
                  </div>
                  <span className="font-bold">Total: ${pedido.total.toFixed(2)}</span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Entrega: {pedido.direccion_entrega}
                  {pedido.notas ? ` · Notas: ${pedido.notas}` : ""}
                </p>

                <ul className="text-sm list-disc list-inside text-gray-700 dark:text-gray-300">
                  {pedido.detalles.map((d) => (
                    <li key={d.id}>
                      {d.nombre_producto} × {d.cantidad} (${d.precio_unitario} c/u) = $
                      {d.subtotal.toFixed(2)}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 pt-2">
                  {!isAdmin && pedido.estado === "PENDIENTE" && (
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => void handleCambioEstado(pedido.id, "CANCELADO")}
                      className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
                    >
                      Cancelar pedido
                    </button>
                  )}

                  {isAdmin && pedido.estado === "PENDIENTE" && (
                    <>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() =>
                          void handleCambioEstado(pedido.id, "EN_PREPARACION")
                        }
                        className="px-3 py-1 rounded text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white"
                      >
                        Pasar a EN_PREPARACION
                      </button>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => void handleCambioEstado(pedido.id, "CANCELADO")}
                        className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
                      >
                        Cancelar pedido
                      </button>
                    </>
                  )}

                  {isAdmin && pedido.estado === "EN_PREPARACION" && (
                    <>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => void handleCambioEstado(pedido.id, "ENTREGADO")}
                        className="px-3 py-1 rounded text-sm bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white"
                      >
                        Marcar ENTREGADO
                      </button>
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => void handleCambioEstado(pedido.id, "CANCELADO")}
                        className="px-3 py-1 rounded text-sm bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white"
                      >
                        Cancelar pedido
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
