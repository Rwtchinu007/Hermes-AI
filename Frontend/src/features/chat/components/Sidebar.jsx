import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PanelLeftClose, Search, SquarePen, X } from "lucide-react";

import Logo from "../../ui/components/Logo";
import { ConfirmDialog } from "../../ui/components/Dialog";
import {
  setMobileSidebarOpen,
  setPaletteOpen,
  toggleSidebar,
} from "../../ui/ui.slice";
import { useIsDesktop } from "../../ui/hooks/useMediaQuery";
import { groupChats, sortChats } from "../utils/groupChats";
import ChatListItem from "./ChatListItem";
import ProfileMenu from "./ProfileMenu";

const SIDEBAR_WIDTH = 260;
const STROKE = 1.5;

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

const ListSkeleton = () => (
  <div className="space-y-3 px-3 pt-3" aria-hidden="true">
    {[72, 56, 84, 64, 48].map((width, index) => (
      <div
        key={index}
        className="h-3.5 animate-pulse rounded-md bg-surface-3"
        style={{ width: `${width}%` }}
      />
    ))}
  </div>
);

const NavButton = ({ icon, children, onClick, hint }) => {
  const Icon = icon;
  return (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[14px] text-fg/90 transition-colors duration-150 ease-out hover:bg-surface-2 hover:text-fg"
  >
    <Icon size={17} strokeWidth={STROKE} className="shrink-0 text-muted group-hover:text-fg" />
    <span className="flex-1 text-left">{children}</span>
    {hint}
  </button>
  );
};

const Sidebar = ({ onNewChat, onOpenChat, onRenameChat, onDeleteChat }) => {
  const dispatch = useDispatch();
  const isDesktop = useIsDesktop();

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const generating = useSelector((state) => state.chat.generating);
  const listLoaded = useSelector((state) => state.chat.listLoaded);
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const mobileOpen = useSelector((state) => state.ui.mobileSidebarOpen);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const visible = isDesktop ? !collapsed : mobileOpen;

  const groups = useMemo(() => groupChats(sortChats(Object.values(chats))), [chats]);

  const closeMobile = () => dispatch(setMobileSidebarOpen(false));

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    await onDeleteChat(pendingDelete.id);
    setDeleting(false);
    setPendingDelete(null);
  };

  const hasChats = Object.keys(chats).length > 0;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={closeMobile}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-overlay transition-opacity duration-200 ease-out md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-label="Chat history"
        inert={!visible}
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 overflow-hidden border-[var(--sidebar-edge)] bg-sidebar transition-[transform,width] duration-200 ease-out md:relative md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0 shadow-float" : "-translate-x-full"
        } ${collapsed ? "md:w-0 md:border-r-0" : "md:border-r md:shadow-[var(--sidebar-edge-shadow)]"}`}
        style={{ width: isDesktop ? (collapsed ? 0 : SIDEBAR_WIDTH) : SIDEBAR_WIDTH }}
      >
        <div
          className="flex h-full flex-col pt-[env(safe-area-inset-top)]"
          style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}
        >
          {/* Header */}
          <div className="flex h-14 shrink-0 items-center justify-between pl-4 pr-2">
            <Logo size={22} />
            <button
              type="button"
              onClick={() => (isDesktop ? dispatch(toggleSidebar()) : closeMobile())}
              aria-label="Close sidebar"
              title="Close sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
            >
              {isDesktop ? (
                <PanelLeftClose size={17} strokeWidth={STROKE} />
              ) : (
                <X size={18} strokeWidth={STROKE} />
              )}
            </button>
          </div>

          {/* Primary actions */}
          <div className="space-y-0.5 px-2 pb-3">
            <NavButton icon={SquarePen} onClick={onNewChat}>
              New chat
            </NavButton>
            <NavButton
              icon={Search}
              onClick={() => dispatch(setPaletteOpen(true))}
              hint={
                <kbd className="hidden rounded-md border border-line px-1.5 py-px font-sans text-[11px] text-muted md:inline">
                  {isMac ? "⌘K" : "Ctrl K"}
                </kbd>
              }
            >
              Search chats
            </NavButton>
          </div>

          {/* Chat history */}
          <nav className="hermes-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pb-3">
            {!listLoaded && !hasChats ? (
              <ListSkeleton />
            ) : groups.length === 0 ? (
              <p className="px-3 py-4 text-[13px] leading-relaxed text-muted">
                Your conversations will appear here.
              </p>
            ) : (
              groups.map((group) => (
                <section key={group.label} className="mt-4 first:mt-1">
                  <h3 className="px-3 pb-1 text-[12px] text-muted">{group.label}</h3>
                  <div className="space-y-px">
                    {group.chats.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        active={chat.id === currentChatId}
                        generating={Boolean(generating[chat.id])}
                        onOpen={onOpenChat}
                        onRename={onRenameChat}
                        onRequestDelete={setPendingDelete}
                      />
                    ))}
                  </div>
                </section>
              ))
            )}
          </nav>

          {/* Profile */}
          <div className="shrink-0 p-2 pb-[max(8px,env(safe-area-inset-bottom))]">
            <ProfileMenu />
          </div>
        </div>
      </aside>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => !deleting && setPendingDelete(null)}
        onConfirm={confirmDelete}
        busy={deleting}
        danger
        title="Delete chat?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” and all of its messages will be permanently deleted. This can’t be undone.`
            : ""
        }
        confirmLabel="Delete"
      />
    </>
  );
};

export default Sidebar;
