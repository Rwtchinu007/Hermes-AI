import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MessageSquare, Search, SquarePen } from "lucide-react";

import { setPaletteOpen } from "../../ui/ui.slice";
import { sortChats } from "../utils/groupChats";

const STROKE = 1.5;
const MAX_RESULTS = 8;

/** Short excerpt around the first match in a conversation */
function excerpt(chat, q) {
  for (const message of chat.messages) {
    const index = message.content.toLowerCase().indexOf(q);
    if (index !== -1) {
      const start = Math.max(0, index - 30);
      return (start > 0 ? "…" : "") + message.content.slice(start, index + 60).replace(/\s+/g, " ");
    }
  }
  return null;
}

/**
 * Ctrl/Cmd+K palette: search chats by title (and by content for chats
 * already loaded), or start a new chat. Keyboard: ↑ ↓ Enter Esc.
 */
const CommandPalette = ({ onOpenChat, onNewChat }) => {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.ui.paletteOpen);
  const chats = useSelector((state) => state.chat.chats);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const close = () => dispatch(setPaletteOpen(false));

  // Reset each time it opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = sortChats(Object.values(chats).filter((chat) => !chat.isTemp));
    const matches = q
      ? list
          .map((chat) => {
            const inTitle = chat.title?.toLowerCase().includes(q);
            const snippet = inTitle ? null : excerpt(chat, q);
            return inTitle || snippet ? { chat, snippet } : null;
          })
          .filter(Boolean)
      : list.map((chat) => ({ chat, snippet: null }));

    return [
      { type: "new" },
      ...matches.slice(0, MAX_RESULTS).map((match) => ({ type: "chat", ...match })),
    ];
  }, [chats, query]);

  // While searching, highlight the first matching chat (not "New chat")
  useEffect(() => {
    setActive(query.trim() ? 1 : 0);
  }, [query]);
  const safeActive = Math.min(active, items.length - 1);

  // Keep the active row in view
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const run = (item) => {
    close();
    if (item.type === "new") onNewChat();
    else onOpenChat(item.chat.id);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (items[safeActive]) run(items[safeActive]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };

  const chatCount = items.length - 1;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]">
      <div className="animate-fade-in absolute inset-0 bg-overlay" onClick={close} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search chats"
        className="animate-dialog relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line bg-surface shadow-float"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} strokeWidth={STROKE} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search chats…"
            aria-label="Search chats"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={`palette-item-${safeActive}`}
            className="h-12 min-w-0 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-muted"
          />
          <kbd className="rounded-md border border-line px-1.5 py-px text-[11px] text-muted">Esc</kbd>
        </div>

        <ul
          id="palette-results"
          ref={listRef}
          role="listbox"
          className="hermes-scrollbar max-h-[min(420px,60vh)] overflow-y-auto p-1.5"
        >
          {items.map((item, index) => {
            const selected = index === safeActive;
            const Icon = item.type === "new" ? SquarePen : MessageSquare;
            return (
              <li
                key={item.type === "new" ? "new" : item.chat.id}
                id={`palette-item-${index}`}
                data-index={index}
                role="option"
                aria-selected={selected}
                onMouseMove={() => setActive(index)}
                onClick={() => run(item)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-100 ${
                  selected ? "bg-surface-3" : ""
                }`}
              >
                <Icon size={16} strokeWidth={STROKE} className="shrink-0 text-muted" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-fg">
                    {item.type === "new" ? "New chat" : item.chat.title}
                  </p>
                  {item.snippet && (
                    <p className="truncate text-[12.5px] text-muted">{item.snippet}</p>
                  )}
                </div>
              </li>
            );
          })}

          {query && chatCount === 0 && (
            <li className="px-3 py-6 text-center text-[13.5px] text-muted">
              No chats match “{query}”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CommandPalette;
