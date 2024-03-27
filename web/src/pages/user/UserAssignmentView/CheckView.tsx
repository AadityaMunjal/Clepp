interface CheckViewProps {
  checkViewCode: string[];
  checkViewQuestions: string[];
}

const CheckView: React.FC<CheckViewProps> = ({
  checkViewCode,
  checkViewQuestions,
}) => {
  return (
    <div>
      <div>Check View</div>
      <div>
        {checkViewCode.map((c, idx) => {
          return (
            <div key={idx} className="bg-zinc-700 w-4/6 p-4 mb-8 rounded-md">
              <h2>
                Q{idx + 1}: {checkViewQuestions[idx]}
              </h2>
              <div>{c}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckView;
