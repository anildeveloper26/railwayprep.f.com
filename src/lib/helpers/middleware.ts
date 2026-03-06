import { getAccessToken } from "@/lib/store/auth";

export async function authMiddleware({ location }: { location: { pathname: string } }) {
  const token = getAccessToken();
  const publicRoutes = ["/", "/login", "/register"];

  if (!token && !publicRoutes.includes(location.pathname)) {
    throw new Error("redirect:/login");
  }

  if (token && publicRoutes.includes(location.pathname)) {
    throw new Error("redirect:/dashboard");
  }
}
