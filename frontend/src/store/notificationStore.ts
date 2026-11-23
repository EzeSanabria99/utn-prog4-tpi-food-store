import { create } from "zustand";

export type NotificationType = "info" | "success" | "error";

interface NotificationState {
  message: string | null;
  type: NotificationType;
  visible: boolean;
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  message: null,
  type: "info",
  visible: false,
  showNotification: (message: string, type: NotificationType = "info") =>
    set({ message, type, visible: true }),
  hideNotification: () => set({ visible: false }),
}));
