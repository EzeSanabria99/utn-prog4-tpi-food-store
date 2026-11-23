import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 text-center text-gray-600 dark:text-gray-400">
        Verificando sesión...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const tieneRol = user.roles.some((rol) => allowedRoles.includes(rol));
    if (!tieneRol) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}
