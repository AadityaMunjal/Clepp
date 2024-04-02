import { Question } from "@prisma/client";
import { useEffect, useState } from "react";

enum Status {
  UNRUN = "UNRUN",
  RUNNING = "RUNNING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED",
}

interface CheckViewProps {
  checkViewCode: string[];
  checkViewQuestions: Question[];
  check: boolean;
  _status: Status[];
  submissionId: string;
}

const CheckView: React.FC<CheckViewProps> = ({
  checkViewCode,
  checkViewQuestions,
  check,
  _status,
  submissionId,
}) => {
  const [checking, setChecking] = useState<boolean>(check);
  const [status, setStatus] = useState<Status[]>(_status);
  const [runIdx, setRunIdx] = useState<number>(0);

  const checkQuestion = async (code: string, q_id: string) => {
    // no caching
    const res = await fetch(`http://localhost:3000/questions/check/${q_id}`, {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return data;
  };

  const triggerChecking = async () => {
    for (let i = 0; i < checkViewQuestions.length; i++) {
      setStatus((prev) => {
        const newStatus = [...prev];
        newStatus[i] = Status.RUNNING;
        return newStatus;
      });
      checkQuestion(checkViewCode[i], checkViewQuestions[i].id).then(
        (data: { checks: boolean[]; exec_time: number }) => {
          console.log(data);
          setStatus((prev) => {
            const newStatus = [...prev];
            newStatus[i] = data.checks.includes(false)
              ? Status.FAILED
              : Status.SUCCESSFUL;
            return newStatus;
          });
        }
      );
    }

    // updateStatusMutation.mutate(status);
  };
  useEffect(() => {
    if (checking) {
      triggerChecking();
    }
  }, [checking]);
  return (
    <div>
      <div>Check View</div>
      <button onClick={() => setChecking(true)} disabled={false}>
        Check
      </button>
      <div>
        {checkViewCode.map((c, idx) => {
          return (
            <div key={idx} className="bg-zinc-700 w-4/6 p-4 mb-8 rounded-md">
              <h2>
                Q{idx + 1}: {checkViewQuestions[idx].prompt}
              </h2>
              <div>{status[idx] === Status.RUNNING && "EXECUTING"}</div>
              <div>{status[idx] === Status.SUCCESSFUL && "CORRECT!"}</div>
              <div>{status[idx] === Status.FAILED && "FAILED :("}</div>
              <div>{c}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckView;
