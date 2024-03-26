import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import HomeSidebar from "../../components/Sidebar/HomeSidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Assignment, User } from "@prisma/client";

const UserDashboard: React.FC = () => {
  const [error, setError] = useState("");
  const { logout } = useAuth();

  async function handleLogout() {
    setError("");

    try {
      logout && (await logout());
    } catch {
      setError("Failed to log out");
    }
  }

  const { currentUser } = useAuth();

  const { data: fetchedUser } = useQuery({
    queryKey: ["user", currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/user/${currentUser?.uid}`)
        .then((res) => res.data as User);
    },
  });

  const { data: fetchedAssignments } = useQuery({
    queryKey: ["assignments"],
    enabled: !!fetchedUser?.year,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/assignments/year/${fetchedUser?.year}`)
        .then((res) => {
          return res.data as Assignment[];
        });
    },
  });

  return (
    <>
      <div className="flex">
        <HomeSidebar assignments={fetchedAssignments || null} />
        {JSON.stringify(error)}
        {/* <div className="w-screen">
          <h2 className="text-center mb-4">USER DASHBOARD</h2>
          {error && <p>{error}</p>}
          <strong>Email:</strong> {JSON.stringify(currentUser)}
        </div> */}
      </div>
      <div className="w-100 text-center mt-2">
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </>
  );
};

export default UserDashboard;
