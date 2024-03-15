import { useParams } from "react-router-dom";

export default function AdminViewAssignment() {
  const { id: assignmentId } = useParams();
  return <div>{assignmentId}</div>;
}
