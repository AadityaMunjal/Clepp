import { Assignment, Question, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

enum Tabs {
  Questions = "Questions",
  Submissions = "Submissions",
}

interface QuestionsProps {
  assignmentId: string;
  showTestcases: boolean;
}

const Questions: React.FC<QuestionsProps> = ({
  assignmentId,
  showTestcases,
}) => {
  const { data: questions, isSuccess: questionsIsSuccess } = useQuery({
    queryKey: ["questions", assignmentId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/questions/${assignmentId}`)
        .then((res) => res.data as Question[]),
  });

  return (
    <div className="max-w-4xl">
      <div>
        {questionsIsSuccess && (
          <div>
            {questions?.map((q, idx) => {
              return (
                <div className="my-6">
                  <div>
                    Q{idx + 1}. {q.prompt}
                  </div>
                  {showTestcases && <div title="">{q.test_case}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
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
        .then((res) => res.data as User[]),
  });

  const { data: submitted, isSuccess: submittedIsSuccess } = useQuery({
    queryKey: ["submitted", assignmentId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/submitted/${assignmentId}`)
        .then((res) => res.data as User[]),
  });

  return (
    <div>
      {defaulters?.length !== 0 && (
        <div>
          <div>Defaulters: </div>
          {defaulters?.map((def) => {
            return <div>{def.name}</div>;
          })}
        </div>
      )}

      {submitted?.length !== 0 && (
        <div>
          <div className="text-xl mb-3">Submitted</div>
          {submitted?.map((u) => {
            return (
              <div className="flex text-center">
                <img src={u.image} alt="" className="rounded-full mr-3" />
                <div>{u.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function AdminViewAssignment() {
  const { id: assignmentId } = useParams();
  const { data: assignment } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/assignments/${assignmentId}`)
        .then((res) => res.data as Assignment),
  });

  const [activeTab, setActiveTab] = useState<Tabs>(Tabs.Questions);
  const [showTestcases, setShowTestcases] = useState<boolean>(false);

  useEffect(() => {
    console.log(showTestcases);
  }, [showTestcases]);

  return (
    <div className="bg-zinc-900 min-h-screen text-white">
      <div className="w-1/2 mx-auto">
        {/* <div>{assignment && JSON.stringify(assignment)}</div> */}
        <div className="py-8">
          <div>CLASS {assignment?.year}</div>
          <div className="text-4xl">{assignment?.name}</div>
          <div>DUE: {assignment?.deadline.toString()}</div>
        </div>
        <div className="flex w-36 mx-auto py-10">
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

        <div className="bg-zinc-800 rounded-lg p-5">
          {activeTab === Tabs.Questions ? (
            <div>
              <div className="mb-5">
                <div className="text-2xl">Questions</div>
                <input
                  type="checkbox"
                  name="Show testcases"
                  onChange={(e) => setShowTestcases(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="">Show testcases</label>
              </div>
              <Questions
                showTestcases={showTestcases}
                assignmentId={assignmentId!}
              />
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-5">Submissions</div>
              <Submissions assignmentId={assignmentId!} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
