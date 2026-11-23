import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { Categoria, CategoriaInput } from "../types/category.types";

export function useCategories() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<Categoria[]>("/categorias");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CategoriaInput) => {
      const { data } = await api.post<Categoria>("/categorias", payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification("Categoría creada correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo crear la categoría.", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoriaInput }) => {
      const res = await api.put<Categoria>(`/categorias/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification("Categoría actualizada correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo actualizar la categoría.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categorias/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categories"] });
      showNotification("Categoría eliminada correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo eliminar la categoría.", "error");
    },
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
