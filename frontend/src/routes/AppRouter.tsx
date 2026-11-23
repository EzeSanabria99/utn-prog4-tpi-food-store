import { Navigate, Route, Routes } from "react-router-dom";
import {
  AdminUsersPage,
  LoginPage,
  RegisterPage,
} from "@/features/auth";
import { CategoriesPage } from "@/features/categories";
import { ProductsPage } from "@/features/products";
import { OrdersPage } from "@/features/orders";
import { IngredientsPage } from "@/features/ingredients";
import { Navbar } from "@/shared/components/Navbar";
import { UnauthorizedPage } from "@/shared/components/UnauthorizedPage";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />
      <main className="px-4 pb-10">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/ingredients" element={<IngredientsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/categories" replace />} />
          <Route path="*" element={<Navigate to="/categories" replace />} />
        </Routes>
      </main>
    </div>
  );
}
