import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { removeToast } from "../ui.slice";

const ToastItem = ({ toast }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = window.setTimeout(
      () => dispatch(removeToast(toast.id)),
      toast.duration,
    );
    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id, toast.duration]);

  const Icon =
    toast.type === "error"
      ? CircleAlert
      : toast.type === "success"
        ? CircleCheck
        : null;

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className="animate-fade-up pointer-events-auto flex max-w-[min(420px,calc(100vw-32px))] items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[13.5px] text-fg shadow-float"
    >
      {Icon && (
        <Icon
          size={16}
          strokeWidth={1.5}
          className={
            toast.type === "error" ? "shrink-0 text-danger" : "shrink-0 text-success"
          }
        />
      )}
      <span className="min-w-0 flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => dispatch(removeToast(toast.id))}
        aria-label="Dismiss notification"
        className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-surface-2 hover:text-fg"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const Toaster = () => {
  const toasts = useSelector((state) => state.ui.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 sm:top-4"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default Toaster;
