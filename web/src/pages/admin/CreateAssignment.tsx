import { ButtonHTMLAttributes, useReducer, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Assignment } from "@prisma/client";

interface ButtonProps {
  props: ButtonHTMLAttributes<HTMLButtonElement>;
  children: React.ReactNode | string;
}

const Button: React.FC<ButtonProps> = ({ props, children }) => {
  return (
    <button
      className="bg-cyan-500 px-11 py-3 rounded-md text-white"
      onClick={() => console.log()}
    >
      {children}
    </button>
  );
};

function questionsReducer(state: any, action: any) {
  switch (action.type) {
    case "prompt_change": {
      return [
        ...state.slice(0, action.index),
        {
          ...state[action.index],
          prompt: action.nextPrompt,
        },
        ...state.slice(action.index + 1),
      ];
    }

    case "testcase_change": {
      return [
        ...state.slice(0, action.index),
        {
          ...state[action.index],
          test_case: action.nextTestcases,
        },
        ...state.slice(action.index + 1),
      ];
    }
    case "add_blank_question": {
      return [...state, { prompt: "", test_case: "" }];
    }
  }
  throw Error("Unknown action: " + action.type);
}

enum Stage {
  "NAME",
  "YEAR",
  "DEADLINE",
  "QUESTIONS",
}

type CreateAssignmentData = Omit<Assignment, "id" | "DOC" | "pfp_color">;

export default function CreateAssignment() {
  const [stage, setStage] = useState<Stage>(0);
  const [name, setName] = useState("");
  const [year, setYear] = useState<"11" | "12">("11");
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [questions, dispatch] = useReducer(questionsReducer, [
    { prompt: "", test_case: "" },
  ]);

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

  const Questions = () => {
    return (
      <>
        <div className="text-4xl text-zinc-500 mb-2">Add questions</div>
        {JSON.stringify(questions)}
        <div className="bg-zinc-800">
          {questions.map((question, index) => (
            <div key={index} className="border-b border-zinc-700 py-5">
              <div>Q{index + 1}. </div>
              <div className="flex">
                <input
                  type="text"
                  value={question.prompt}
                  className="bg-zinc-800 text-white outline-none w-1/2 p-3 text-sm mx-8"
                  onChange={(e) =>
                    dispatch({
                      type: "prompt_change",
                      index,
                      nextPrompt: e.target.value,
                    })
                  }
                />
                <textarea
                  value={question.test_case}
                  rows={question.test_case.split("\n").length + 1}
                  className="bg-zinc-900 text-white outline-none w-1/2 p-3 text-sm mx-8 rounded-xl"
                  onChange={(e) =>
                    dispatch({
                      type: "testcase_change",
                      index,
                      nextTestcases: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              dispatch({ type: "add_blank_question" });
            }}
          >
            Add another question
          </button>
        </div>
      </>
    );
  };

  const StageComponents = [<Name />, <Year />, <Deadline />, <Questions />];
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
              const data = { name, year, deadline, questions };
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
