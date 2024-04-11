import { Question, Submission } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";

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
    if (!c.includes(`#Q${i + 1}`) || !c.includes(`#Q${i + 2}`)) {
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

const convertArrayToCode = (a: string[]): string => {
  let s = "";
  a.map((c) => {
    s += c + "\n\n";
  });

  return s;
};

interface SubmitViewProps {
  fetchedSubmission: Submission | null;
  fetchedQuestions: Question[] | null;
  questionsIsSuccess: boolean;
  fileName: string;
}

const SubmitView: React.FC<SubmitViewProps> = ({
  fetchedQuestions,
  fetchedSubmission,
  questionsIsSuccess,
  fileName,
}) => {
  const [currentCode, setCurrentCode] = useState<string>(
    convertArrayToCode(fetchedSubmission?.code || []) || ""
  );

  useEffect(() => {
    setCurrentCode(convertArrayToCode(fetchedSubmission?.code || []) || "");
  }, [fetchedSubmission?.code]);

  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [validCode, setValidCode] = useState<boolean>(false);

  const staticSubmission =
    convertArrayToCode(fetchedSubmission?.code || []) || "";

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
    setUnsavedChanges(currentCode !== staticSubmission);
    if (!currentCode || !fetchedQuestions) return;
    setValidCode(isCodeValidForCheckView(currentCode, fetchedQuestions.length));
    console.log(convertCodeToArray(currentCode));
  }, [currentCode]);

  const downloadStarterTemplate = () => {
    const fileData = fetchedQuestions!
      .map((q, idx) => `#Q${idx + 1} ${q.prompt}`)
      .join("\n\n\n\n\n");
    const a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(
      new Blob([fileData], { type: "octet/stream" })
    );
    a.download = fileName + ".py";

    // Append anchor to body.
    document.body.appendChild(a);
    a.click();

    // Remove anchor from body
    document.body.removeChild(a);
  };

  return (
    <div>
      <div>
        <button onClick={downloadStarterTemplate}>
          Download Starter Template
        </button>
      </div>
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
        onSubmit={(e) => {
          e.preventDefault();
          if (validCode && !unsavedChanges) {
            return;
          }
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
          {validCode && unsavedChanges && "Save & Submit"}
          {validCode && !unsavedChanges && "Submit"}
          {!validCode && "Save"}
        </button>
      </form>
    </div>
  );
};

export default SubmitView;
