import { Assignment, Question } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router-dom";

enum Tabs {
  Questions = "Questions",
  Submissions = "Submissions",
}

interface QuestionsProps {
  assignmentId: string;
}

const Questions: React.FC<QuestionsProps> = ({ assignmentId }) => {
  const { data: questions, isSuccess: questionsIsSuccess } = useQuery({
    queryKey: ["questions", assignmentId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/questions/${assignmentId}`)
        .then((res) => res.data as Question[]),
  });

  return (
    <div>
      <div>Questions</div>

      <div>{questionsIsSuccess && JSON.stringify(questions)}</div>
    </div>
  );
};

interface SubmissionsProps {
  assignmentId: string;
}

const Submissions: React.FC<SubmissionsProps> = ({ assignmentId }) => {
  const { data: defaulters, isSuccess: defaultersIsSuccess } = useQuery({
    queryKey: ["defaulters", assignmentId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/defaulters/${assignmentId}`)
        .then((res) => res.data as string[]),
  });

  const { data: submitted, isSuccess: submittedIsSuccess } = useQuery({
    queryKey: ["submitted", assignmentId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/submitted/${assignmentId}`)
        .then((res) => res.data as string[]),
  });

  return (
    <div>
      <div>Submissions</div>
      <div>{defaultersIsSuccess && JSON.stringify(defaulters)}</div>
      <div>{submittedIsSuccess && JSON.stringify(submitted)}</div>
    </div>
  );
};

export default function AdminViewAssignment() {
  const { id: assignmentId } = useParams();
  const { data } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/${assignmentId}`)
        .then((res) => res.data as Assignment),
  });

  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Questions);

  return (
    <div className="bg-zinc-900 min-h-screen text-white">
      <div>{data && JSON.stringify(data)}</div>
      <div className="flex m-auto">
        <ul className="hidden max-w-64 text-sm font-medium text-center rounded-lg shadow sm:flex divide-zinc-800 text-zinc-400">
          {Object.values(Tabs).map((tab) => (
            <li key={tab} className="w-full focus-within:z-10">
              <button
                onClick={() => setActiveTab(tab)}
                className={`inline-block w-full p-4 border-zinc-800 rounded-lg hover:bg-zinc-800 focus:ring-4 focus:outline-none ${
                  activeTab === tab && "bg-zinc-700"
                }`}
                aria-current="page"
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {activeTab === Tabs.Questions ? (
        <Questions assignmentId={assignmentId!} />
      ) : (
        <Submissions assignmentId={assignmentId!} />
      )}
    </div>
  );
}
