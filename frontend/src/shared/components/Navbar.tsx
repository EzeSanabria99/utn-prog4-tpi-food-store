import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useCartStore } from "@/features/orders";
import { useThemeStore } from "@/store/themeStore";
import { useNotificationStore } from "@/store/notificationStore";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const cartCount = useCartStore((state) =>
    state.items.reduce((acc, item) => acc + item.cantidad, 0)
  );
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const showNotification = useNotificationStore((state) => state.showNotification);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showNotification("Sesión cerrada.", "info");
    navigate("/login");
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/categories"
            className="font-bold text-lg text-gray-900 dark:text-gray-100"
          >
            Food Store TPI
          </Link>
          {user && (
            <>
              <Link
                to="/categories"
                className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
              >
                Categorías
              </Link>
              <Link
                to="/products"
                className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
              >
                Productos
              </Link>
              <Link
                to="/orders"
                className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
              >
                Pedidos ({cartCount})
              </Link>
              <Link
                to="/ingredients"
                className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
              >
                Ingredientes
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/users"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:underline"
                >
                  Usuarios
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded text-sm border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>

          {user ? (
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="px-3 py-1.5 rounded text-sm bg-red-600 hover:bg-red-700 text-white"
            >
              Cerrar sesión
            </button>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
