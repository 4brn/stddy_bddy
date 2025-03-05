import { useEffect } from "react";
import { useNotyf, type Toast } from "@/context/NotyfContext";

const Notification = ({ toast }: { toast: Toast }) => {
  const { notyf } = useNotyf()!;
  const { message, type } = toast;

  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => {
        notyf.remove(toast.id);
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <div role="alert" className={`alert ${type} alert-soft shadow-lg`}>
      <span className="text-md">{message}</span>
    </div>
  );
};

export default function Notyf() {
  const { toasts } = useNotyf()!;

  if (!toasts || toasts.length === 0) return null;

  return (
    <ul className="toast z-40">
      {toasts.map((toast) => (
        <li key={toast.id} className="flex">
          <Notification toast={toast} />
        </li>
      ))}
    </ul>
  );
}
