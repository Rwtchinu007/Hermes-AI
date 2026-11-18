import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Accessible modal dialog: Escape / backdrop to close, focus moved inside
 * on open and restored on close, Tab kept within the dialog.
 */
const Dialog = ({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 440,
  hideClose = false,
}) => {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const focusables = () =>
      panel.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );

    (panel.querySelector("[data-autofocus]") || focusables()[0] || panel).focus();

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
      }
      if (event.key === "Tab") {
        const items = [...focusables()];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-overlay backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        tabIndex={-1}
        className="animate-dialog relative max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-float outline-none sm:rounded-2xl sm:p-6"
        style={{ maxWidth }}
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="dialog-title" className="text-[17px] font-semibold tracking-tight text-fg">
              {title}
            </h2>
            {description && (
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{description}</p>
            )}
          </div>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  busy = false,
}) => (
  <Dialog open={open} onClose={onClose} title={title} description={description} hideClose>
    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        className="h-10 rounded-xl border border-line px-4 text-[14px] font-medium text-fg transition hover:bg-surface-2"
      >
        Cancel
      </button>
      <button
        type="button"
        data-autofocus
        disabled={busy}
        onClick={onConfirm}
        className={`h-10 rounded-xl px-4 text-[14px] font-medium transition disabled:opacity-60 ${
          danger
            ? "bg-danger text-white hover:opacity-90"
            : "bg-fg text-bg hover:opacity-90"
        }`}
      >
        {busy ? "Working…" : confirmLabel}
      </button>
    </div>
  </Dialog>
);

export default Dialog;
