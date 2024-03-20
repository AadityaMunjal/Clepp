import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminRequired: React.FC = () => {
  const { isAdmin } = useAuth();

  return isAdmin!() ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRequired;
