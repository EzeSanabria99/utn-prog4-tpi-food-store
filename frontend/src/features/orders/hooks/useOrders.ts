import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type {
  EstadoPedido,
  PedidoCreateInput,
  PedidoRead,
} from "../types/order.types";

export function useOrders() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const query = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get<PedidoRead[]>("/pedidos");
      return data;
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (payload: PedidoCreateInput) => {
      const { data } = await api.post<PedidoRead>("/pedidos", payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      showNotification("Pedido creado correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo crear el pedido. Revisá stock y datos.", "error");
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: number; estado: EstadoPedido }) => {
      const { data } = await api.put<PedidoRead>(`/pedidos/${id}`, { estado });
      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      if (variables.estado === "CANCELADO") {
        showNotification("Pedido cancelado y stock restituido.", "info");
      } else {
        showNotification(`Estado actualizado a ${variables.estado}.`, "success");
      }
    },
    onError: () => {
      showNotification("No se pudo actualizar el estado del pedido.", "error");
    },
  });

  return {
    orders: query.data ?? [],
    isLoading: query.isLoading,
    createOrder: createOrderMutation.mutateAsync,
    updateOrderStatus: updateOrderStatusMutation.mutateAsync,
    isMutating:
      createOrderMutation.isPending || updateOrderStatusMutation.isPending,
  };
}
