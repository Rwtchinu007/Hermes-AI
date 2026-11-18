import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, RotateCcw } from "lucide-react";
import Message from "./Message";

const NEAR_BOTTOM = 120;

const MessagesSkeleton = () => (
  <div className="space-y-8 pt-4" aria-label="Loading conversation">
    <div className="ml-auto h-10 w-2/5 animate-pulse rounded-2xl bg-surface-2" />
    <div className="space-y-2.5">
      <div className="h-3.5 w-11/12 animate-pulse rounded bg-surface-2" />
      <div className="h-3.5 w-4/5 animate-pulse rounded bg-surface-2" />
      <div className="h-3.5 w-3/5 animate-pulse rounded bg-surface-2" />
    </div>
  </div>
);

/**
 * Scrollable conversation. Follows new content only while the reader is
 * near the bottom, and offers a "scroll to bottom" button otherwise.
 */
const MessageList = ({
  chat,
  phase,
  generating,
  onRegenerate,
  onRetry,
  onFeedback,
}) => {
  const scrollRef = useRef(null);
  const atBottomRef = useRef(true);
  const [showJump, setShowJump] = useState(false);

  const messages = chat?.messages ?? [];
  const lastMessage = messages[messages.length - 1];
  const chatId = chat?.id;

  const scrollToBottom = useCallback((behavior = "auto") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const onScroll = () => {
    const el = scrollRef.current;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
    atBottomRef.current = atBottom;
    setShowJump(!atBottom);
  };

  // Opening a chat: jump to the latest message
  useLayoutEffect(() => {
    atBottomRef.current = true;
    setShowJump(false);
    scrollToBottom();
  }, [chatId, chat?.loaded, scrollToBottom]);

  // A new message was added (user sent / regenerate): follow it
  useEffect(() => {
    if (lastMessage?.role === "user" || lastMessage?.status === "streaming") {
      atBottomRef.current = true;
      scrollToBottom("smooth");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Streaming content: stay pinned only if the reader hasn't scrolled up
  useLayoutEffect(() => {
    if (atBottomRef.current) scrollToBottom();
  }, [lastMessage?.content, lastMessage?.status, scrollToBottom]);

  const handleRegenerate = useCallback(() => onRegenerate(chatId), [onRegenerate, chatId]);
  const handleRetry = useCallback((message) => onRetry(chatId, message), [onRetry, chatId]);
  const handleFeedback = useCallback(
    (message, value) => onFeedback(chatId, message, value),
    [onFeedback, chatId],
  );

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="hermes-scrollbar h-full overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto w-full max-w-[720px] px-4 pb-12 pt-8 sm:px-6 md:pt-12">
          {chat && !chat.loaded ? (
            <MessagesSkeleton />
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => (
                <Message
                  key={message.localId}
                  message={message}
                  phase={phase}
                  isLast={index === messages.length - 1}
                  canRegenerate={!generating}
                  onRegenerate={handleRegenerate}
                  onRetry={handleRetry}
                  onFeedback={handleFeedback}
                />
              ))}

              {/* Last prompt never got an answer (e.g. a failed earlier session) */}
              {!generating && lastMessage?.role === "user" && !chat.isTemp && (
                <div className="animate-fade-in flex items-center gap-3 text-[13.5px] text-muted sm:pl-10">
                  <span>No response was generated for this message.</span>
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="flex h-8 items-center gap-1.5 rounded-lg border border-line px-3 font-medium text-fg transition hover:bg-surface-2"
                  >
                    <RotateCcw size={14} strokeWidth={1.5} />
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      <button
        type="button"
        onClick={() => scrollToBottom("smooth")}
        aria-label="Scroll to latest message"
        tabIndex={showJump ? 0 : -1}
        className={`absolute bottom-3 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-surface text-fg shadow-soft transition-all duration-200 hover:bg-surface-2 ${
          showJump ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowDown size={17} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default MessageList;
