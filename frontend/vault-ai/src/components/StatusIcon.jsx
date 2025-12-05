import Icon from "./Icon";
import Spinner from "./Spinner";

export default function StatusIcon({ status }) {
  switch (status) {
    case "processing":
      return <Spinner className="status-icon" size={14} label="Processing document" />;
    case "completed":
      return <Icon name="checkCircle" className="status-icon success" size={14} ariaLabel="Completed" />;
    case "failed":
      return <Icon name="xCircle" className="status-icon error" size={14} ariaLabel="Failed" />;
    default:
      return null;
  }
}
