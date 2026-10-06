import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  ArrowUp,
  Menu,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";

import { useChat } from "../hooks/useChat";

import MarkdownRenderer from "../../../app/MarkdownRenderer";

import audex from "../../../assets/auth_assets/fonts/Audex-Regular.otf";

import { setCurrentChatId } from "../chat.slice";

const Dashboard = () => {
  const dispatch = useDispatch();

  const chat = useChat();

  const [chatInput, setChatInput] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chats = useSelector((state) => state.chat.chats);

  const currentChatId = useSelector((state) => state.chat.currentChatId);

  const user = useSelector((state) => state.auth.user);

  // ==========================================
  // GET ALL CHATS
  // ==========================================

  useEffect(() => {
    chat.handleGetChats();
  }, []);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const handleSubmitMessage = (event) => {
    event.preventDefault();

    const trimmedMessage = chatInput.trim();

    if (!trimmedMessage) {
      return;
    }

    chat.handleSendMessage({
      message: trimmedMessage,
      chatId: currentChatId,
    });

    setChatInput("");
  };

  // ==========================================
  // NEW CHAT
  // ==========================================

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));

    setChatInput("");

    setOpenMenu(null);

    setSidebarOpen(false);
  };

  // ==========================================
  // OPEN CHAT
  // ==========================================

  const openChat = (chatId) => {
    chat.handleOpenChat(chatId, chats);

    setOpenMenu(null);

    setSidebarOpen(false);
  };

  // ==========================================
  // DELETE CHAT
  // ==========================================

  const handleDeleteChat = async (chatId) => {
    setOpenMenu(null);

    await chat.handleDeleteChat(chatId);
  };

  // ==========================================
  // CHAT LIST
  // ==========================================

  const chatList = Object.values(chats || {});

  // ==========================================
  // RANDOM GREETING
  // ==========================================

  const greetings = [
    "How can I help?",
    "What’s on your mind?",
    "What shall we work on?",
    "Ready when you are.",
    "Where should we start?",
    "What are you curious about?",
    "Let’s build something.",
    "What can we figure out?",
    "What would you like to explore?",
    "What are we working on today?",
  ];

  const [greeting] = useState(() => {
    return greetings[Math.floor(Math.random() * greetings.length)];
  });

  return (
    <>
      {/* ==========================================
          AUDEX FONT + SCROLLBAR
      ========================================== */}

      <style>
        {`
          @font-face {
            font-family: 'Audex';
            src: url(${audex}) format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          /* ==========================================
             HERMES SCROLLBAR
          ========================================== */

          .hermes-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #3a3a3a transparent;
          }

          .hermes-scrollbar::-webkit-scrollbar {
            width: 7px;
          }

          .hermes-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }

          .hermes-scrollbar::-webkit-scrollbar-thumb {
            background: #3a3a3a;
            border-radius: 999px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }

          .hermes-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #e08d2e;
            border: 2px solid transparent;
            background-clip: padding-box;
          }

          .hermes-scrollbar::-webkit-scrollbar-corner {
            background: transparent;
          }

          /* ==========================================
             EMPTY STATE
          ========================================== */

          .hermes-empty-state {
            transition:
              opacity 420ms ease,
              transform 550ms cubic-bezier(0.22, 1, 0.36, 1);
          }

          .hermes-empty-state.chat-started {
            opacity: 0;
            transform: translateY(-70px) scale(0.97);
            pointer-events: none;
          }

          /* ==========================================
             CHAT CONTENT
          ========================================== */

          .hermes-chat-content {
            transition:
              transform 600ms cubic-bezier(0.22, 1, 0.36, 1),
              opacity 350ms ease;
          }

          .hermes-chat-content.chat-entering {
            animation: hermesChatEnter 550ms
              cubic-bezier(0.22, 1, 0.36, 1);
          }

          @keyframes hermesChatEnter {
            0% {
              opacity: 0;
              transform: translateY(45px);
            }

            55% {
              opacity: 1;
              transform: translateY(-6px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* ==========================================
             USER MESSAGE
          ========================================== */

          .hermes-user-message {
            animation: hermesUserMessage 420ms
              cubic-bezier(0.22, 1, 0.36, 1);
          }

          @keyframes hermesUserMessage {
            0% {
              opacity: 0;
              transform: translateY(28px) scale(0.97);
            }

            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          /* ==========================================
             AI MESSAGE
          ========================================== */

          .hermes-ai-message {
            animation: hermesAiMessage 450ms
              cubic-bezier(0.22, 1, 0.36, 1);
          }

          @keyframes hermesAiMessage {
            0% {
              opacity: 0;
              transform: translateY(18px);
            }

            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* ==========================================
             MOBILE COMPOSER FIX
          ========================================== */

          .hermes-mobile-composer {
            position: absolute;
          }

          @media (max-width: 767px) {
            .hermes-mobile-composer {
              position: fixed !important;

              left: 0;
              right: 0;
              bottom: 0;

              z-index: 30;

              padding-bottom: max(
                12px,
                env(safe-area-inset-bottom)
              );
            }
          }

          /* ==========================================
             REDUCE MOTION
          ========================================== */

          @media (prefers-reduced-motion: reduce) {
            .hermes-empty-state,
            .hermes-chat-content,
            .hermes-user-message,
            .hermes-ai-message {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>

      {/* ==========================================
          MAIN
      ========================================== */}

      <main
        className="
          min-h-[100dvh]
          w-full
          overflow-hidden
          bg-[#181818]
          text-[#eeeeee]
          font-[system-ui]
        "
      >
        <div className="flex h-[100dvh] w-full overflow-hidden">
          {/* ==========================================
              MOBILE SIDEBAR OVERLAY
          ========================================== */}

          {sidebarOpen && (
            <div
              className="
                fixed
                inset-0
                z-40
                bg-black/50
                md:hidden
              "
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* ==========================================
              SIDEBAR
          ========================================== */}

          <aside
            className={`
              fixed
              inset-y-0
              left-0
              z-50

              flex
              w-[280px]
              flex-col

              border-r
              border-[#e08d2e6f]

              bg-[#0f0e0e]

              transition-transform
              duration-200

              md:relative
              md:z-0
              md:translate-x-0

              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* ==========================================
                LOGO
            ========================================== */}

            <div className="flex h-20 items-center px-5">
              <h1
                className="
                  font-[Audex]
                  text-[24px]
                  font-normal
                  tracking-tight
                  text-[#e08d2e]
                "
              >
                Hermes
                <span className="font-sans text-white/70">.ai</span>
              </h1>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
                className="
                  ml-auto
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-[#777777]
                  transition
                  hover:bg-[#292929]
                  hover:text-white
                  md:hidden
                "
              >
                <X size={20} strokeWidth={1.8} />
              </button>
            </div>

            {/* ==========================================
                NEW CHAT
            ========================================== */}

            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={handleNewChat}
                aria-label="Start a new chat"
                className="
                  flex
                  w-full
                  items-center
                  gap-3

                  rounded-xl
                  border
                  border-[#3a3a3a]
                  bg-[#252525]

                  px-4
                  py-3

                  text-left
                  text-sm
                  font-medium
                  text-[#eeeeee]

                  transition
                  hover:bg-[#2b2b2b]
                "
              >
                <Plus size={18} strokeWidth={1.9} />

                <span>Chat</span>
              </button>
            </div>

            {/* ==========================================
                CHAT LIST
            ========================================== */}

            <div
              className="
                hermes-scrollbar
                flex-1
                overflow-y-auto
                px-3
                pb-4
              "
            >
              {chatList.length === 0 ? (
                <div
                  className="
                    px-3
                    py-6
                    text-sm
                    text-[#777777]
                  "
                >
                  No chats yet
                </div>
              ) : (
                <div className="space-y-1">
                  {chatList.map((chatItem) => {
                    const isActive = currentChatId === chatItem.id;

                    return (
                      <div key={chatItem.id} className="group relative">
                        {/* CHAT */}

                        <button
                          type="button"
                          onClick={() => openChat(chatItem.id)}
                          className={`
                            flex
                            w-full
                            items-center

                            rounded-lg

                            px-3
                            py-2.5
                            pr-10

                            text-left
                            text-sm

                            transition

                            ${
                              isActive
                                ? "border-l-2 border-[#e08d2e] bg-[#2b2722] pl-[10px] text-white shadow-[inset_0_0_18px_rgba(224,141,46,0.05)]"
                                : "border-l-2 border-transparent text-[#b5b5b5] hover:bg-[#292929] hover:text-[#eeeeee]"
                            }
                          `}
                        >
                          <span className="truncate">
                            {chatItem.title || "New chat"}
                          </span>
                        </button>

                        {/* THREE DOT */}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            setOpenMenu(
                              openMenu === chatItem.id ? null : chatItem.id,
                            );
                          }}
                          aria-label="Chat options"
                          className={`
                            absolute
                            right-2
                            top-1/2

                            flex
                            h-7
                            w-7

                            -translate-y-1/2

                            items-center
                            justify-center

                            rounded-md
                            text-[#777777]

                            opacity-0
                            transition

                            group-hover:opacity-100

                            hover:bg-[#353535]
                            hover:text-white

                            max-md:opacity-100

                            ${
                              openMenu === chatItem.id
                                ? "bg-[#353535] text-white opacity-100"
                                : ""
                            }
                          `}
                        >
                          <MoreHorizontal size={18} strokeWidth={2} />
                        </button>

                        {/* DELETE MENU */}

                        {openMenu === chatItem.id && (
                          <div
                            className="
                              absolute
                              right-2
                              top-10
                              z-20

                              w-36

                              rounded-lg
                              border
                              border-[#3a3a3a]
                              bg-[#242424]

                              p-1

                              shadow-xl
                            "
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleDeleteChat(chatItem.id)}
                              className="
                                flex
                                w-full
                                items-center
                                gap-2.5

                                rounded-md

                                px-3
                                py-2

                                text-left
                                text-sm
                                text-[#d0d0d0]

                                transition

                                hover:bg-[#303030]
                                hover:text-white
                              "
                            >
                              <Trash2 size={16} strokeWidth={1.8} />

                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ==========================================
                USER INFO
            ========================================== */}

            <div className="p-2">
              <div
                className="
                  flex
                  items-center
                  gap-3

                  rounded-r-2xl
                  rounded-l-2xl

                  border
                  border-white/[0.07]

                  bg-[#141414]

                  px-3
                  py-3

                  shadow-[0_4px_18px_rgba(0,0,0,0.16)]

                  transition

                  hover:border-[#e08d2e7d]
                  hover:bg-[#1b1a19]
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    border
                    border-[#e08d2e22]

                    bg-[#252321]

                    text-[#a0a0a0]
                  "
                >
                  <User size={17} strokeWidth={1.8} />
                </div>

                <div className="min-w-0">
                  <p
                    className="
                      truncate
                      text-sm
                      font-medium
                      text-[#eeeeee]
                    "
                  >
                    {user?.username || "User"}
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-xs
                      text-[#777777]
                    "
                  >
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ==========================================
              MAIN CHAT AREA
          ========================================== */}

          <section
            className="
              hermes-dashboard
              relative
              flex
              min-w-0
              flex-1
              flex-col
              text-[#ececec]
            "
            style={{
              background: `
                linear-gradient(
                  180deg,
                  #111111 0%,
                  #0e0e0e 50%,
                  #0b0b0b 100%
                )
              `,
            }}
          >
            {/* ==========================================
                MOBILE HEADER
            ========================================== */}

            <header
              className="
                flex
                h-14
                shrink-0
                items-center

                border-b
                border-[#292929]

                px-3

                md:hidden
              "
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center

                  rounded-lg

                  text-[#8f8f8f]

                  transition

                  hover:bg-[#242424]
                  hover:text-[#eeeeee]

                  active:scale-95
                "
              >
                <Menu size={20} strokeWidth={1.8} />
              </button>

              <div
                className="
                  ml-2
                  flex
                  items-center
                  text-[18px]
                  leading-none
                "
              >
                <span
                  className="
                    font-[Audex]
                    text-[#e08d2e]
                  "
                >
                  Hermes
                </span>

                <span
                  className="
                    ml-[1px]
                    font-[system-ui]
                    text-[#8b8b8b]
                  "
                >
                  .ai
                </span>
              </div>
            </header>

            {/* ==========================================
                MESSAGES AREA
            ========================================== */}

            <div
              className="
                hermes-scrollbar
                min-h-0
                flex-1
                overflow-y-auto
              "
            >
              <div
                className={`
                  relative
                  mx-auto
                  flex
                  w-full
                  max-w-[860px]

                  flex-col

                  px-4
                  pb-40

                  sm:px-6
                  md:px-8

                  transition-all
                  duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]

                  ${
                    currentChatId
                      ? "pt-6 sm:pt-8 md:pt-10"
                      : "pt-6 sm:pt-8 md:pt-12"
                  }
                `}
              >
                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                <div
                  className={`
                    hermes-empty-state

                    flex
                    min-h-[62vh]

                    flex-col
                    items-center
                    justify-center

                    px-4

                    text-center

                    ${
                      currentChatId
                        ? "chat-started absolute inset-x-0 top-0"
                        : ""
                    }
                  `}
                >
                  {/* FAVICON */}

                  <div
                    className="
                      mb-6

                      flex
                      h-15
                      w-15

                      items-center
                      justify-center

                      overflow-hidden

                      rounded-xl

                      border
                      border-[#1e1c1c]

                      bg-[#000000]
                    "
                  >
                    <img
                      src="/favicon.png"
                      alt="Hermes"
                      className="
                        h-14
                        w-14

                        rounded-lg
                        object-cover
                      "
                    />
                  </div>

                  {/* HEADING */}

                  <h1
                    className="
                      text-[24px]
                      font-extralight

                      tracking-[0.005em]

                      text-[#ffffff]

                      sm:text-[26px]
                      md:text-[32px]
                    "
                  >
                    {greeting}
                  </h1>

                  {/* SUBTITLE */}

                  <p
                    className="
                      mt-2

                      max-w-[380px]

                      font-[system-ui]
                      text-transform: uppercase

                      text-[13px]
                      leading-6

                      text-[#]

                      sm:text-[16px]
                    "
                  >
                    Think. Create. Explore.
                  </p>
                </div>

                {/* =================================================
                    CHAT MESSAGES
                ================================================== */}

                {currentChatId && (
                  <div
                    className="
                      hermes-chat-content
                      chat-entering

                      w-full

                      space-y-8

                      font-[system-ui]
                    "
                  >
                    {chats[currentChatId]?.messages?.map((message, index) => (
                      <div key={index} className="w-full">
                        {/* =========================================
                              USER MESSAGE
                          ========================================== */}

                        {message.role === "user" ? (
                          <div
                            className="
                              flex
                              w-full
                              justify-end
                            "
                          >
                            <div
                              className="
                                hermes-user-message

                                max-w-[88%]

                                rounded-2xl
                                rounded-br-md

                                bg-[#292929]

                                px-4
                                py-3

                                font-[system-ui]

                                text-[14px]
                                leading-6

                                text-[#eeeeee]

                                sm:max-w-[78%]

                                md:max-w-[70%]
                                md:text-[15px]
                              "
                            >
                              <p
                                className="
                                  whitespace-pre-wrap
                                  break-words
                                "
                              >
                                {message.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* =========================================
                               AI MESSAGE
                            ========================================== */

                          <div
                            className="
                              hermes-ai-message

                              w-full

                              max-w-[720px]

                              font-[system-ui]

                              text-[14px]
                              leading-7

                              text-[#d4d4d4]

                              sm:text-[15px]
                            "
                          >
                            <MarkdownRenderer content={message.content} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* =====================================================
                CHAT COMPOSER
            ====================================================== */}

            <div
              className="
                hermes-mobile-composer

                pointer-events-none

                absolute
                bottom-0
                left-0
                right-0

                px-3
                pb-3
                pt-16

                sm:px-5
                sm:pb-5

                md:px-6
                md:pb-6
              "
              style={{
                background:
                  "linear-gradient(to top, #0b0b0b 20%, rgba(11,11,11,0.94) 58%, rgba(11,11,11,0) 100%)",
              }}
            >
              <form
                onSubmit={handleSubmitMessage}
                className="
                  pointer-events-auto

                  mx-auto

                  w-full

                  max-w-[760px]
                "
              >
                <div
                  className="
                    flex
                    min-h-[54px]
                    w-full

                    items-center

                    rounded-[18px]

                    border
                    border-[#363636]

                    bg-[#1c1c1c]

                    px-3
                    py-2

                    shadow-[0_8px_30px_rgba(0,0,0,0.22)]

                    transition

                    focus-within:border-[#9a5f1c80]
                    focus-within:bg-[#151515]

                    sm:min-h-[58px]
                    sm:rounded-[19px]

                    md:px-4
                  "
                >
                  {/* INPUT */}

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(event) => setChatInput(event.target.value)}
                    placeholder="Ask anything..."
                    className="
                      min-w-0
                      flex-1

                      bg-transparent

                      px-1
                      py-2

                      font-[system-ui]

                      text-[14px]
                      leading-6

                      text-[#eeeeee]

                      outline-none

                      placeholder:text-[#686868]

                      sm:text-[15px]
                      md:text-[15px]
                    "
                  />

                  {/* SEND */}

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    aria-label="Send message"
                    className="
                      ml-2

                      flex
                      h-9
                      w-9

                      shrink-0

                      items-center
                      justify-center

                      rounded-full

                      bg-[#e08d2e]

                      font-[system-ui]

                      text-[#171717]

                      transition-all
                      duration-150

                      hover:bg-[#eea347]

                      active:scale-95

                      disabled:cursor-not-allowed
                      disabled:opacity-25
                    "
                  >
                    <ArrowUp size={18} strokeWidth={2.3} />
                  </button>
                </div>

                {/* DISCLAIMER */}

                <p
                  className="
                    mt-2

                    text-center

                    font-[system-ui]

                    text-[10px]

                    leading-4

                    text-[#555555]

                    sm:text-[11px]
                  "
                >
                  Hermes may make mistakes. Check important information.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
