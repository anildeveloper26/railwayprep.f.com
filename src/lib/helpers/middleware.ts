import Cookies from "js-cookie";

export async function authMiddleware({ location }: { location: { pathname: string } }) {
  const token = Cookies.get("rrb_token");
  const publicRoutes = ["/", "/login", "/register"];

  if (!token && !publicRoutes.includes(location.pathname)) {
    throw new Error("redirect:/login");
  }

  if (token && publicRoutes.includes(location.pathname)) {
    throw new Error("redirect:/dashboard");
  }
}
