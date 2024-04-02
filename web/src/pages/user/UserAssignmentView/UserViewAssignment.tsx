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
  const queryClient = useQueryClient();

  // reset at assignmentId change
  const [view, setView] = useState<"submit" | "check">("submit");
  const [assignment, setAssignment] = useState<Assignment | null>(null);

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
    enabled: !!currentUser?.uid,
    retry: 0,
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

  useEffect(() => {
    if (!fetchedSubmission?.code) return;
    if (
      // isCodeValidForCheckView(
      // fetchedSubmission?.code!.toString(),
      // fetchedQuestions?.length || 0
      true
      // )
    ) {
      // setView("check");
      // setCheckViewCode(
      //   convertCodeToCheckView(
      //     fetchedSubmission?.code,
      //     fetchedQuestions?.length ?? 0
      //   )
      // );
    } else {
      setView("submit");
    }
  }, [fetchedSubmission?.code, assignmentId]);

  const staticSubmission = fetchedSubmission?.code || "";

  const initialSubmissionMutation = useMutation({
    mutationFn: () => {
      return axios
        .post(
          `http://localhost:3000/submissions/${currentUser?.uid}/${assignmentId}`,
          {
            code: "",
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
  // useEffect(() => {
  //   if (submissionFetchStatus !== "idle") return;
  //   const err = submissionError as any;
  //   if (!err?.response) return;
  //   if (err?.response.status === 404) {
  //     initialSubmissionMutation.mutate();
  //   }
  // }, [submissionError]);

  // const submitSubmissionMutation = useMutation({
  //   mutationFn: () => {
  //     return axios
  //       .post(`http://localhost:3000/submissions/${fetchedSubmission?.id}`, {
  //         code: convertCodeToCheckView(code, fetchedQuestions?.length || 0),
  //         status: fetchedSubmission?.status,
  //       })
  //       .then((res) => res.data as Submission);
  //   },
  // });

  // change assignment and code at assignmentId change
  useEffect(() => {
    if (!fetchedSubmission?.code) return;
    setAssignment(
      fetchedAssignments?.find((a) => a.id === assignmentId) || null
    );
    console.log("fetchedSubmission", fetchedSubmission);
    // setCode(fetchedSubmission?.code || "");
  }, [assignmentId]);

  useEffect(() => {
    if (!submissionIsSuccess || !questionsIsSuccess) return;

    if (fetchedSubmission?.code.length === fetchedQuestions?.length) {
      setView("check");
    } else {
      setView("submit");
    }
  }, [submissionIsSuccess, questionsIsSuccess, assignmentId]);

  // code validation
  // TODO: rewrite this in submitview
  // useEffect(() => {
  //   if (!code || !fetchedQuestions) return;
  //   validateCodeFormat(code, fetchedQuestions.length);
  //   setUnsavedChanges(code !== staticSubmission);
  // }, [code]);

  const handleSubmit = () => {
    // submitSubmissionMutation.mutate();
    setView("check");
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
            (view === "submit" ? (
              <SubmitView
                fetchedQuestions={fetchedQuestions}
                handleSubmit={handleSubmit}
                questionsIsSuccess={questionsIsSuccess}
              />
            ) : (
              <CheckView
                checkViewCode={fetchedSubmission?.code || []}
                checkViewQuestions={fetchedQuestions || []}
                check={false}
                _status={fetchedSubmission?.status || ([] as any)}
                submissionId={fetchedSubmission?.id || ""}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default UserViewAssignment;
