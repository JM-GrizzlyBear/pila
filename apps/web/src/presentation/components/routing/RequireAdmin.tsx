import { Navigate, Outlet } from "react-router";
import { useCurrentUser } from "../../../application/auth/useAuth";

// Admin pages: staff go back to the home page (the API refuses them anyway).
// Sits inside RequireAuth, so someone is always signed in here.
export function RequireAdmin() {
  const { data: user } = useCurrentUser();
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
