import { useState, Dispatch } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Assignment } from "@prisma/client";

enum Stage {
  "NAME",
  "YEAR",
  "DEADLINE",
  "QUESTIONS",
}

type CreateAssignmentData = Omit<Assignment, "id" | "DOC" | "pfp_color">;

interface Questions {
  promptsState: [string[], Dispatch<React.SetStateAction<string[]>>];
  testCasesState: [string[], Dispatch<React.SetStateAction<string[]>>];
}

const Questions: React.FC<Questions> = ({ promptsState, testCasesState }) => {
  const [prompts, setPrompts] = promptsState;
  const [testCases, setTestCases] = testCasesState;
  const [promptText, setPromptText] = useState("");
  const [testCaseText, setTestCaseText] = useState("");
  return (
    <>
      <div className="text-4xl text-zinc-500 mb-2">Add questions</div>
      {/* {JSON.stringify(prompts)}
      {JSON.stringify(testCases)} */}
      <div className="flex text-zinc-900 mt-7">
        <textarea
          value={promptText}
          rows={3}
          placeholder="Enter prompt..."
          className="w-1/2 mr-8 p-2 rounded-xl outline-zinc-900"
          onChange={(e) => {
            setPromptText(e.target.value);
          }}
        />
        <textarea
          value={testCaseText}
          rows={3}
          placeholder="Enter test case..."
          className="w-1/2 ml-8 p-2 rounded-xl outline-zinc-900"
          onChange={(e) => {
            setTestCaseText(e.target.value);
          }}
        />
      </div>
      <div className="flex justify-end my-5">
        <button
          className="bg-zinc-700 px-7 py-3 rounded-md text-white"
          onClick={() => {
            setPrompts([...prompts, promptText]);
            setTestCases([...testCases, testCaseText]);
            setPromptText("");
            setTestCaseText("");
          }}
        >
          Add question
        </button>
      </div>
      <div className="bg-zinc-800">
        {prompts.map((p, idx) => (
          <div key={idx} className="border-b border-zinc-700 py-5">
            <div className="flex">
              <div className="bg-zinc-800 w-1/2 p-3 pl-0 text-sm mx-8">
                Q{idx + 1}. {p}
              </div>
              <div className="bg-zinc-900 w-1/2 p-3 pr-0 text-sm mx-8 rounded-xl">
                {testCases[idx]}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default function CreateAssignment() {
  const [stage, setStage] = useState<Stage>(0);
  const [name, setName] = useState("");
  const [year, setYear] = useState<"11" | "12">("11");
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [prompts, setPrompts] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<string[]>([]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const assignmentMutation = useMutation({
    mutationFn: (data: CreateAssignmentData) => {
      return fetch("http://localhost:3000/assignments/", {
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      navigate("/admin");
    },
  });

  const Name = () => {
    return (
      <>
        <input
          type="text"
          value={name}
          autoFocus
          placeholder="Enter assignment name..."
          className="bg-zinc-900 p-6 pl-0 w-2/3 text-4xl outline-none border-b border-zinc-400 text-zinc-400"
          onChange={(e) => setName(e.target.value)}
        />
      </>
    );
  };

  const Year = () => {
    return (
      <>
        <div className="text-4xl text-zinc-500 mb-2">Choose a class</div>
        <button
          onClick={() => setYear("11")}
          className={`my-6 text-3xl px-7 py-1 rounded-xl rounded-r-none ${
            year === "11" ? "bg-cyan-500" : "bg-zinc-800 text-zinc-400"
          }`}
        >
          11
        </button>
        <button
          onClick={() => setYear("12")}
          className={`my-6 text-3xl px-7 py-1 rounded-xl rounded-l-none ${
            year === "12" ? "bg-cyan-500" : "bg-zinc-800 text-zinc-400"
          }`}
        >
          12
        </button>
      </>
    );
  };

  const Deadline = () => {
    return (
      <>
        <div className="text-4xl text-zinc-500 mb-2">Create a deadline</div>
        <input
          type="datetime-local"
          value={deadline.toISOString().slice(0, 16)}
          className="border-none text-zinc-800 rounded-lg px-3 py-2"
          onChange={(e) => setDeadline(new Date(e.target.value))}
        />
      </>
    );
  };

  const StageComponents = [
    <Name />,
    <Year />,
    <Deadline />,
    <Questions
      promptsState={[prompts, setPrompts]}
      testCasesState={[testCases, setTestCases]}
    />,
  ];
  return (
    <div className="bg-zinc-900 min-h-screen text-white p-32 px-52">
      <div className="text-zinc-500 mb-36">
        Create a new assignment (step {stage + 1} of 4)
      </div>
      <div>{StageComponents[stage]}</div>
      <div className="mt-44">
        {stage !== 0 && (
          <button
            onClick={() => {
              setStage(stage - 1);
            }}
            className="bg-zinc-900 ring-2 ring-cyan-500 px-11 py-3 rounded-md text-white mr-32"
          >
            Previous
          </button>
        )}
        {stage !== 3 && (
          <button
            onClick={() => {
              setStage(stage + 1);
            }}
            className="bg-cyan-500 px-11 py-3 rounded-md text-white"
          >
            Continue
          </button>
        )}
        {stage === 3 && (
          <button
            onClick={() => {
              const q = prompts.map((p, idx) => ({
                prompt: p,
                test_case: testCases[idx],
              }));
              const data = { name: name.trim(), year, deadline, questions: q };
              console.log(data);
              assignmentMutation.mutate(data);
            }}
            className="bg-cyan-500 px-11 py-3 rounded-md text-white"
          >
            Create
          </button>
        )}
      </div>
    </div>
  );
}
