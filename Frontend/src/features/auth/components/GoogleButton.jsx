import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { LoaderCircle } from "lucide-react";

import { getGoogleConfig } from "../service/auth.api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../../ui/hooks/useToast";

/*
  "Continue with Google" via Google Identity Services.

  flow "code" (server has GOOGLE_OAUTH_CLIENT_SECRET):
    our own styled button -> Google popup -> one-time code -> backend
    exchanges it with Google and verifies the ID token.
  flow "id_token" (client ID only):
    Google's pre-built button -> signed ID token -> backend verifies it.

  The client secret never reaches the browser.
*/

const GIS_SRC = "https://accounts.google.com/gsi/client";

let configPromise = null;
const loadConfig = () => {
  configPromise ??= getGoogleConfig().catch(() => {
    configPromise = null;
    return { enabled: false };
  });
  return configPromise;
};

let scriptPromise = null;
const loadScript = () => {
  scriptPromise ??= new Promise((resolve, reject) => {
    if (window.google?.accounts) return resolve();
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Couldn't load Google sign-in"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};

/* Official multicolor Google "G" mark */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
    />
  </svg>
);

const buttonClass =
  "flex h-10 w-full items-center justify-center gap-2.5 rounded-md border border-white/15 bg-white/[0.06] " +
  "text-[13px] font-medium text-white transition-colors duration-150 ease-out " +
  "hover:border-white/25 hover:bg-white/[0.1] active:bg-white/[0.08] " +
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#e08d2e]/25 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

const GoogleButton = ({ remember = true, mode = "signin" }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { handleGoogleLogin } = useAuth();

  const rememberRef = useRef(remember);
  rememberRef.current = remember;
  const codeClientRef = useRef(null);
  const containerRef = useRef(null);

  // "loading" | "ready" | "disabled" | "error"
  const [status, setStatus] = useState("loading");
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(false);

  const label = mode === "signup" ? "Sign up with Google" : "Continue with Google";

  const finishLogin = async (payload) => {
    setBusy(true);
    const result = await handleGoogleLogin({ ...payload, remember: rememberRef.current });
    setBusy(false);
    if (result.ok) navigate("/", { replace: true });
    else toast.error(result.message);
  };
  const finishRef = useRef(finishLogin);
  finishRef.current = finishLogin;

  // Load config + GIS script
  useEffect(() => {
    let cancelled = false;
    loadConfig().then(async (cfg) => {
      if (cancelled) return;
      if (!cfg?.enabled || !cfg.clientId) {
        setStatus("disabled");
        return;
      }
      try {
        await loadScript();
        if (cancelled) return;
        setConfig(cfg);
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Code flow: prepare the popup client
  useEffect(() => {
    if (status !== "ready" || config?.flow !== "code") return;
    codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
      client_id: config.clientId,
      scope: "openid email profile",
      ux_mode: "popup",
      callback: (response) => {
        if (response.error || !response.code) {
          toast.error("Google sign-in was cancelled.");
          return;
        }
        finishRef.current({ code: response.code });
      },
      error_callback: (error) => {
        if (error?.type === "popup_closed") {
          toast.show("Google sign-in was cancelled.");
        } else if (error?.type === "popup_failed_to_open") {
          toast.error("Your browser blocked the Google popup. Allow popups and try again.");
        } else {
          toast.error("Google sign-in failed. Please try again.");
        }
      },
    });
  }, [status, config, toast]);

  // ID-token flow: Google's pre-built button at full form width
  useEffect(() => {
    if (status !== "ready" || config?.flow === "code" || !containerRef.current) return undefined;
    const gis = window.google.accounts.id;
    gis.initialize({
      client_id: config.clientId,
      ux_mode: "popup",
      callback: ({ credential }) => {
        if (!credential) {
          toast.error("Google sign-in was cancelled.");
          return;
        }
        finishRef.current({ credential });
      },
    });

    const container = containerRef.current;
    let lastWidth = 0;
    const render = () => {
      const width = Math.round(Math.min(400, Math.max(200, container.parentElement.clientWidth)));
      if (Math.abs(width - lastWidth) < 4) return;
      lastWidth = width;
      container.innerHTML = "";
      gis.renderButton(container, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: mode === "signup" ? "signup_with" : "continue_with",
        shape: "rectangular",
        logo_alignment: "center",
        width,
      });
    };
    render();
    const observer = new ResizeObserver(render);
    observer.observe(container.parentElement);
    return () => observer.disconnect();
  }, [status, config, mode, toast]);

  if (status === "ready" && config?.flow !== "code") {
    return (
      <div>
        <div
          ref={containerRef}
          className={`flex min-h-[40px] w-full justify-center [color-scheme:normal] ${busy ? "pointer-events-none opacity-60" : ""}`}
        />
        {busy && <p className="mt-2 text-center text-[12px] text-white/50">Signing you in…</p>}
      </div>
    );
  }

  const onClick = () => {
    if (status === "ready") {
      codeClientRef.current?.requestCode();
      return;
    }
    toast.show(
      status === "error"
        ? "Couldn't load Google sign-in. Check your connection or ad blocker."
        : "Google sign-in isn't configured on this server yet.",
    );
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={status === "loading" || busy}
      aria-busy={busy || undefined}
      className={`${buttonClass} ${status === "loading" ? "animate-pulse" : ""}`}
    >
      {busy ? (
        <>
          <LoaderCircle size={16} strokeWidth={2} className="hermes-spin" aria-hidden="true" />
          Signing you in…
        </>
      ) : (
        <>
          <GoogleIcon />
          {label}
        </>
      )}
    </button>
  );
};

export default GoogleButton;
