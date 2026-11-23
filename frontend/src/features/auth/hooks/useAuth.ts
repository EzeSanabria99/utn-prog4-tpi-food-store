import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const checking = useAuthStore((state) => state.checking);
  const isLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  const isAdmin = Boolean(user?.roles.includes("admin"));

  return {
    user,
    checking,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  };
}
