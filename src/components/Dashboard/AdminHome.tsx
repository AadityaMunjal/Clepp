import { useState } from "react";
import { useAuth } from "../../AuthContext";

export default function UserDashboard() {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    setError("");

    try {
      logout && (await logout());
    } catch {
      setError("Failed to log out");
    }
  }

  return (
    <>
      <div>
        <div>
          <h2 className="text-center mb-4">ADMIN DASHBOARD</h2>
          {error && <p>{error}</p>}
          <strong>Email:</strong> {JSON.stringify(currentUser)}
        </div>
      </div>
      <div className="w-100 text-center mt-2">
        <button onClick={handleLogout}>Log Out</button>
      </div>
    </>
  );
}
