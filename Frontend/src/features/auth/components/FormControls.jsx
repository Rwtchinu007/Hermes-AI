import { useState } from "react";
import { CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";

/*
  Glass-style controls for the auth pages (always on the dark artwork).
  One shape for every control: 40px tall, 6px radius (sharp, not pill).
  One type scale: 12.5px labels, 14px input/button text.
*/

const controlShape = "h-10 rounded-md";

const inputClass =
  `${controlShape} w-full border border-white/15 bg-white/[0.04] px-3 text-[13px] text-white outline-none ` +
  "transition-[border-color,background-color,box-shadow] duration-150 ease-out placeholder:text-white/30 " +
  "hover:border-white/25 focus:border-[#e08d2e]/60 focus:bg-white/[0.06] focus:ring-[3px] focus:ring-[#e08d2e]/15 " +
  "aria-[invalid=true]:border-red-400/60";

/**
 * Label + control + inline error. `attempt` re-triggers the shake each time
 * the form is submitted with this field still invalid.
 */
export const Field = ({ label, id, hint, error, attempt = 0, children }) => (
  <div className="min-w-0">
    <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-white/70">
      {label}
    </label>
    {children}
    {error ? (
      <p key={attempt} id={`${id}-error`} className="hermes-shake mt-1 text-[11.5px] leading-snug text-red-300">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-[11.5px] text-white/40">{hint}</p>
    )}
  </div>
);

export const TextInput = ({ id, invalid, ...props }) => (
  <input
    id={id}
    aria-invalid={invalid ? "true" : undefined}
    aria-describedby={invalid ? `${id}-error` : undefined}
    className={inputClass}
    {...props}
  />
);

export const PasswordInput = ({ id, invalid, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        aria-invalid={invalid ? "true" : undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={`${inputClass} pr-10`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-white/45 transition-colors hover:bg-white/10 hover:text-white"
      >
        {visible ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
      </button>
    </div>
  );
};

/**
 * Primary action. While loading, the label stays in place (invisible) under
 * a spinner so the button doesn't change size.
 */
export const SubmitButton = ({ loading, loadingLabel = "Please wait", children, ...props }) => (
  <button
    type="submit"
    disabled={loading}
    aria-busy={loading || undefined}
    className={`${controlShape} relative flex w-full items-center justify-center bg-white text-[13px] font-semibold text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_20px_rgba(224,141,46,0.15)] transition-[transform,background-color,box-shadow] duration-150 ease-out hover:-translate-y-px hover:bg-[#f4f1ec] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_8px_26px_rgba(224,141,46,0.25)] active:translate-y-0 active:bg-[#e9e6e0] ${
      loading ? "cursor-wait hover:translate-y-0" : ""
    }`}
    {...props}
  >
    <span className={loading ? "invisible" : ""}>{children}</span>
    {loading && (
      <span className="absolute inset-0 flex items-center justify-center">
        <LoaderCircle size={17} strokeWidth={2} className="hermes-spin" aria-hidden="true" />
        <span className="sr-only">{loadingLabel}</span>
      </span>
    )}
  </button>
);

export const FormError = ({ message, attempt = 0 }) =>
  message ? (
    <div
      key={attempt}
      role="alert"
      className="hermes-shake flex items-start gap-2.5 rounded-md border border-red-400/25 bg-red-500/10 px-3 py-2.5 text-[12.5px] text-white/90"
    >
      <CircleAlert size={15} strokeWidth={1.5} className="mt-0.5 shrink-0 text-red-300" />
      <span>{message}</span>
    </div>
  ) : null;

export const Divider = ({ label = "or" }) => (
  <div className="my-4 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-white/35" role="separator">
    <span className="h-px flex-1 bg-white/12" />
    {label}
    <span className="h-px flex-1 bg-white/12" />
  </div>
);
