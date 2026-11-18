import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useNavigate, useParams } from "react-router";

import { useChat, useChatSocket } from "../hooks/useChat";
import { setCurrentChatId } from "../chat.slice";
import {
  addToast,
  setMobileSidebarOpen,
  setPaletteOpen,
  toggleSidebar,
} from "../../ui/ui.slice";
import { useIsDesktop } from "../../ui/hooks/useMediaQuery";

import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import Composer from "../components/Composer";
import EmptyState from "../components/EmptyState";
import MessageList from "../components/MessageList";
import SettingsDialog from "../components/SettingsDialog";
import CommandPalette from "../components/CommandPalette";

const isTypingTarget = (el) =>
  el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable;

const Dashboard = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const navigate = useNavigate();
  const { chatId: routeChatId } = useParams();
  const isDesktop = useIsDesktop();

  // Subscribe to streaming events once for the whole page
  useChatSocket();
  const chat = useChat();
  // Stable callbacks for memoized children
  const chatRef = useRef(chat);
  chatRef.current = chat;

  const [chatInput, setChatInput] = useState("");
  const composerRef = useRef(null);

  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const listLoaded = useSelector((state) => state.chat.listLoaded);
  const phase = useSelector((state) =>
    currentChatId ? state.chat.generating[currentChatId] : undefined,
  );

  const currentChat = currentChatId ? chats[currentChatId] : null;
  const generating = Boolean(phase);
  const hasMessages = Boolean(currentChat?.messages.length) || (currentChat && !currentChat.loaded);

  // ==========================================
  // GET ALL CHATS
  // ==========================================
  useEffect(() => {
    chatRef.current.handleGetChats();
  }, []);

  // ==========================================
  // URL -> OPEN CHAT
  // /c/:chatId deep-links a conversation so it survives a refresh
  // ==========================================
  useEffect(() => {
    const state = store.getState().chat;

    if (!routeChatId) {
      // Keep an optimistic chat that's still being created
      if (!String(state.currentChatId).startsWith("temp-")) {
        dispatch(setCurrentChatId(null));
      }
      return;
    }

    if (routeChatId === state.currentChatId) return;
    if (!listLoaded) return;

    if (!state.chats[routeChatId]) {
      dispatch(addToast({ message: "That conversation no longer exists", type: "error" }));
      navigate("/", { replace: true });
      return;
    }

    chatRef.current.handleOpenChat(routeChatId);
  }, [routeChatId, listLoaded, dispatch, navigate, store]);

  const focusComposer = useCallback(() => {
    // Avoid popping the keyboard open on phones
    if (isDesktop) composerRef.current?.focus();
  }, [isDesktop]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleNewChat = useCallback(() => {
    dispatch(setCurrentChatId(null));
    dispatch(setMobileSidebarOpen(false));
    setChatInput("");
    navigate("/");
    requestAnimationFrame(focusComposer);
  }, [dispatch, navigate, focusComposer]);

  const handleOpenChat = useCallback(
    (id) => {
      dispatch(setMobileSidebarOpen(false));
      navigate(`/c/${id}`);
    },
    [dispatch, navigate],
  );

  const handleRenameChat = useCallback(
    (id, title) => chatRef.current.handleRenameChat(id, title),
    [],
  );

  const handleDeleteChat = useCallback(
    async (id) => {
      const wasOpen = store.getState().chat.currentChatId === id;
      const ok = await chatRef.current.handleDeleteChat(id);
      if (ok && wasOpen) navigate("/", { replace: true });
    },
    [navigate, store],
  );

  // After the server creates a new chat, move the URL to it
  const followNewChat = useCallback(
    (result) => {
      if (result?.chatId && store.getState().chat.currentChatId === result.chatId) {
        navigate(`/c/${result.chatId}`, { replace: true });
      }
    },
    [navigate, store],
  );

  const handleSubmitMessage = async () => {
    const message = chatInput.trim();
    if (!message || generating) return;

    setChatInput("");
    const isNew = !currentChatId;
    const result = await chat.handleSendMessage({ message, chatId: currentChatId });
    if (isNew) followNewChat(result);
  };

  const handleRetry = useCallback(
    async (id, message) => {
      const wasTemp = String(id).startsWith("temp-");
      const result = await chatRef.current.handleRetry(id, message);
      if (wasTemp) followNewChat(result);
    },
    [followNewChat],
  );

  const handleRegenerate = useCallback((id) => chatRef.current.handleRegenerate(id), []);
  const handleFeedback = useCallback(
    (id, message, value) => chatRef.current.handleFeedback(id, message, value),
    [],
  );
  const handleStop = () => chat.handleStopGeneration(currentChatId);

  const handleSuggestion = (prompt) => {
    setChatInput(prompt);
    requestAnimationFrame(() => {
      const el = composerRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(prompt.length, prompt.length);
    });
  };

  // Focus the composer when switching conversations (desktop)
  useEffect(() => {
    focusComposer();
  }, [currentChatId, focusComposer]);

  // ==========================================
  // KEYBOARD SHORTCUTS
  // ==========================================
  useEffect(() => {
    const onKey = (event) => {
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (mod && event.shiftKey && key === "o") {
        event.preventDefault();
        handleNewChat();
      } else if (mod && !event.shiftKey && key === "k") {
        event.preventDefault();
        dispatch(setPaletteOpen(!store.getState().ui.paletteOpen));
      } else if (mod && !event.shiftKey && key === "b") {
        event.preventDefault();
        dispatch(toggleSidebar());
      } else if (key === "/" && !mod && !isTypingTarget(document.activeElement)) {
        event.preventDefault();
        composerRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, handleNewChat, store]);

  const composer = (
    <Composer
      value={chatInput}
      onChange={setChatInput}
      onSubmit={handleSubmitMessage}
      onStop={handleStop}
      generating={generating}
      inputRef={composerRef}
      placeholder={hasMessages ? "Reply to Hermes" : "How can I help you today?"}
      footer={hasMessages ? "Hermes can make mistakes. Check important information." : null}
    />
  );

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-bg text-fg">
      <Sidebar
        onNewChat={handleNewChat}
        onOpenChat={handleOpenChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
      />

      <section className="relative flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title={hasMessages ? currentChat?.title : null}
          onNewChat={handleNewChat}
        />

        {hasMessages ? (
          <>
            <MessageList
              chat={currentChat}
              phase={phase}
              generating={generating}
              onRegenerate={handleRegenerate}
              onRetry={handleRetry}
              onFeedback={handleFeedback}
            />

            <div className="relative shrink-0 px-3 pb-[max(8px,env(safe-area-inset-bottom))] sm:px-6">
              {/* Fade the conversation into the composer */}
              <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-bg to-transparent" />
              <div className="mx-auto w-full max-w-[720px]">{composer}</div>
            </div>
          </>
        ) : (
          <div className="hermes-scrollbar min-h-0 flex-1 overflow-y-auto">
            <EmptyState composer={composer} onSuggestion={handleSuggestion} />
          </div>
        )}
      </section>

      <SettingsDialog />
      <CommandPalette onOpenChat={handleOpenChat} onNewChat={handleNewChat} />
    </main>
  );
};

export default Dashboard;
