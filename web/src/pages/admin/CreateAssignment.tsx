import { ButtonHTMLAttributes, useReducer, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
    mutationFn: (data) => {
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
        <h3>Name</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </>
    );
  };

  const Year = () => {
    return (
      <>
        <h3>Year</h3>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value as "11" | "12")}
        >
          <option value="11">11</option>
          <option value="12">12</option>
        </select>
      </>
    );
  };

  const Deadline = () => {
    return (
      <>
        <h3>Deadline</h3>
        <input
          type="datetime-local"
          value={deadline.toISOString().slice(0, 16)}
          onChange={(e) => setDeadline(new Date(e.target.value))}
        />
      </>
    );
  };

  const Questions = () => {
    return (
      <>
        <h3>Questions</h3>
        {JSON.stringify(questions)}
        {questions.map((question, index) => (
          <div key={index}>
            <h4>Question {index + 1}</h4>
            <input
              type="text"
              value={question.prompt}
              onChange={(e) =>
                dispatch({
                  type: "prompt_change",
                  index,
                  nextPrompt: e.target.value,
                })
              }
            />
            <input
              type="text"
              value={question.test_case}
              onChange={(e) =>
                dispatch({
                  type: "testcase_change",
                  index,
                  nextTestcases: e.target.value,
                })
              }
            />
          </div>
        ))}
        <button
          onClick={() => {
            dispatch({ type: "add_blank_question" });
          }}
        >
          Add question
        </button>
      </>
    );
  };

  const StageComponents = [<Name />, <Year />, <Deadline />, <Questions />];
  return (
    <div className="bg-zinc-800 h-screen text-white">
      <h2>Create a new assignment (step {stage + 1} of 4)</h2>
      {StageComponents[stage]}
      {stage !== 0 && (
        <button
          onClick={() => {
            setStage(stage - 1);
          }}
        >
          Previous
        </button>
      )}
      {stage !== 3 && (
        <Button
          onClick={() => {
            setStage(stage + 1);
          }}
        >
          Next
        </Button>
      )}
      {stage === 3 && (
        <Button
          onClick={() => {
            const data = { name, year, deadline, questions };
            console.log(data);
            assignmentMutation.mutate(data);
          }}
        >
          Create
        </Button>
      )}
    </div>
  );
}
