import { SidebarAssignment } from "./SidebarAssignment";
import { useSidebar } from "../../contexts/SidebarContext";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const HomeSidebar = ({ preSelectedItem }: { preSelectedItem?: string }) => {
  const { currentUser } = useAuth();
  const { selectedItem, setSelectedItem } = useSidebar();

  const { data: user } = useQuery({
    queryKey: ["user", currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/user/${currentUser?.uid}`)
        .then((res) => res.data);
    },
  });

  const { data: assignments, isSuccess } = useQuery({
    queryKey: ["assignments", "year", user?.year],
    enabled: !!user?.year,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/assignments/year/${user.year}`)
        .then((res) => res.data);
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
        {isSuccess &&
          assignments.map((a) => {
            return (
              <SidebarAssignment
                name={a.name}
                pfpColor={a.pfp_color}
                subText=""
                year={a.year as unknown as 11 | 12}
                id={a.id}
                deadline={a.deadline}
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
