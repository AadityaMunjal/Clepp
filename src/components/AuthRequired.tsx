import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function AuthRequired() {
  const { currentUser } = useAuth();

  return currentUser!! ? <Outlet /> : <Navigate to="/login" />;
}
