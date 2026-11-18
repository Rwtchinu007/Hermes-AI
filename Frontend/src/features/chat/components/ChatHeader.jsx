import { useDispatch, useSelector } from "react-redux";
import { Menu, PanelLeftOpen, SquarePen } from "lucide-react";
import { setMobileSidebarOpen, toggleSidebar } from "../../ui/ui.slice";
import { Wordmark } from "../../ui/components/Logo";

const IconButton = ({ label, onClick, className = "", children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg ${className}`}
  >
    {children}
  </button>
);

const ChatHeader = ({ title, onNewChat }) => {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);

  return (
    <header className="flex h-14 shrink-0 items-center gap-1 px-2 pt-[env(safe-area-inset-top)] sm:px-3">
      {/* Mobile: open drawer */}
      <IconButton
        label="Open sidebar"
        onClick={() => dispatch(setMobileSidebarOpen(true))}
        className="md:hidden"
      >
        <Menu size={20} strokeWidth={1.5} />
      </IconButton>

      {/* Desktop: sidebar collapsed */}
      {collapsed && (
        <div className="hidden items-center gap-1 md:flex">
          <IconButton label="Open sidebar" onClick={() => dispatch(toggleSidebar())}>
            <PanelLeftOpen size={18} strokeWidth={1.5} />
          </IconButton>
          <IconButton label="New chat" onClick={onNewChat}>
            <SquarePen size={17} strokeWidth={1.5} />
          </IconButton>
        </div>
      )}

      <div className="min-w-0 flex-1 px-1.5">
        {title ? (
          <h2 className="truncate text-[14.5px] font-medium text-fg max-md:text-center">
            {title}
          </h2>
        ) : (
          <span className="flex max-md:justify-center md:hidden">
            <Wordmark />
          </span>
        )}
      </div>

      {/* Mobile: new chat */}
      <IconButton label="New chat" onClick={onNewChat} className="md:hidden">
        <SquarePen size={18} strokeWidth={1.5} />
      </IconButton>
    </header>
  );
};

export default ChatHeader;
