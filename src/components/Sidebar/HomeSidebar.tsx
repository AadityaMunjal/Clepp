import { SidebarAssignment } from "./SidebarAssignment";
import { useSidebar } from "../Contexts/SidebarContext";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchAllAssignments = () => {
  return axios
    .get(`http://localhost:3000/assignments/year/${11}`)
    .then((res) => res.data);
};

const HomeSidebar = ({ preSelectedItem }: { preSelectedItem?: string }) => {
  const { selectedItem, setSelectedItem } = useSidebar();

  const { data: assignments, isSuccess } = useQuery({
    queryKey: ["assignments", "year", 11],
    queryFn: fetchAllAssignments,
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
