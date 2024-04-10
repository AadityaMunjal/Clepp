import { useAuth } from "../../contexts/AuthContext";

export default function AdminNavbar() {
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      logout && (await logout());
    } catch {
      console.log("Failed to log out");
    }
  }
  return (
    <div>
      <nav className="bg-zinc-800 fixed w-full z-20 top-0 start-0 border-b border-zinc-600">
        <div className="w-screen mx-auto p-4">
          <div className="w-auto order-1">
            <ul className="flex justify-center p-0 font-medium rounded-lg space-x-8 mt-0 border-0 bg-zinc-800 border-zinc-700">
              <li>
                <a
                  href="/admin"
                  className="block py-2 px-3 hover:bg-zinc-700 rounded bg-transparent p-0 text-white"
                  aria-current="page"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/admin/create"
                  className="block py-2 px-3 rounded p-0 text-white hover:bg-zinc-700 hover:text-white hover:bg-transparent border-zinc-700"
                >
                  Create Assignment
                </a>
              </li>
              <li>
                <a
                  href="/admin/add-users"
                  className="block py-2 px-3 rounded p-0 text-white hover:bg-zinc-700 hover:text-white hover:bg-transparent border-zinc-700"
                >
                  Add Students
                </a>
              </li>
              <li>
                <a
                  onClick={handleLogout}
                  className="block py-2 px-3 rounded p-0 text-white hover:bg-zinc-700 hover:text-white hover:bg-transparent border-zinc-700"
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="my-20"> </div>
    </div>
  );
}
