import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";

import Avatar from "../../ui/components/Avatar";
import Menu, { MenuItem, MenuSeparator } from "../../ui/components/Menu";
import { setSettingsOpen } from "../../ui/ui.slice";
import { useAuth } from "../../auth/hooks/useAuth";
import ThemeSwitcher from "./ThemeSwitcher";

const ProfileMenu = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const triggerRef = useRef(null);

  const logout = async () => {
    setOpen(false);
    setLoggingOut(true);
    await handleLogout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        disabled={loggingOut}
        className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors duration-150 ease-out hover:bg-surface-2 ${
          open ? "bg-surface-2" : ""
        }`}
      >
        <Avatar user={user} size={26} />
        <span className="min-w-0 flex-1 truncate text-[14px] text-fg">
          {loggingOut ? "Signing out…" : user?.username || "User"}
        </span>
        <ChevronsUpDown size={15} strokeWidth={1.5} className="shrink-0 text-muted" />
      </button>

      <Menu
        anchorRef={triggerRef}
        open={open}
        onClose={() => setOpen(false)}
        placement="top-start"
        width={248}
        label="Account"
      >
        <div className="px-2.5 pb-2 pt-1.5">
          <p className="truncate text-[13px] font-medium text-fg">{user?.username}</p>
          <p className="truncate text-[12px] text-muted">{user?.email}</p>
        </div>
        <MenuSeparator />
        <div className="px-1.5 py-1.5">
          <p className="mb-1.5 px-1 text-[12px] text-muted">
            Theme
          </p>
          <ThemeSwitcher />
        </div>
        <MenuSeparator />
        <MenuItem
          icon={Settings}
          onClick={() => {
            setOpen(false);
            dispatch(setSettingsOpen(true));
          }}
        >
          Settings
        </MenuItem>
        <MenuItem icon={LogOut} onClick={logout}>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
