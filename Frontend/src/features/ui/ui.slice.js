import { createSlice } from "@reduxjs/toolkit";

const THEME_KEY = "hermes-theme";
const SIDEBAR_KEY = "hermes-sidebar-collapsed";

const readStorage = (key, fallback) => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — keep in memory only */
  }
};

let toastId = 0;

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    // "light" | "dark" | "system"
    theme: readStorage(THEME_KEY, "system"),
    // Desktop sidebar collapsed state (persisted)
    sidebarCollapsed: readStorage(SIDEBAR_KEY, "false") === "true",
    // Mobile drawer open state (not persisted)
    mobileSidebarOpen: false,
    settingsOpen: false,
    paletteOpen: false,
    toasts: [],
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
      writeStorage(THEME_KEY, action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      writeStorage(SIDEBAR_KEY, String(state.sidebarCollapsed));
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload;
    },
    setSettingsOpen: (state, action) => {
      state.settingsOpen = action.payload;
    },
    setPaletteOpen: (state, action) => {
      state.paletteOpen = action.payload;
    },
    addToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload);
        // Keep the stack short
        if (state.toasts.length > 4) state.toasts.shift();
      },
      prepare: ({ message, type = "default", duration = 3200 }) => ({
        payload: { id: ++toastId, message, type, duration },
      }),
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setMobileSidebarOpen,
  setSettingsOpen,
  setPaletteOpen,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
