import { memo, useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Menu, { MenuItem, MenuSeparator } from "../../ui/components/Menu";

const ChatListItem = ({
  chat,
  active,
  generating,
  onOpen,
  onRename,
  onRequestDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chat.title);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startRename = () => {
    setMenuOpen(false);
    setDraft(chat.title);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== chat.title) onRename(chat.id, next.slice(0, 100));
  };

  if (editing) {
    return (
      <div className="px-1 py-0.5">
        <input
          ref={inputRef}
          value={draft}
          maxLength={100}
          aria-label="Chat title"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setEditing(false);
            }
          }}
          className="w-full rounded-lg border border-accent/40 bg-surface px-3 py-[7px] text-[14px] text-fg outline-none"
        />
      </div>
    );
  }

  const canManage = !chat.isTemp;

  return (
    <div className="animate-fade-in group relative">
      <button
        type="button"
        onClick={() => onOpen(chat.id)}
        onDoubleClick={canManage ? startRename : undefined}
        aria-current={active ? "page" : undefined}
        className={`flex w-full items-center gap-2 rounded-md py-2 pl-3 pr-9 text-left text-[14px] leading-[1.4] transition-colors duration-150 ease-out ${
          active
            ? "bg-surface-3 font-medium text-fg"
            : "text-fg/80 hover:bg-surface-2 hover:text-fg"
        }`}
      >
        <span className="min-w-0 flex-1 truncate">{chat.title || "New chat"}</span>
        {generating && (
          <span
            className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-accent"
            aria-label="Generating"
          />
        )}
      </button>

      {canManage && (
        <button
          ref={triggerRef}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((open) => !open);
          }}
          aria-label={`Options for ${chat.title || "chat"}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className={`absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition-opacity duration-150 hover:bg-surface-3 hover:text-fg focus-visible:opacity-100 ${
            menuOpen
              ? "opacity-100"
              : "opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
          }`}
        >
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </button>
      )}

      <Menu
        anchorRef={triggerRef}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        placement="bottom-start"
        width={168}
        label="Chat options"
      >
        <MenuItem icon={Pencil} onClick={startRename}>
          Rename
        </MenuItem>
        <MenuSeparator />
        <MenuItem
          icon={Trash2}
          danger
          onClick={() => {
            setMenuOpen(false);
            onRequestDelete(chat);
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};

export default memo(ChatListItem);
