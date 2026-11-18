import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../../ui/hooks/useTheme";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Compact segmented control: Light / Dark / System */
const ThemeSwitcher = ({ size = "sm" }) => {
  const { theme, setTheme } = useTheme();
  const large = size === "lg";

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={`grid grid-cols-3 gap-1 rounded-xl bg-surface-2 p-1 ${large ? "" : "text-[12.5px]"}`}
    >
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(option.value)}
            className={`flex items-center justify-center gap-1.5 rounded-lg font-medium transition ${
              large ? "h-10 text-[13.5px]" : "h-8"
            } ${
              selected
                ? "bg-surface text-fg shadow-[var(--shadow-sm)] dark:bg-surface-3"
                : "text-muted hover:text-fg"
            }`}
          >
            <Icon size={large ? 16 : 14} strokeWidth={1.5} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
