import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Popover menu positioned with `position: fixed` next to an anchor element,
 * so it is never clipped by scrolling containers. Closes on outside click,
 * Escape, scroll and resize.
 *
 * placement: "bottom-end" | "bottom-start" | "top-start" | "top-end"
 */
const Menu = ({
  anchorRef,
  open,
  onClose,
  placement = "bottom-end",
  width = 200,
  children,
  className = "",
  label = "Menu",
}) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current?.offsetHeight ?? 0;
    const gap = 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = placement.startsWith("top")
      ? rect.top - menuHeight - gap
      : rect.bottom + gap;
    // Flip if it would overflow the viewport
    if (top + menuHeight > vh - 8) top = rect.top - menuHeight - gap;
    if (top < 8) top = Math.min(rect.bottom + gap, vh - menuHeight - 8);

    let left = placement.endsWith("end") ? rect.right - width : rect.left;
    left = Math.max(8, Math.min(left, vw - width - 8));

    setPos({ top, left });
  }, [open, anchorRef, placement, width]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointer = (event) => {
      if (
        menuRef.current?.contains(event.target) ||
        anchorRef.current?.contains(event.target)
      ) {
        return;
      }
      onClose();
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        anchorRef.current?.focus();
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const items = [
          ...(menuRef.current?.querySelectorAll("[role=menuitem]") ?? []),
        ];
        if (!items.length) return;
        event.preventDefault();
        const index = items.indexOf(document.activeElement);
        const next =
          event.key === "ArrowDown"
            ? items[(index + 1) % items.length]
            : items[(index - 1 + items.length) % items.length];
        next.focus();
      }
    };
    const onViewport = () => onClose();
    // Only close when the anchor itself moved (its scroll container scrolled)
    const onScroll = (event) => {
      const target = event.target;
      if (target === document || target.contains?.(anchorRef.current)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onViewport);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onViewport);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label={label}
      className={`animate-pop fixed z-[80] rounded-xl border border-line bg-surface p-1 shadow-float ${className}`}
      style={{
        width,
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {children}
    </div>
  );
};

export const MenuItem = ({ icon: Icon, children, danger, onClick, ...rest }) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[14px] transition-colors duration-150 focus:outline-none ${
      danger
        ? "text-danger hover:bg-danger-soft focus-visible:bg-danger-soft"
        : "text-fg hover:bg-surface-2 focus-visible:bg-surface-2"
    }`}
    {...rest}
  >
    {Icon && <Icon size={16} strokeWidth={1.5} className="shrink-0" />}
    <span className="min-w-0 flex-1 truncate">{children}</span>
  </button>
);

export const MenuSeparator = () => <div className="my-1 h-px bg-line" />;

export default Menu;
