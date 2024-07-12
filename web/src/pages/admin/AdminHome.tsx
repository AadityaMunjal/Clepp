import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Assignment } from "@prisma/client";
import AdminNavbar from "./AdminNavbar";

const fetchAllAssignments = () => {
  return axios
    .get("http://localhost:3000/assignments")
    .then((res) => res.data as Assignment[]);
};

interface AssignmentCardProps {
  assignment: Assignment;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const date: Date = new Date(assignment.deadline);
  const readableDate: string = date
    .toDateString()
    .split(" ")
    .slice(1, 3)
    .join(" ");
  const navigate = useNavigate();

  const [percentage, setPercentage] = useState(0);

  const {
    data: defaulters,
    isSuccess: defaultersIsSuccess,
    isLoading: defaultersIsLoading,
  } = useQuery({
    queryKey: ["defaulters", assignment.id],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/defaulters/${assignment.id}`)
        .then((res) => res.data) as Promise<string[]>,
  });

  const { data: submitted, isSuccess: submittedIsSuccess } = useQuery({
    queryKey: ["submitted", assignment.id],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/submitted/${assignment.id}`)
        .then((res) => res.data) as Promise<string[]>,
  });

  useEffect(() => {
    if (!defaultersIsSuccess || !submittedIsSuccess) return;
    const percentageSubmitted =
      (submitted.length / (defaulters.length + submitted.length)) * 100;
    setPercentage(percentageSubmitted);
  }, [defaultersIsSuccess, submittedIsSuccess]);

  return (
    <div
      onClick={() => {
        navigate(`/admin/assignment/${assignment.id}`);
      }}
      className="bg-zinc-800 min-h-36 ml-10 mr-10 mt-20 rounded-lg p-4 cursor-pointer"
    >
      <div className="flex justify-between">
        <div>
          <div className="text-2xl">{assignment.name}</div>
          <div className="text-sm">Class {assignment.year}</div>
          <div className="text-sm">
            {defaulters &&
              defaultersIsSuccess &&
              `${defaulters.length} left for submission`}
            {defaultersIsLoading && "Loading..."}
          </div>
        </div>

        <div className="bg-zinc-600 rounded-lg h-8 text-center p-1">
          <span className="font-semibold">DUE: </span>
          {readableDate}
        </div>
      </div>

      <div className="w-full bg-zinc-200 rounded-full h-2.5 mt-12">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: assignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAllAssignments,
  });

  return (
    <>
      <div className="min-h-screen text-white bg-zinc-900">
        <AdminNavbar />
        <div>
          <div className="ml-10 mt-24 text-2xl">Active assignments</div>
          <div className="grid grid-cols-3">
            {assignments &&
              assignments.map((a: Assignment) => {
                return <AssignmentCard assignment={a} key={a.id} />;
              })}
          </div>
        </div>
      </div>
    </>
  );
}
