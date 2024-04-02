import { Question } from "@prisma/client";

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

interface SubmitViewProps {
  questionsIsSuccess: boolean;
  fetchedQuestions?: Question[];
  handleSubmit: (e: any) => void;
}

const SubmitView: React.FC<SubmitViewProps> = ({
  questionsIsSuccess,
  fetchedQuestions,
  handleSubmit,
}) => {
  const code = "";
  const setCode = (_: any) => {};
  const validCode = true;
  const unsavedChanges = false;
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

export default SubmitView;
