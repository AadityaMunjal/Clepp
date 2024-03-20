import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AuthRequired: React.FC = () => {
  const { currentUser } = useAuth();

  return currentUser!! ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthRequired;
