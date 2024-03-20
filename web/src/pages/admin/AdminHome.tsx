import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchAllAssignments = () => {
  return axios.get("http://localhost:3000/assignments").then((res) => res.data);
};

const AssignmentCard = ({ assignment }) => {
  const date = new Date(assignment.deadline);
  const readableDate = date.toDateString().split(" ").slice(1, 3).join(" ");
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
        .then((res) => res.data),
  });

  const { data: submitted, isSuccess: submittedIsSuccess } = useQuery({
    queryKey: ["submitted", assignment.id],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/submitted/${assignment.id}`)
        .then((res) => res.data),
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
      className="bg-zinc-700 min-h-36 ml-10 mr-10 mt-20 rounded-lg p-4 cursor-pointer"
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

        <div className="bg-blue-500 rounded-lg h-8 text-center p-1">
          <span className="font-semibold">DUE: </span>
          {readableDate}
        </div>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-12">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* <p>{assignment.year}</p> */}
    </div>
  );
};

export default function UserDashboard() {
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
      <div className="min-h-screen text-white bg-zinc-800">
        <h2 className="text-center mb-4">ADMIN DASHBOARD</h2>
        <nav>
          <Link to="/admin/create">Create assignment</Link>
          <Link to="/admin/add-users">Add users</Link>
          <button onClick={handleLogout}>Log Out</button>
        </nav>
        <div>
          <div>Active assignments</div>
          <div className="grid grid-cols-3">
            {assignments &&
              assignments.map((a) => {
                return <AssignmentCard assignment={a} key={a.id} />;
              })}
          </div>
          {error && <p>{error}</p>}
        </div>
      </div>
    </>
  );
}
