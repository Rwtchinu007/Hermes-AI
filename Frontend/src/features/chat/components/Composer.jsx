import { useLayoutEffect, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

const MAX_HEIGHT = 220;

/**
 * Message composer: auto-growing textarea, Enter to send,
 * Shift+Enter for a new line, Stop button while generating.
 * The keyboard hint sits below the card and only shows on focus;
 * otherwise `footer` (e.g. the disclaimer) is shown in that spot.
 */
const Composer = ({
  value,
  onChange,
  onSubmit,
  onStop,
  generating,
  inputRef,
  placeholder = "Message Hermes",
  autoFocus = false,
  footer = null,
}) => {
  const [focused, setFocused] = useState(false);
  const canSend = value.trim().length > 0 && !generating;

  // Grow with content up to MAX_HEIGHT, then scroll
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? "auto" : "hidden";
  }, [value, inputRef]);

  const submit = (event) => {
    event?.preventDefault();
    if (canSend) onSubmit();
  };

  const hint = generating ? "Esc to stop generating" : "Shift + Enter for a new line";

  return (
    <form onSubmit={submit} className="w-full">
      <div
        className={`flex items-end gap-2 rounded-2xl border bg-surface py-2 pl-4 pr-2 shadow-[var(--shadow-sm)] transition-colors duration-150 ease-out ${
          focused ? "border-accent/40 shadow-blue" : "border-line hover:border-blue-line"
        }`}
      >
        <label htmlFor="hermes-composer" className="sr-only">
          Message Hermes
        </label>
        <textarea
          id="hermes-composer"
          ref={inputRef}
          rows={1}
          value={value}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
            if (event.key === "Escape" && generating) {
              event.preventDefault();
              onStop();
            }
          }}
          placeholder={placeholder}
          className="hermes-scrollbar block max-h-[220px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-fg outline-none placeholder:text-muted"
        />

        {generating ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generating"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-opacity duration-150 hover:opacity-85"
          >
            <Square size={12} fill="currentColor" strokeWidth={0} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            title="Send message"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-[background-color,opacity,transform] duration-150 ease-out hover:scale-105 hover:opacity-90 active:scale-95 disabled:hover:scale-100 disabled:bg-surface-3 disabled:text-muted disabled:hover:opacity-100"
          >
            <ArrowUp size={18} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Hint (on focus) / footer, sharing one line so nothing jumps */}
      <div className="relative mt-2 h-4 text-center text-[12px] leading-4 text-muted">
        <span
          className={`absolute inset-0 transition-opacity duration-150 ${focused ? "opacity-100" : "opacity-0"}`}
          aria-hidden={!focused}
        >
          {hint}
        </span>
        {footer && (
          <span
            className={`absolute inset-0 transition-opacity duration-150 ${focused ? "opacity-0" : "opacity-100"}`}
          >
            {footer}
          </span>
        )}
      </div>
    </form>
  );
};

export default Composer;
