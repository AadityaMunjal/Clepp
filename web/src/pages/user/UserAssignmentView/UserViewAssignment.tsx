import { useParams } from "react-router-dom";
import HomeSidebar from "../../../components/Sidebar/HomeSidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Assignment,
  Question as PrismaQuestion,
  Submission,
  User,
} from "@prisma/client";
import SubmitView from "./SubmitView";
import CheckView from "./CheckView";

const UserViewAssignment: React.FC = () => {
  // reset at assignmentId change
  const [view, setView] = useState<"submit" | "check">("submit");
  const [assignment, setAssignment] = useState<Assignment | null>(null);

  const { id: assignmentId } = useParams();
  const { currentUser } = useAuth();

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["user", currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/user/${currentUser?.uid}`)
        .then((res) => res.data) as Promise<User>;
    },
  });

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
    fetchStatus: submissionFetchStatus,
    error: submissionError,
    isSuccess: submissionIsSuccess,
  } = useQuery({
    queryKey: ["submission", assignmentId],
    retry: 0,
    enabled: !!currentUser?.uid && !!assignmentId,
    queryFn: () => {
      return axios
        .get(
          `http://localhost:3000/submissions/${currentUser?.uid}/${assignmentId}`
        )
        .then((res) => {
          return res.data[0] as Submission;
        });
    },
  });

  // change assignment and code at assignmentId change
  useEffect(() => {
    console.log(assignmentId);
    setAssignment(
      fetchedAssignments?.find((a) => a.id === assignmentId) || null
    );
  }, [assignmentsIsSuccess, assignmentId]);

  const initialSubmissionMutation = useMutation({
    mutationFn: () => {
      return axios
        .post(
          `http://localhost:3000/submissions/create/${currentUser?.uid}/${assignmentId}`,
          {
            code: [],
            status: Array(fetchedQuestions?.length).fill("UNRUN"),
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
    if (err?.response?.status === 404) {
      initialSubmissionMutation.mutate();
    }
  }, [submissionError]);

  useEffect(() => {
    if (!submissionIsSuccess || !questionsIsSuccess) return;
    const submissionErr = submissionError as any;

    if (fetchedSubmission?.code.length === fetchedQuestions?.length) {
      setView("check");
    } else {
      setView("submit");
    }

    if (submissionErr?.response?.status === 404) {
      setView("submit");
    }
  }, [submissionIsSuccess, questionsIsSuccess, assignmentId, submissionError]);

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
            (view === "submit" ? (
              <SubmitView
                assignmentId={assignmentId}
                fetchedQuestions={fetchedQuestions || []}
                fetchedSubmission={fetchedSubmission || null}
                questionsIsSuccess={questionsIsSuccess}
                submissionError={submissionError}
                submissionFetchStatus={submissionFetchStatus}
              />
            ) : (
              <CheckView
                checkViewCode={fetchedSubmission?.code || []}
                checkViewQuestions={fetchedQuestions || []}
                check={false}
                _status={fetchedSubmission?.status || ([] as any)}
                assignmentId={assignment?.id || ""}
                submissionId={fetchedSubmission?.id || ""}
                currentUserId={currentUser?.uid || ""}
                fileName={`${assignment?.name} - ${user?.name}`}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default UserViewAssignment;
