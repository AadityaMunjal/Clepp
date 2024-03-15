import { SidebarAssignment } from "./SidebarAssignment";
import { useSidebar } from "../Contexts/SidebarContext";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchAllAssignments = () => {
  return axios.get("http://localhost:3000/assignments").then((res) => res.data); // change this to classwise
};

const AdminSidebar = ({ preSelectedItem }: { preSelectedItem?: string }) => {
  const { selectedItem, setSelectedItem } = useSidebar();

  const { data: assignments, isSuccess } = useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAllAssignments,
  });

  useEffect(() => {
    console.log(preSelectedItem);
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

export default AdminSidebar;
