import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../ui.slice";

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

export const resolveTheme = (pref) =>
  pref === "dark" || (pref === "system" && media().matches) ? "dark" : "light";

function applyTheme(resolved, animate) {
  const root = document.documentElement;
  if (root.dataset.theme === resolved) return;

  if (animate) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 260);
  }
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
}

/**
 * Keeps <html data-theme> in sync with the stored preference.
 * Mount once (App). Initial value is applied in index.html to avoid a flash.
 */
export function useThemeSync() {
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    applyTheme(resolveTheme(theme), true);

    if (theme !== "system") return undefined;

    const mq = media();
    const onChange = () => applyTheme(resolveTheme("system"), true);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);
}

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  return {
    theme,
    setTheme: (value) => dispatch(setTheme(value)),
  };
}
