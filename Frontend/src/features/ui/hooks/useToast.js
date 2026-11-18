import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { addToast } from "../ui.slice";

export function useToast() {
  const dispatch = useDispatch();

  const show = useCallback(
    (message, type = "default") => dispatch(addToast({ message, type })),
    [dispatch],
  );

  return useMemo(
    () => ({
      show,
      success: (message) => show(message, "success"),
      error: (message) => show(message, "error"),
    }),
    [show],
  );
}
