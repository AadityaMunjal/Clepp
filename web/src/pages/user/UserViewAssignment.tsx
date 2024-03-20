import { useParams } from "react-router-dom";
import HomeSidebar from "../../components/Sidebar/HomeSidebar";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Question = ({ prompt, count }) => {
  return (
    <div className="bg-zinc-700 w-4/6 p-4 mb-8 rounded-md">
      <h2>
        Q{count}: {prompt}
      </h2>
    </div>
  );
};

export default function UserViewAssignment() {
  const { id: assignmentId } = useParams();
  const { currentUser } = useAuth();

  const { data: assignment, isSuccess: assignmentIsSuccess } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/assignments/${assignmentId}`)
        .then((res) => res.data);
    },
  });

  const { data: questions, isSuccess: questionsIsSuccess } = useQuery({
    queryKey: ["questions", assignmentId],
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/questions/${assignmentId}`)
        .then((res) => res.data);
    },
  });

  const [code, setCode] = useState("");
  const [validCode, setValidCode] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (questions?.length) {
      setStatus("UNRUN ".repeat(questions.length));
    }
  }, [questions]);

  const {
    data: submission,
    isSuccess: submissionIsSuccess,
    fetchStatus: submissionFetchStatus,
    error: submissionError,
  } = useQuery({
    queryKey: ["submission", assignmentId],
    enabled: !!currentUser?.uid,
    retry: 0,
    queryFn: () => {
      return axios
        .get(
          `http://localhost:3000/submissions/${currentUser?.uid}/${assignmentId}`
        )
        .then((res) => res.data[0]);
    },
  });

  const createInitialSubmission = useMutation({
    mutationFn: () => {
      return axios
        .post(
          `http://localhost:3000/submissions/${currentUser?.uid}/${assignmentId}`,
          {
            code: "",
            status: "",
          }
        )
        .then((res) => res.data);
    },
  });

  const submitSubmission = useMutation({
    mutationFn: () => {
      return axios
        .post(
          `http://localhost:3000/submissions/${currentUser?.uid}/${assignmentId}`,
          {
            code,
            status,
          }
        )
        .then((res) => res.data);
    },
  });

  useEffect(() => {
    if (submissionFetchStatus !== "idle") return;
    const err = submissionError as any;
    if (err?.response.status === 404) {
      createInitialSubmission.mutate();
    }
  }, [submissionError]);

  useEffect(() => {
    if (!submissionIsSuccess) return;
    console.log(submission);
    setCode(submission.code);
  }, [submissionIsSuccess]);

  useEffect(() => {
    if (!code || !questions) return;
    validateCodeFormat(code, questions.length);
  }, [code]);

  const validateCodeFormat = (c: string, _q_no: number) => {
    return setValidCode(true);
    const l = c.split(`\n`);
    l.map((line, idx: number) => {
      const st_with = `#Q${idx + 1}`;
      console.log(st_with);
      if (!line.startsWith(st_with)) {
        setValidCode(false);
        return;
      }
    });
  };

  const handleSubmit = () => {
    // const b = JSON.stringify({ c: code });
    // fetch("http://127.0.0.1:5000/execute", {
    //   body: b,
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // });
    submitSubmission.mutate();
  };

  return (
    <>
      <div className="flex bg-zinc-800 w-screen text-white">
        <HomeSidebar preSelectedItem={assignmentId} />
        <div className="p-9 w-full">
          {JSON.stringify(submission)}
          {assignmentIsSuccess && (
            <div>
              <div className="mb-20">
                <div className="text-3xl">{assignment.name}</div>
                <div>
                  DUE:{" "}
                  {new Date(assignment.deadline)
                    .toDateString()
                    .split(" ")
                    .slice(1, 3)
                    .join(" ")}
                </div>
              </div>
              {questionsIsSuccess && (
                <div className="">
                  {questions.map((q: any, idx: number) => {
                    return (
                      <Question prompt={q.prompt} count={idx + 1} key={idx} />
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="">
            <textarea
              className="outline-none p-2 w-4/6 rounded-md text-black h-96 text-sm"
              onChange={(e) => setCode(e.target.value)}
              value={code}
            />
          </div>
          <button
            className="bg-blue-600 text-white px-5 py-3 mt-4 rounded-lg"
            disabled={!validCode}
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
