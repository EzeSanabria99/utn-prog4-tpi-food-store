import { useEffect } from "react";
import { useAuth } from "@/features/auth";
import { AppRouter } from "@/routes/AppRouter";
import { Toast } from "@/shared/components/Toast";

export function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
