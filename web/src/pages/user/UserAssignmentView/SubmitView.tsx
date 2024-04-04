import { Question, Submission } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

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

const isCodeValidForCheckView = (c: string, len: number) => {
  if (!c) return false;
  for (let i = 0; i < len - 1; i++) {
    if (
      !c.toUpperCase().includes(`#Q${i + 1}`) ||
      !c.toUpperCase().includes(`#Q${i + 2}`)
    ) {
      return false;
    }
  }

  return true;
};

const convertCodeToArray = (c: string): string[] => {
  const pattern = /(#Q\d+)/g;
  const parts = c
    .split(pattern)
    .map((s) => s.trim())
    .filter(Boolean);
  const result: string[] = [];

  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i + 1]) {
      result.push(parts[i] + "\n" + parts[i + 1]);
    }
  }

  return result;
};

interface SubmitViewProps {
  assignmentId: string | undefined;
  fetchedSubmission: Submission | null;
  submissionFetchStatus: string;
  submissionError: any;
  fetchedQuestions: Question[] | null;
  questionsIsSuccess: boolean;
}

const SubmitView: React.FC<SubmitViewProps> = ({
  assignmentId,
  fetchedQuestions,
  fetchedSubmission,
  submissionFetchStatus,
  submissionError,
  questionsIsSuccess,
}) => {
  const [currentCode, setCurrentCode] = useState<string>(
    fetchedSubmission?.code?.toString() || ""
  );
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [validCode, setValidCode] = useState<boolean>(false);

  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

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
          code: convertCodeToArray(currentCode),
          status: fetchedSubmission?.status,
        })
        .then((res) => res.data as Submission);
    },
  });

  // code validation
  useEffect(() => {
    setUnsavedChanges(currentCode !== staticSubmission.toString());
    if (!currentCode || !fetchedQuestions) return;
    setValidCode(isCodeValidForCheckView(currentCode, fetchedQuestions.length));
  }, [currentCode]);

  return (
    <div>
      <div>
        {questionsIsSuccess && (
          <div className="">
            {fetchedQuestions?.map((q: any, idx: number) => {
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
      <form
        onSubmit={() => {
          submitSubmissionMutation.mutate();
        }}
      >
        {validCode ? (
          <div className="text-green-500">Code is complete</div>
        ) : (
          <div className="text-red-500">Code is incomplete</div>
        )}
        <div className="">
          <textarea
            className="outline-none p-2 w-4/6 rounded-md text-black h-96 text-sm"
            onChange={(e) => setCurrentCode(e.target.value)}
            value={currentCode}
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

export default SubmitView;
