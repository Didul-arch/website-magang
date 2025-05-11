import { ToastContentProps } from "react-toastify";

export const Msg = ({
  data,
}: {
  data: ToastContentProps<{
    title: string;
    description: string;
  }>["data"];
}) => {
  return (
    <div className="msg-container">
      <p className="font-medium">{data.title}</p>
      <p className="msg-description">{data.description}</p>
    </div>
  );
};
