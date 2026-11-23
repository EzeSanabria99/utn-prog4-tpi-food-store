import { Link } from "react-router-dom";

export function UnauthorizedPage() {
  return (
    <div className="max-w-lg mx-auto mt-12 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-center">
      <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        Acceso denegado
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-5">
        No tenés permisos suficientes para acceder a esta sección.
      </p>
      <Link
        to="/categories"
        className="inline-block px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
