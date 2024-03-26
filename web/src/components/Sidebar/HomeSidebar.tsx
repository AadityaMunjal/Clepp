import { SidebarAssignment } from "./SidebarAssignment";
import { useSidebar } from "../../contexts/SidebarContext";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { Assignment } from "@prisma/client";

interface HomeSidebarProps {
  assignments: Assignment[] | null;
  preSelectedItem?: string;
}

const HomeSidebar: React.FC<HomeSidebarProps> = ({
  assignments,
  preSelectedItem,
}) => {
  const { selectedItem, setSelectedItem } = useSidebar();

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
