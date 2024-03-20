import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminRequired() {
  const { isAdmin } = useAuth();

  return isAdmin!() ? <Outlet /> : <Navigate to="/" />;
}
