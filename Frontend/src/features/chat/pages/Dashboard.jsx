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
    // Clear currently selected chat
    dispatch(setCurrentChatId(null));

    // Clear input
    setChatInput("");

    // Close any open menu
    setOpenMenu(null);

    // Close mobile sidebar
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
        `}
      </style>

      {/* ==========================================
          MAIN
      ========================================== */}

      <main
        className="min-h-screen w-full bg-[#181818] text-[#eeeeee]
       font-[system-ui]"
      >
        <div className="flex h-screen w-full overflow-hidden">
          {/* ==========================================
              MOBILE SIDEBAR OVERLAY
          ========================================== */}

          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
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
              border-[#303030]

              bg-[#202020]

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
              <h1 className="font-[Audex] text-[28px] font-normal tracking-tight text-[#e08d2e]">
                Hermes
                <span className="font-sans text-white/70">.ai</span>
              </h1>

              {/* Mobile close button */}

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
                NEW CHAT BUTTON
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

            <div className="hermes-scrollbar flex-1 overflow-y-auto px-3 pb-4">
              {chatList.length === 0 ? (
                <div className="px-3 py-6 text-sm text-[#777777]">
                  No chats yet
                </div>
              ) : (
                <div className="space-y-1">
                  {chatList.map((chatItem) => {
                    const isActive = currentChatId === chatItem.id;

                    return (
                      <div key={chatItem.id} className="group relative">
                        {/* ==========================================
                            CHAT
                        ========================================== */}

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
                                ? "bg-[#2b2b2b] text-white"
                                : "text-[#b5b5b5] hover:bg-[#292929] hover:text-[#eeeeee]"
                            }
                          `}
                        >
                          <span className="truncate">
                            {chatItem.title || "New chat"}
                          </span>
                        </button>

                        {/* ==========================================
                            THREE DOT BUTTON
                        ========================================== */}

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

                            ${
                              openMenu === chatItem.id
                                ? "bg-[#353535] text-white opacity-100"
                                : ""
                            }
                          `}
                        >
                          <MoreHorizontal size={18} strokeWidth={2} />
                        </button>

                        {/* ==========================================
                            DELETE MENU
                        ========================================== */}

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

            <div className="border-t border-[#303030] p-4">
              <div className="flex items-center gap-3">
                {/* User icon */}

                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#2b2b2b]
                    text-[#8a8a8a]
                  "
                >
                  <User size={17} strokeWidth={1.8} />
                </div>

                {/* User information */}

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#eeeeee]">
                    {user?.username || "User"}
                  </p>

                  <p className="mt-1 truncate text-xs text-[#777777]">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ==========================================
              MAIN CHAT AREA
          ========================================== */}

          <section className="relative flex min-w-0 flex-1 flex-col bg-[#181818]">
            {/* ==========================================
                MOBILE HEADER
            ========================================== */}

            <header className="flex h-16 items-center border-b border-[#303030] px-4 md:hidden">
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
                  text-[#aaaaaa]
                  transition
                  hover:bg-[#252525]
                  hover:text-white
                "
              >
                <Menu size={21} strokeWidth={1.8} />
              </button>

              <div className="ml-3 text-lg">
                <span className="font-[Audex] text-[#e08d2e]">Hermes</span>

                <span className="font-sans text-white/70">.ai</span>
              </div>
            </header>

            {/* ==========================================
                MESSAGES AREA
            ========================================== */}

            <div className="hermes-scrollbar flex-1 overflow-y-auto">
              <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-36 pt-8 md:px-6 md:pt-12">
                {/* ==========================================
                    EMPTY STATE
                ========================================== */}

                {!currentChatId ? (
                  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                    {/* Hermes H */}

                    <div
                      className="
                        mb-6
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-[#363636]
                        bg-[#202020]
                      "
                    >
                      <span className="font-[Audex] text-3xl text-[#e08d2e]">
                        H
                      </span>
                    </div>

                    <h2 className="text-2xl font-medium tracking-tight text-[#eeeeee] md:text-3xl">
                      How can I help you?
                    </h2>

                    <p className="mt-2 text-sm text-[#707070]">
                      Ask anything and start a conversation.
                    </p>
                  </div>
                ) : (
                  /* ==========================================
                      CHAT MESSAGES
                  ========================================== */

                  <div className="space-y-6">
                    {chats[currentChatId]?.messages?.map((message, index) => (
                      <div
                        key={index}
                        className={`
                            flex
                            w-full

                            ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }
                          `}
                      >
                        {/* ==========================================
                              USER MESSAGE
                          ========================================== */}

                        {message.role === "user" ? (
                          <div
                            className="
                                max-w-[85%]
                                rounded-2xl
                                rounded-br-md
                                bg-[#292929]
                                px-4
                                py-3
                                text-sm
                                leading-6
                                text-[#eeeeee]
                                md:max-w-[75%]
                                md:text-base
                              "
                          >
                            <p className="whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                        ) : (
                          /* ==========================================
                                AI MESSAGE
                            ========================================== */

                          <div
                            className="
                                w-full
                                max-w-[85%]
                                text-sm
                                leading-7
                                text-[#dddddd]
                                md:max-w-[80%]
                                md:text-base
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

            {/* ==========================================
                CHAT INPUT
            ========================================== */}

            <div
              className="
                absolute
                bottom-0
                left-0
                right-0
                bg-gradient-to-t
                from-[#181818]
                via-[#181818]
                to-transparent
                px-4
                pb-4
                pt-10
                md:px-6
                md:pb-6
              "
            >
              <form
                onSubmit={handleSubmitMessage}
                className="
                  mx-auto
                  flex
                  w-full
                  max-w-3xl
                  items-center
                "
              >
                <div
                  className="
                    flex
                    w-full
                    items-center
                    rounded-2xl
                    border
                    border-[#3a3a3a]
                    bg-[#202020]
                    px-4
                    py-2
                    transition
                    focus-within:border-[#555555]
                  "
                >
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
                      text-sm
                      text-[#eeeeee]
                      outline-none
                      placeholder:text-[#686868]
                      md:text-base
                    "
                  />

                  {/* ==========================================
                      SEND BUTTON
                  ========================================== */}

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
                      text-[#181818]
                      transition
                      hover:bg-[#eea347]
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <ArrowUp size={18} strokeWidth={2.2} />
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
