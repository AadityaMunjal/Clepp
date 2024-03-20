import { Search } from "react-iconly";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface SideBarProps {
  children?: React.ReactNode;
}

const Sidebar: React.FC<SideBarProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const { data: user } = useQuery({
    queryKey: ["user", currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/user/${currentUser?.uid}`)
        .then((res) => res.data);
    },
  });

  return (
    <div className="w-2/12 min-h-screen bg-zinc-900 text-white">
      <div>
        <div className="flex max-h-28 items-center pl-4 pt-4 text-lg">
          <img
            src={user?.image || ""}
            alt="user-image"
            className="max-h-16 m-4 rounded-full overflow-hidden"
          />
          <p>{user?.name || "Displayname not setup"}</p>
        </div>
        <div className="mt-28">
          <div className="flex max-w-fit m-auto pr-6 pl-6 pt-2 pb-2 text-center outline-zinc-700 focus-within:outline-zinc-500 outline-none text-zinc-500 rounded-lg">
            <input
              className="outline-none bg-zinc-900 placeholder-current "
              placeholder="Search"
            />
            <Search primaryColor="#3f3f46" />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Sidebar;
