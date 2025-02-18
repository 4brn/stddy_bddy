import { useState, useEffect } from "react";

export type ToastType = {
  type: "error" | "success" | "";
  message: string;
};

export default function Toast({ type, message }: ToastType) {
  const [isToastVisible, setIsToastVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsToastVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isToastVisible]);

  return (
    isToastVisible && (
      <div className="toast toast-end">
        <div role="alert" className={`alert alert-${type} alert-soft`}>
          <span>{message}</span>
        </div>
      </div>
    )
  );
}
