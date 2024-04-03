import { Question } from "@prisma/client";
import { useEffect, useState } from "react";
import { SlOptions as Loading } from "react-icons/sl";
import { IoCheckmarkDone as Check } from "react-icons/io5";
import { VscError as Failed } from "react-icons/vsc";

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
  const [currentCode, setCurrentCode] = useState<string[]>(checkViewCode);

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
      await checkQuestion(checkViewCode[i], checkViewQuestions[i].id).then(
        (data: { checks: boolean[]; exec_time: number }) => {
          console.log(data);
          setStatus((prev) => {
            const newStatus = [...prev];
            newStatus[i] = data.checks?.includes(false)
              ? Status.FAILED
              : Status.SUCCESSFUL;
            return newStatus;
          });
        }
      );
    }

    setChecking(false);
    // updateStatusMutation.mutate(status);
  };
  useEffect(() => {
    console.log("c", checkViewCode);
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
            <div
              key={idx}
              className={`bg-zinc-700 w-4/6 p-4 mb-8 rounded-md ring-2 ${
                status[idx] === Status.UNRUN && "ring-zinc-600"
              }
              ${status[idx] === Status.RUNNING && "ring-yellow-500"}
              ${status[idx] === Status.SUCCESSFUL && "ring-green-500"}
              ${status[idx] === Status.FAILED && "ring-red-500"}
              `}
            >
              <div className="flex justify-between mb-2">
                <h2>
                  Q{idx + 1}: {checkViewQuestions[idx].prompt}
                </h2>
                <div className="">
                  {status[idx] === Status.RUNNING && (
                    <Loading size={24} color="yellow" />
                  )}
                  {status[idx] === Status.SUCCESSFUL && (
                    <Check size={24} color="#22f23a" />
                  )}
                  {status[idx] === Status.FAILED && (
                    <Failed size={24} color="red" />
                  )}
                </div>
              </div>
              <textarea
                rows={c.split("\n").length}
                className="p-2 bg-zinc-900 rounded-md text-gray-200 text-sm"
                defaultValue={c}
                onChange={(e) => {
                  setCurrentCode((prev) => {
                    const newCode = [...prev];
                    newCode[idx] = e.target.value;
                    return newCode;
                  });

                  setStatus((prev) => {
                    const newStatus = [...prev];
                    newStatus[idx] = Status.UNRUN;
                    return newStatus;
                  });
                }}
                value={currentCode[idx]}
              />
              <div className="bg-yellow-600 rounded-sm text-white">
                {c !== currentCode[idx] && "Code changed!"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckView;
