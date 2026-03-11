import { AdminPage } from "@/components/admin/AdminPage";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authApi } from "@/lib/api";

export const Route = createFileRoute("/_layout/admin")({
  beforeLoad: async () => {
    try {
      const user = await authApi.getMe();
      const isAdmin = user?.role === "admin" || user?.isAdmin === true;
      if (!isAdmin) {
        throw redirect({ to: "/dashboard" });
      }
    } catch (err) {
      if ((err as { isRedirect?: boolean }).isRedirect) throw err;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminPage,
});
