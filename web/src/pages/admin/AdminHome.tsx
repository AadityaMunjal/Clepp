import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Assignment } from "@prisma/client";

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
    setPercentage(75);
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

      {/* <p>{assignment.year}</p> */}
    </div>
  );
};

export default function AdminDashboard() {
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const { data: assignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: fetchAllAssignments,
  });

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
      <div className="min-h-screen text-white bg-zinc-900">
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
        <div>
          <div className="ml-10 mt-24 text-2xl">Active assignments</div>
          <div className="grid grid-cols-3">
            {assignments &&
              assignments.map((a: Assignment) => {
                return <AssignmentCard assignment={a} key={a.id} />;
              })}
          </div>
          {error && <p>{error}</p>}
        </div>
      </div>
    </>
  );
}
