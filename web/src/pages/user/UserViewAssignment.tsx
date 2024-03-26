import { useParams } from "react-router-dom";
import HomeSidebar from "../../components/Sidebar/HomeSidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Assignment,
  Question as PrismaQuestion,
  Submission,
  User,
} from "@prisma/client";

interface SubmitViewQuestionProps {
  prompt: string;
  count: number;
}

const SubmitViewQuestion: React.FC<SubmitViewQuestionProps> = ({
  prompt,
  count,
}) => {
  return (
    <div className="bg-zinc-700 w-4/6 p-4 mb-8 rounded-md">
      <h2>
        Q{count}: {prompt}
      </h2>
    </div>
  );
};

const convertCodeToCheckView = (c: string, len: number) => {
  if (!c) return [];
  const l: string[] = [];
  for (let i = 0; i < len; i++) {
    const currQuesCode = c.split(`#Q${i + 1}`)[1].split(`#Q${i + 2}`)[0];
    console.log(currQuesCode);
    l.push(currQuesCode);
  }

  return l;
};

const UserViewAssignment: React.FC = () => {
  const queryClient = useQueryClient();

  // reset at assignmentId change
  const [view, setView] = useState<"submit" | "check">("submit");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null
  );
  const [code, setCode] = useState<string>("");
  const [validCode, setValidCode] = useState<boolean>(false);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [checkViewCode, setCheckViewCode] = useState<string[]>([]);

  const { id: assignmentId } = useParams();
  const { currentUser } = useAuth();

  const { data: fetchedUser } = useQuery({
    queryKey: ["user", currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/user/${currentUser?.uid}`)
        .then((res) => res.data as User);
    },
  });

  const { data: fetchedAssignments, isSuccess: assignmentsIsSuccess } =
    useQuery({
      queryKey: ["assignments"],
      enabled: !!fetchedUser?.year,
      queryFn: () => {
        return axios
          .get(`http://localhost:3000/assignments/year/${fetchedUser?.year}`)
          .then((res) => {
            setAssignment(
              res.data.find((a: Assignment) => a.id === assignmentId)
            );
            return res.data as Assignment[];
          });
      },
    });

  useEffect(() => {
    if (!assignmentsIsSuccess || !code) return;
  }, [assignmentsIsSuccess]);

  const { data: fetchedQuestions, isSuccess: questionsIsSuccess } = useQuery({
    queryKey: ["questions", assignmentId],
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/questions/${assignmentId}`)
        .then((res) => res.data as PrismaQuestion[]);
    },
  });

  const {
    data: fetchedSubmission,
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
        .then((res) => {
          const s = res.data[0] as Submission;
          setCurrentSubmission(s);
          return s;
        });
    },
  });

  const staticSubmission = fetchedSubmission?.code || "";

  const initialSubmissionMutation = useMutation({
    mutationFn: () => {
      return axios
        .post(
          `http://localhost:3000/submissions/${currentUser?.uid}/${assignmentId}`,
          {
            code: "",
            status: "UNRUN ".repeat(fetchedQuestions?.length || 0),
          }
        )
        .then((res) => res.data as Submission);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submission", assignmentId] });
    },
  });

  // create initial submission if not found
  useEffect(() => {
    if (submissionFetchStatus !== "idle") return;
    const err = submissionError as any;
    if (!err?.response) return;
    if (err?.response.status === 404) {
      initialSubmissionMutation.mutate();
    }
  }, [submissionError]);

  const submitSubmissionMutation = useMutation({
    mutationFn: () => {
      return axios
        .post(`http://localhost:3000/submissions/${fetchedSubmission?.id}`, {
          code,
          status: currentSubmission?.status,
        })
        .then((res) => res.data as Submission);
    },
  });

  // change assignment and code at assignmentId change
  useEffect(() => {
    if (!fetchedSubmission?.code) return;
    setAssignment(
      fetchedAssignments?.find((a) => a.id === assignmentId) || null
    );
    console.log("fetchedSubmission", fetchedSubmission);
    setCode(fetchedSubmission?.code || "");
    // setCheckViewCode(
    //   convertCodeToCheckView(
    //     fetchedSubmission?.code!,
    //     fetchedQuestions?.length || 0
    //   )
    // );
    console.log(currentSubmission);
  }, [assignmentId, submissionIsSuccess]);

  // code validation
  useEffect(() => {
    console.log(code);
    if (!code || !fetchedQuestions) return;
    validateCodeFormat(code, fetchedQuestions.length);
    setUnsavedChanges(code !== staticSubmission);
  }, [code]);

  useEffect(() => {
    console.log(checkViewCode);
  }, [checkViewCode]);

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
    setCheckViewCode(
      convertCodeToCheckView(code, fetchedQuestions?.length ?? 0)
    );
    submitSubmissionMutation.mutate();
    setView("check");
  };

  const SubmitView = () => {
    return (
      <div>
        <div>
          {questionsIsSuccess && (
            <div className="">
              {fetchedQuestions.map((q: any, idx: number) => {
                return (
                  <SubmitViewQuestion
                    prompt={q.prompt}
                    count={idx + 1}
                    key={idx}
                  />
                );
              })}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          {validCode ? (
            <div className="text-green-500">Code is valid</div>
          ) : (
            <div className="text-red-500">Code is invalid</div>
          )}
          <div className="">
            <textarea
              className="outline-none p-2 w-4/6 rounded-md text-black h-96 text-sm"
              onChange={(e) => setCode(e.target.value)}
              value={code}
              id="code"
            />
          </div>
          {unsavedChanges && <div>Unsaved changes</div>}
          <button
            className="bg-blue-600 text-white px-5 py-3 mt-4 rounded-lg"
            disabled={!validCode}
            type="submit"
          >
            {unsavedChanges ? "Save & Submit" : "Submit"}
          </button>
        </form>
      </div>
    );
  };

  const CheckView = () => {
    return (
      <div>
        <div>Check View</div>
        <div>
          {checkViewCode.map((c, idx) => {
            return (
              <div key={idx} className="bg-zinc-700 w-4/6 p-4 mb-8 rounded-md">
                <h2>
                  Q{idx + 1}: {c}
                </h2>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="flex bg-zinc-800 w-screen text-white">
        <HomeSidebar
          preSelectedItem={assignmentId}
          assignments={fetchedAssignments || null}
        />
        <div className="p-9 w-full">
          {/* {JSON.stringify(fetchedSubmission)} */}
          {assignmentsIsSuccess && (
            <div className="mb-20">
              <div className="text-3xl">{assignment?.name}</div>
              <div>
                DUE:{" "}
                {new Date(assignment?.deadline || Date.now())
                  .toDateString()
                  .split(" ")
                  .slice(1, 3)
                  .join(" ")}
              </div>
            </div>
          )}
          {assignmentsIsSuccess &&
            (view === "submit" ? <SubmitView /> : <CheckView />)}
        </div>
      </div>
    </>
  );
};

export default UserViewAssignment;
