import { memo } from "react";
import {
  Check,
  CircleAlert,
  Copy,
  Globe,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

const STROKE = 1.5;

import MarkdownRenderer from "../../../app/MarkdownRenderer";
import { HermesMark } from "../../ui/components/Logo";
import { useCopy } from "../../ui/hooks/useCopy";

const PHASE_LABEL = {
  waiting: "Thinking",
  searching: "Searching the web",
  streaming: "Writing",
};

/** Shown while waiting for the first token. Driven by real socket events. */
export const ThinkingIndicator = ({ phase }) =>
  phase === "searching" ? (
    <div className="flex h-7 items-center gap-2 text-[14px] text-muted" role="status" aria-live="polite">
      <Globe size={15} strokeWidth={STROKE} className="animate-pulse" />
      <span className="hermes-shimmer-text">{PHASE_LABEL.searching}…</span>
    </div>
  ) : (
    <div className="flex h-7 items-center" role="status" aria-live="polite">
      <span className="hermes-dots flex items-center gap-1" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="sr-only">{PHASE_LABEL[phase] || "Thinking"}…</span>
    </div>
  );

const ActionButton = ({ label, onClick, active, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    data-tip={label}
    aria-pressed={active}
    className={`hermes-tip flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-fg ${
      active ? "text-fg" : "text-muted"
    }`}
  >
    {children}
  </button>
);

const CopyButton = ({ text, label = "Copy" }) => {
  const [copied, copy] = useCopy();
  return (
    <ActionButton label={copied ? "Copied" : label} onClick={() => copy(text)}>
      {copied ? (
        <Check size={15} strokeWidth={STROKE} className="hermes-check text-success" />
      ) : (
        <Copy size={15} strokeWidth={STROKE} />
      )}
    </ActionButton>
  );
};

// ==========================================
// USER MESSAGE
// ==========================================

const UserMessage = ({ message }) => (
  <div className="animate-fade-up group flex flex-col items-end">
    <div className="max-w-[80%] rounded-2xl border border-bubble-border bg-bubble px-4 py-2.5 shadow-bubble text-[15px] leading-[1.6] text-fg">
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
    </div>
    <div className="mt-1 flex opacity-100 transition-opacity duration-150 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 focus-within:opacity-100">
      <CopyButton text={message.content} label="Copy message" />
    </div>
  </div>
);

// ==========================================
// ASSISTANT MESSAGE
// ==========================================

const AssistantMessage = ({
  message,
  phase,
  isLast,
  canRegenerate,
  onRegenerate,
  onRetry,
  onFeedback,
}) => {
  const streaming = message.status === "streaming";
  const failed = message.status === "error";
  const stopped = message.status === "stopped";
  const finished = !streaming && !failed;
  const waitingForFirstToken = streaming && !message.content;

  return (
    <div className="animate-fade-up group flex gap-3 sm:gap-4">
      <HermesMark size={26} className="mt-0.5 !hidden sm:!inline-flex" />

      <div className="min-w-0 flex-1">
        {waitingForFirstToken ? (
          <ThinkingIndicator phase={phase} />
        ) : (
          message.content && (
            <div className="hermes-prose">
              <MarkdownRenderer content={message.content} />
              {streaming && <span className="hermes-caret" aria-hidden="true" />}
            </div>
          )
        )}

        {stopped && (
          <p className="mt-2 text-[13px] italic text-muted">
            {message.content ? "Response stopped." : "Response stopped before Hermes replied."}
          </p>
        )}

        {failed && (
          <div
            role="alert"
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-2.5 text-[13.5px] text-fg ${
              message.content ? "mt-3" : ""
            }`}
          >
            <CircleAlert size={16} strokeWidth={STROKE} className="shrink-0 text-danger" />
            <span className="min-w-0 flex-1">{message.error || "Something went wrong."}</span>
            {message.retry && (
              <button
                type="button"
                onClick={() => onRetry(message)}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-fg transition hover:bg-surface-2"
              >
                <RotateCcw size={14} strokeWidth={STROKE} />
                {message.retry.type === "reload" ? "Reload" : "Retry"}
              </button>
            )}
          </div>
        )}

        {finished && message.content && (
          <div className="-ml-1.5 mt-2 flex items-center gap-0.5 opacity-100 transition-opacity duration-150 ease-out focus-within:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
            <CopyButton text={message.content} label="Copy response" />
            {message.id && (
              <>
                <ActionButton
                  label="Good response"
                  active={message.feedback === "like"}
                  onClick={() => onFeedback(message, "like")}
                >
                  <ThumbsUp
                    size={15}
                    strokeWidth={STROKE}
                    fill={message.feedback === "like" ? "currentColor" : "none"}
                  />
                </ActionButton>
                <ActionButton
                  label="Bad response"
                  active={message.feedback === "dislike"}
                  onClick={() => onFeedback(message, "dislike")}
                >
                  <ThumbsDown
                    size={15}
                    strokeWidth={STROKE}
                    fill={message.feedback === "dislike" ? "currentColor" : "none"}
                  />
                </ActionButton>
              </>
            )}
            {isLast && canRegenerate && (
              <ActionButton label="Regenerate response" onClick={onRegenerate}>
                <RotateCcw size={15} strokeWidth={STROKE} />
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Message = ({ message, ...props }) =>
  message.role === "user" ? (
    <UserMessage message={message} />
  ) : (
    <AssistantMessage message={message} {...props} />
  );

export default memo(Message);
