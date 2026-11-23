import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useNotificationStore } from "@/store/notificationStore";

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const showNotification = useNotificationStore((state) => state.showNotification);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      showNotification("Sesión iniciada correctamente.", "success");
      navigate("/categories");
    } catch {
      showNotification("Credenciales inválidas o error al iniciar sesión.", "error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Correo electrónico
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        ¿No tenés cuenta?{" "}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 underline">
          Registrate acá
        </Link>
      </p>
    </div>
  );
}
