import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export function Toast() {
  const message = useNotificationStore((state) => state.message);
  const type = useNotificationStore((state) => state.type);
  const visible = useNotificationStore((state) => state.visible);
  const hideNotification = useNotificationStore((state) => state.hideNotification);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(() => {
      hideNotification();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [visible, message, hideNotification]);

  if (!visible || !message) return null;

  const colorClasses =
    type === "error"
      ? "bg-red-600 text-white"
      : type === "success"
        ? "bg-emerald-600 text-white"
        : "bg-slate-800 text-white";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${colorClasses}`}
    >
      {message}
    </div>
  );
}
