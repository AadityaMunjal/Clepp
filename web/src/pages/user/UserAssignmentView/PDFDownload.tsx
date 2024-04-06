import { usePDF, Document, Page, Text } from "@react-pdf/renderer";
import { useAuth } from "../../../contexts/AuthContext";
import { Assignment, Question, Submission, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

interface Render {
  user: User | null;
  assignment: Assignment | null;
  questions: Question[] | null;
  submission: Submission | null;
}

const Render: React.FC<Render> = ({
  user,
  assignment,
  questions,
  submission,
}) => {
  return (
    <Document>
      <Page>
        <Text>HEllwo {user?.name}</Text>
        <Text>{assignment?.name}</Text>
        <Text>
          {questions?.map((q, idx) => {
            return (
              <div key={idx}>
                <Text>{q.prompt}</Text>
                <Text>{submission?.code[idx]}</Text>
              </div>
            );
          })}
        </Text>
      </Page>
    </Document>
  );
};

interface PDFDownload {
  fileName: string;
}

const PDFDownload: React.FC<PDFDownload> = ({ fileName }) => {
  const { currentUser } = useAuth();
  const { id: assignmentId } = useParams();

  const [instance, updateInstance] = usePDF({
    document: (
      <Render
        user={null}
        assignment={null}
        questions={null}
        submission={null}
      />
    ),
  });

  const { data: user, isSuccess: userIsSuccess } = useQuery({
    queryKey: ["user", currentUser?.uid],
    enabled: !!currentUser?.uid,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/user/${currentUser?.uid}`)
        .then((res) => res.data as User);
    },
  });

  const { data: assignment, isSuccess: assignmentIsSuccess } = useQuery({
    queryKey: ["assignments"],
    enabled: !!user?.year && !!assignmentId,
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/assignments/year/${user?.year}`)
        .then((res) => {
          return res.data.find(
            (a: Assignment) => a.id === assignmentId
          ) as Assignment;
        });
    },
  });

  const { data: questions, isSuccess: questionsIsSuccess } = useQuery({
    queryKey: ["questions", assignmentId],
    queryFn: () => {
      return axios
        .get(`http://localhost:3000/questions/${assignmentId}`)
        .then((res) => res.data as Question[]);
    },
  });

  const { data: submission, isSuccess: submissionIsSuccess } = useQuery({
    queryKey: ["submission", assignmentId],
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

  useEffect(() => {
    if (
      !userIsSuccess ||
      !assignmentIsSuccess ||
      !questionsIsSuccess ||
      !submissionIsSuccess
    )
      return;

    updateInstance(
      <Render
        user={user || null}
        assignment={assignment || null}
        questions={questions || null}
        submission={submission || null}
      />
    );
  }, [
    userIsSuccess,
    assignmentIsSuccess,
    questionsIsSuccess,
    submissionIsSuccess,
  ]);

  if (instance.loading) return <div>Loading ...</div>;

  if (instance.error) return <div>Something went wrong</div>;

  return (
    <a href={instance.url || ""} download={`${fileName}.pdf`}>
      Download PDF
    </a>
  );
};

export default PDFDownload;
