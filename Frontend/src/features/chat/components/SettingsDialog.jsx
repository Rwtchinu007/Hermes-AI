import { useDispatch, useSelector } from "react-redux";
import Dialog from "../../ui/components/Dialog";
import Avatar from "../../ui/components/Avatar";
import { setSettingsOpen } from "../../ui/ui.slice";
import ThemeSwitcher from "./ThemeSwitcher";

const isMac =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl";

const SHORTCUTS = [
  { keys: [mod, "Shift", "O"], label: "New chat" },
  { keys: [mod, "K"], label: "Search chats" },
  { keys: [mod, "B"], label: "Toggle sidebar" },
  { keys: ["/"], label: "Focus message box" },
  { keys: ["Enter"], label: "Send message" },
  { keys: ["Shift", "Enter"], label: "New line" },
  { keys: ["Esc"], label: "Stop generating (in message box)" },
];

const Section = ({ title, children }) => (
  <section className="border-t border-line pt-5 first:border-t-0 first:pt-0">
    <h3 className="mb-3 text-[13px] font-semibold text-fg">{title}</h3>
    {children}
  </section>
);

const Kbd = ({ children }) => (
  <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-line bg-surface-2 px-1.5 font-sans text-[11.5px] font-medium text-muted">
    {children}
  </kbd>
);

const SettingsDialog = () => {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.ui.settingsOpen);
  const user = useSelector((state) => state.auth.user);
  const close = () => dispatch(setSettingsOpen(false));

  return (
    <Dialog open={open} onClose={close} title="Settings" maxWidth={520}>
      <div className="mt-6 space-y-5">
        <Section title="Appearance">
          <ThemeSwitcher size="lg" />
          <p className="mt-2 text-[12.5px] text-muted">
            System follows your device setting. Your choice is saved on this device.
          </p>
        </Section>

        <Section title="Account">
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <Avatar user={user} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-fg">{user?.username}</p>
              <p className="truncate text-[13px] text-muted">{user?.email}</p>
            </div>
            {user?.googleId && (
              <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-muted">
                Google
              </span>
            )}
          </div>
        </Section>

        <Section title="Keyboard shortcuts">
          <ul className="space-y-2">
            {SHORTCUTS.map((shortcut) => (
              <li key={shortcut.label} className="flex items-center justify-between gap-4 text-[13.5px]">
                <span className="text-fg/85">{shortcut.label}</span>
                <span className="flex shrink-0 gap-1">
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </Dialog>
  );
};

export default SettingsDialog;
