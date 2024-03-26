import { SidebarAssignment } from "./SidebarAssignment";
import { useSidebar } from "../../contexts/SidebarContext";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Assignment, User } from "@prisma/client";

interface HomeSidebarProps {
  assignments: Assignment[] | null;
  preSelectedItem?: string;
}

const HomeSidebar: React.FC<HomeSidebarProps> = ({
  assignments,
  preSelectedItem,
}) => {
  const { currentUser } = useAuth();
  const { selectedItem, setSelectedItem } = useSidebar();

  const { data: user } = useQuery({
    queryKey: ["user", currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/user/${currentUser?.uid}`)
        .then((res) => res.data) as Promise<User>;
    },
  });

  useEffect(() => {
    if (preSelectedItem) {
      setSelectedItem(preSelectedItem);
    }
  }, [preSelectedItem]);

  return (
    <Sidebar>
      <div className="mt-5">
        {assignments?.map((a) => {
          return (
            <SidebarAssignment
              name={a.name}
              pfpColor={a.pfp_color}
              subText=""
              year={a.year as "11" | "12"}
              id={a.id}
              deadline={a.deadline.toString()}
              selected={a.id === selectedItem}
              key={a.id}
            />
          );
        })}
      </div>
    </Sidebar>
  );
};

export default HomeSidebar;
