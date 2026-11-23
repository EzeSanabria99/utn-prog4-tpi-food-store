import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api/api";
import { useNotificationStore } from "@/store/notificationStore";
import type { Ingrediente, IngredienteInput } from "../types/ingredient.types";

export function useIngredients() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((state) => state.showNotification);

  const query = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data } = await api.get<Ingrediente[]>("/ingredientes");
      return data;
    },
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: IngredienteInput) => {
      const { data } = await api.post<Ingrediente>("/ingredientes", payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      showNotification("Ingrediente creado correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo crear el ingrediente.", "error");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: IngredienteInput }) => {
      const res = await api.put<Ingrediente>(`/ingredientes/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      showNotification("Ingrediente actualizado correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo actualizar el ingrediente.", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/ingredientes/${id}`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
      showNotification("Ingrediente eliminado correctamente.", "success");
    },
    onError: () => {
      showNotification("No se pudo eliminar el ingrediente.", "error");
    },
  });

  return {
    ingredients: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createIngredient: createMutation.mutateAsync,
    updateIngredient: updateMutation.mutateAsync,
    deleteIngredient: deleteMutation.mutateAsync,
    isMutating:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  };
}
