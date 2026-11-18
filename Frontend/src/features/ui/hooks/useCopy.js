import { useCallback, useEffect, useRef, useState } from "react";

/** Copy text to the clipboard; `copied` stays true for a moment after. */
export function useCopy(resetMs = 1800) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), resetMs);
        return true;
      } catch (error) {
        console.error("Copy failed:", error);
        return false;
      }
    },
    [resetMs],
  );

  return [copied, copy];
}
