import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setupInterceptors } from "@/shared/api/setupInterceptors";
import { useThemeStore } from "@/store/themeStore";
import { App } from "./App";
import "./index.css";

setupInterceptors();

const queryClient = new QueryClient();

function ThemeSync({ children }: { children: React.ReactNode }) {
  const darkMode = useThemeStore((state) => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return <>{children}</>;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeSync>
          <App />
        </ThemeSync>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
