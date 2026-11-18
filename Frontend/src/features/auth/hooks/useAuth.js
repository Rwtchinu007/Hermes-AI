import { useDispatch } from "react-redux";
import {
  register,
  login,
  getMe,
  logout,
  googleLogin,
} from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";
import { resetChatState } from "../../chat/chat.slice";
import { disconnectSocket } from "../../chat/service/chat.socket";
import { getErrorMessage } from "../../../app/errors";
import { getAuthError } from "../authErrors";

/*
  Handlers return { ok: true } or { ok: false, message } so pages can
  react (navigate / show an error) instead of guessing.
*/
export function useAuth() {
  const dispatch = useDispatch();

  async function handleRegister({ username, email, password }) {
    try {
      dispatch(setError(null));
      await register({ username, email, password });
      return { ok: true };
    } catch (error) {
      const { message, field } = getAuthError(error, "register");
      dispatch(setError(message));
      return { ok: false, message, field };
    }
  }

  async function handleLogin({ email, password, remember }) {
    try {
      dispatch(setError(null));
      const data = await login({ email, password, remember });
      dispatch(setUser(data.user));
      return { ok: true };
    } catch (error) {
      const { message, field } = getAuthError(error, "login");
      dispatch(setError(message));
      return { ok: false, message, field };
    }
  }

  async function handleGoogleLogin({ credential, code, remember }) {
    try {
      dispatch(setError(null));
      const data = await googleLogin({ credential, code, remember });
      dispatch(setUser(data.user));
      return { ok: true };
    } catch (error) {
      const { message } = getAuthError(error, "google");
      dispatch(setError(message));
      return { ok: false, message };
    }
  }

  async function handleGetMe(){
    try{
        dispatch(setLoading(true));
        const data = await getMe();
        dispatch(setUser(data.user));
    }
    catch(error){
        // 401 just means "not signed in" on first load
        if (error.response?.status !== 401) {
          dispatch(setError(getErrorMessage(error, "Failed to fetch user data")));
        }
    } finally {
        dispatch(setLoading(false));
    }
  }

  /**
   * Logout: clears the server cookie, closes the socket and removes
   * user-specific client state. Saved conversations stay on the server.
   */
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      // Still sign out locally even if the request fails
      console.error("Logout request failed:", error);
    }
    disconnectSocket();
    dispatch(resetChatState());
    dispatch(setUser(null));
    dispatch(setError(null));
  }

  return{
    handleRegister,
    handleLogin,
    handleGoogleLogin,
    handleGetMe,
    handleLogout,
  }
}
