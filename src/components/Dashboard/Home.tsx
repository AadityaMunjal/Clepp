import { useEffect, useState } from "react";
import { useAuth } from "../../AuthContext";
import AdminHome from "./AdminHome";
import UserHome from "./UserHome";

export default function Home() {
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL) {
      setUserIsAdmin(true);
    }
  }, [currentUser]);

  return (
    <div>
      <h2 className="text-center mb-4">Welcome to the Dashboard</h2>
      {userIsAdmin ? <AdminHome /> : <UserHome />}
    </div>
  );
}
