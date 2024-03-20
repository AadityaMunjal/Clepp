import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../contexts/SidebarContext";

export interface SidebarAssignmentProps {
  id: string;
  name: string;
  subText: string;
  year: "11" | "12";
  pfpColor: string;
  deadline: string;
  selected: boolean;
}

export const SidebarAssignment: React.FC<SidebarAssignmentProps> = ({
  id,
  name,
  year,
  pfpColor,
  deadline,
  selected,
}) => {
  const { setSelectedItem } = useSidebar();
  const navigate = useNavigate();

  const date = new Date(deadline);
  const readableDate = date.toDateString().split(" ").slice(1, 3).join(" ");

  return (
    <div
      className="bg-zinc-800 m-3 pr-2 pl-2 pt-3 pb-3 rounded-lg cursor-pointer border-2"
      style={{ borderColor: selected ? pfpColor : "transparent" }}
      onClick={() => {
        setSelectedItem(id);
        navigate(`/assignment/${id}`);
      }}
    >
      <div className="flex">
        <div
          className="flex items-center justify-center p-9 w-7 h-7 rounded-full"
          style={{ backgroundColor: pfpColor }}
        >
          {year}
        </div>
        <div className="flex items-center m-4">{name}</div>
        <div>{readableDate}</div>
      </div>
    </div>
  );
};
