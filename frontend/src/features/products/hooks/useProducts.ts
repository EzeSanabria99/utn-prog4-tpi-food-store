import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { Producto, ProductoInput } from "../types/product.types";

export function useProducts() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get<Producto[]>("/productos");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: ProductoInput) => {
      const { data } = await api.post<Producto>("/productos", payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      showNotification("Producto creado correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo crear el producto.", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProductoInput }) => {
      const res = await api.put<Producto>(`/productos/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      showNotification("Producto actualizado correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo actualizar el producto.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/productos/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["products"] });
      showNotification("Producto eliminado correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo eliminar el producto.", "error");
    },
  });

  return {
    products: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
