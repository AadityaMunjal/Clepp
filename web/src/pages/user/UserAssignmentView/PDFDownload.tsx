import { usePDF, Document, Page, Text, View, Font } from "@react-pdf/renderer";
import { useAuth } from "../../../contexts/AuthContext";
import { Assignment, Question, Submission, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

Font.register({
  family: "Poppins",
  src: "http://fonts.gstatic.com/s/poppins/v1/TDTjCH39JjVycIF24TlO-Q.ttf",
});

Font.register({
  family: "Tinos",
  src: "http://fonts.gstatic.com/s/tinos/v9/R0GUby9C7Xd7F2g6Wjdydw.ttf",
});

Font.register({
  family: "Fira",
  src: "http://fonts.gstatic.com/s/firamono/v5/SlRWfq1zeqXiYWAN-lnG-qCWcynf_cDxXwCLxiixG1c.ttf",
});

interface Render {
  user?: User;
  assignment?: Assignment;
  questions?: Question[];
  submission?: Submission;
}

export const Render: React.FC<Render> = ({
  user,
  assignment,
  questions,
  submission,
}) => {
  return (
    <Document>
      <Page
        style={{ padding: "40px", paddingLeft: "70px", paddingRight: "70px" }}
      >
        <Text
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontFamily: "Poppins",
          }}
        >
          {assignment?.name}
        </Text>
        <Text
          style={{
            fontSize: "12px",
            textAlign: "right",
            fontFamily: "Poppins",
            marginBottom: "50px",
          }}
        >
          {user?.name}
        </Text>
        <Text>
          {questions?.map((q, idx) => {
            return (
              <View key={q.id}>
                <Text
                  style={{
                    fontFamily: "Tinos",
                    fontSize: "14px",
                  }}
                >
                  Q{idx + 1}. {q.prompt}
                  &#13;&#10; &#13;&#10;
                </Text>
                <Text style={{ fontFamily: "Fira", fontSize: "13px" }}>
                  {submission?.code[idx]}
                  &#13;&#10; &#13;&#10; &#13;&#10; &#13;&#10;
                </Text>
              </View>
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
    document: <Render />,
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
