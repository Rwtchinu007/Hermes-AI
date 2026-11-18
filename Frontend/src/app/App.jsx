import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useEffect } from "react";
import { useThemeSync } from "../features/ui/hooks/useTheme";
import Toaster from "../features/ui/components/Toaster";

function App() {
  const auth = useAuth();
  useThemeSync();

  useEffect(() => {
    auth.handleGetMe();
    // this process is called hydration, where we fetch the user data from the backend and set it in the Redux store when the app loads. This ensures that the user remains logged in even after a page refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
