import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContext";

export default function AdminRequired() {
  const { isAdmin } = useAuth();

  return isAdmin!() ? <Navigate to="/admin" /> : <Outlet />;
}
