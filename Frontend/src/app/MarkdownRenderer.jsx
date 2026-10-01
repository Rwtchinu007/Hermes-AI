import React, { useState } from "react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import remarkMath from "remark-math";

import rehypeKatex from "rehype-katex";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { Copy, Check } from "lucide-react";

import "katex/dist/katex.min.css";

/* =========================================================
   HERMES DARK SYNTAX THEME
========================================================= */

const hermesDark = {
  "code[class*='language-']": {
    color: "#e5e5e5",
    background: "transparent",
  },

  "pre[class*='language-']": {
    color: "#e5e5e5",
    background: "transparent",
  },

  comment: {
    color: "#666666",
  },

  prolog: {
    color: "#666666",
  },

  doctype: {
    color: "#666666",
  },

  cdata: {
    color: "#666666",
  },

  punctuation: {
    color: "#b8b8b8",
  },

  property: {
    color: "#b9a7ff",
  },

  tag: {
    color: "#b9a7ff",
  },

  boolean: {
    color: "#c7a8ff",
  },

  number: {
    color: "#c7a8ff",
  },

  constant: {
    color: "#c7a8ff",
  },

  symbol: {
    color: "#c7a8ff",
  },

  selector: {
    color: "#9be28f",
  },

  "attr-name": {
    color: "#b9a7ff",
  },

  string: {
    color: "#9be28f",
  },

  char: {
    color: "#9be28f",
  },

  builtin: {
    color: "#f0b878",
  },

  inserted: {
    color: "#9be28f",
  },

  operator: {
    color: "#d6d6d6",
  },

  entity: {
    color: "#c7a8ff",
  },

  url: {
    color: "#8ab4f8",
  },

  variable: {
    color: "#f0b878",
  },

  atrule: {
    color: "#c7a8ff",
  },

  "attr-value": {
    color: "#9be28f",
  },

  keyword: {
    color: "#c7a8ff",
  },

  function: {
    color: "#d2b5ff",
  },

  "class-name": {
    color: "#f0b878",
  },

  regex: {
    color: "#e6a878",
  },

  important: {
    color: "#ff8c8c",
    fontWeight: "600",
  },
};

/* =========================================================
   MARKDOWN RENDERER
========================================================= */

const MarkdownRenderer = ({ content }) => {
  return (
    <>
      <style>
        {`

          /* =====================================================
             CODE BLOCK
          ====================================================== */

          .hermes-code-block {
            width: 100%;
            max-width: 100%;
            min-width: 0;

            margin: 20px 0;

            overflow: hidden;

            border: 1px solid #292929;
            border-radius: 10px;

            background: #0b0b0b;

            box-sizing: border-box;
          }


          /* =====================================================
             CODE HEADER
          ====================================================== */

          .hermes-code-header {
            display: flex;

            width: 100%;
            min-width: 0;

            height: 44px;

            align-items: center;
            justify-content: space-between;

            padding: 0 12px 0 14px;

            background: #111111;

            border-bottom: 1px solid #292929;

            box-sizing: border-box;
          }


          /* =====================================================
             CODE LANGUAGE
          ====================================================== */

          .hermes-code-language {
            min-width: 0;

            overflow: hidden;

            color: #888888;

            font-size: 12px;

            font-weight: 500;

            white-space: nowrap;

            text-overflow: ellipsis;
          }


          /* =====================================================
             COPY BUTTON
          ====================================================== */

          .hermes-code-copy {
            display: flex;

            flex-shrink: 0;

            align-items: center;

            gap: 6px;

            padding: 5px 7px;

            border: 0;

            border-radius: 6px;

            background: transparent;

            color: #888888;

            font-size: 12px;

            cursor: pointer;

            transition:
              background 0.15s ease,
              color 0.15s ease;
          }


          .hermes-code-copy:hover {
            background: #1d1d1d;

            color: #eeeeee;
          }


          .hermes-code-copy:active {
            transform: scale(0.98);
          }


          /* =====================================================
             CODE SCROLL AREA
          ====================================================== */

          .hermes-code-scroll {
            width: 100%;
            max-width: 100%;
            min-width: 0;

            max-height: 560px;

            overflow-x: auto;
            overflow-y: auto;

            -webkit-overflow-scrolling: touch;

            scrollbar-width: thin;

            scrollbar-color: #444444 transparent;

            box-sizing: border-box;
          }


          /* =====================================================
             CODE SCROLLBAR
          ====================================================== */

          .hermes-code-scroll::-webkit-scrollbar {
            width: 7px;
            height: 7px;
          }


          .hermes-code-scroll::-webkit-scrollbar-track {
            background: transparent;
          }


          .hermes-code-scroll::-webkit-scrollbar-thumb {
            background: #444444;

            border-radius: 999px;
          }


          .hermes-code-scroll::-webkit-scrollbar-thumb:hover {
            background: #5a5a5a;
          }


          .hermes-code-scroll::-webkit-scrollbar-corner {
            background: transparent;
          }


          /* =====================================================
             CODE PRE
          ====================================================== */

          .hermes-code-scroll pre {
            width: max-content !important;

            min-width: 100% !important;

            max-width: none !important;

            margin: 0 !important;

            white-space: pre !important;

            overflow: visible !important;

            word-break: normal !important;

            overflow-wrap: normal !important;

            box-sizing: border-box !important;
          }


          .hermes-code-scroll code {
            white-space: pre !important;

            word-break: normal !important;

            overflow-wrap: normal !important;
          }


          /* =====================================================
             INLINE CODE
          ====================================================== */

          .hermes-inline-code {
            padding: 2px 6px;

            border: 1px solid #303030;

            border-radius: 5px;

            background: #1a1a1a;

            color: #e2b06b;

            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              Monaco,
              Consolas,
              "Liberation Mono",
              "Courier New",
              monospace;

            font-size: 0.9em;
          }


          /* =====================================================
             TABLE
          ====================================================== */

          .markdown-table-scroll {
            width: 100%;
            max-width: 100%;
            min-width: 0;

            margin: 18px 0;

            overflow-x: auto;

            overflow-y: hidden;

            border: 1px solid #292929;

            border-radius: 10px;

            -webkit-overflow-scrolling: touch;

            scrollbar-width: thin;

            scrollbar-color: #3a3a3a transparent;

            box-sizing: border-box;
          }


          /* =====================================================
             TABLE SCROLLBAR
          ====================================================== */

          .markdown-table-scroll::-webkit-scrollbar {
            height: 6px;
          }


          .markdown-table-scroll::-webkit-scrollbar-track {
            background: transparent;
          }


          .markdown-table-scroll::-webkit-scrollbar-thumb {
            background: #3a3a3a;

            border-radius: 999px;
          }


          .markdown-table-scroll::-webkit-scrollbar-thumb:hover {
            background: #555555;
          }


          /* =====================================================
             TABLE
          ====================================================== */

          .markdown-table-scroll table {
            width: max-content !important;

            min-width: 720px;

            max-width: none;

            border-collapse: collapse;

            table-layout: auto;
          }


          /* =====================================================
             TABLE HEADER
          ====================================================== */

          .markdown-table-scroll th {
            min-width: 120px;

            padding: 13px 16px;

            text-align: left;

            vertical-align: middle;

            background: #181818;

            border-bottom: 1px solid #333333;

            color: #eeeeee;

            font-size: 14px;

            font-weight: 600;

            line-height: 1.45;
          }


          /* =====================================================
             TABLE DATA
          ====================================================== */

          .markdown-table-scroll td {
            min-width: 120px;

            padding: 13px 16px;

            vertical-align: top;

            background: #101010;

            border-bottom: 1px solid #272727;

            color: #c8c8c8;

            font-size: 14px;

            line-height: 1.6;
          }


          /* =====================================================
             LAST TABLE ROW
          ====================================================== */

          .markdown-table-scroll tr:last-child td {
            border-bottom: none;
          }


          /* =====================================================
             INLINE CODE INSIDE TABLE
          ====================================================== */

          .markdown-table-scroll code {
            white-space: nowrap !important;

            word-break: normal !important;

            overflow-wrap: normal !important;

            border-radius: 5px;

            background: #1d1d1d;

            border: 1px solid #303030;

            padding: 2px 6px;

            font-family:
              ui-monospace,
              SFMono-Regular,
              Menlo,
              Monaco,
              Consolas,
              "Liberation Mono",
              "Courier New",
              monospace;

            font-size: 0.9em;
          }


          /* =====================================================
             KATEX
          ====================================================== */

          .katex {
            font-size: 1.05em;
            color: #d8d8d8;
          }


          .katex-display {
            max-width: 100%;

            margin: 1rem 0;

            padding: 4px 0;

            overflow-x: auto;

            overflow-y: hidden;

            scrollbar-width: thin;

            scrollbar-color: #303030 transparent;
          }


          .katex-display::-webkit-scrollbar {
            height: 5px;
          }


          .katex-display::-webkit-scrollbar-track {
            background: transparent;
          }


          .katex-display::-webkit-scrollbar-thumb {
            background: #303030;

            border-radius: 999px;
          }


          .katex-display::-webkit-scrollbar-thumb:hover {
            background: #484848;
          }


          /* =====================================================
             MOBILE
          ====================================================== */

          @media (max-width: 640px) {

            .hermes-code-block {
              margin: 16px 0;

              border-radius: 9px;
            }


            .hermes-code-header {
              height: 42px;

              padding: 0 10px 0 12px;
            }


            .hermes-code-scroll {
              max-height: 420px;

              overflow-x: auto;

              overflow-y: auto;
            }


            .hermes-code-scroll::-webkit-scrollbar {
              width: 5px;

              height: 5px;
            }


            .hermes-code-scroll pre {
              padding: 14px !important;

              font-size: 13px !important;

              line-height: 1.65 !important;
            }


            .hermes-code-copy {
              padding: 5px;
            }


            .hermes-code-copy span {
              display: none;
            }


            .hermes-code-language {
              font-size: 11px;
            }


            .markdown-table-scroll {
              margin: 14px 0;

              border-radius: 9px;
            }


            .markdown-table-scroll table {
              min-width: 680px;
            }


            .markdown-table-scroll th {
              padding: 12px 14px;

              font-size: 13px;
            }


            .markdown-table-scroll td {
              padding: 12px 14px;

              font-size: 13px;
            }


            .markdown-table-scroll::-webkit-scrollbar {
              height: 5px;
            }
          }


          /* =====================================================
             SMALL PHONES
          ====================================================== */

          @media (max-width: 380px) {

            .hermes-code-scroll {
              max-height: 360px;
            }


            .hermes-code-scroll pre {
              padding: 12px !important;

              font-size: 12px !important;
            }


            .markdown-table-scroll table {
              min-width: 640px;
            }


            .markdown-table-scroll th,
            .markdown-table-scroll td {
              padding: 10px 12px;

              font-size: 12px;
            }
          }

        `}
      </style>

      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          /* =================================================
             PARAGRAPH
          ================================================= */

          p: ({ children }) => (
            <p
              className="
                mb-4
                font-[system-ui]
                text-[15px]
                leading-7
                text-[#d1d1d1]

                last:mb-0
              "
            >
              {children}
            </p>
          ),

          /* =================================================
             HEADINGS
          ================================================= */

          h1: ({ children }) => (
            <h1
              className="
                mt-7
                mb-4

                font-[system-ui]
                text-[25px]
                font-semibold
                leading-tight
                tracking-[-0.02em]

                text-[#f2f2f2]

                first:mt-0
              "
            >
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2
              className="
                mt-7
                mb-3

                font-[system-ui]
                text-[21px]
                font-semibold
                leading-tight
                tracking-[-0.015em]

                text-[#eeeeee]

                first:mt-0
              "
            >
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3
              className="
                mt-6
                mb-2.5

                font-[system-ui]
                text-[18px]
                font-semibold
                leading-snug

                text-[#e8e8e8]

                first:mt-0
              "
            >
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4
              className="
                mt-5
                mb-2

                font-[system-ui]
                text-[16px]
                font-semibold
                leading-snug

                text-[#dddddd]
              "
            >
              {children}
            </h4>
          ),

          /* =================================================
             TEXT
          ================================================= */

          strong: ({ children }) => (
            <strong
              className="
                font-semibold
                text-[#eeeeee]
              "
            >
              {children}
            </strong>
          ),

          em: ({ children }) => (
            <em
              className="
                italic
                text-[#cfcfcf]
              "
            >
              {children}
            </em>
          ),

          /* =================================================
             UNORDERED LIST
          ================================================= */

          ul: ({ children }) => (
            <ul
              className="
                mb-5
                ml-5
                list-disc
                space-y-1.5
                pl-2

                font-[system-ui]
                text-[15px]
                leading-7

                text-[#d1d1d1]

                marker:text-[#e08d2e]
              "
            >
              {children}
            </ul>
          ),

          /* =================================================
             ORDERED LIST
          ================================================= */

          ol: ({ children }) => (
            <ol
              className="
                mb-5
                ml-5
                list-decimal
                space-y-1.5
                pl-2

                font-[system-ui]
                text-[15px]
                leading-7

                text-[#d1d1d1]

                marker:font-medium
                marker:text-[#e08d2e]
              "
            >
              {children}
            </ol>
          ),

          /* =================================================
             LIST ITEM
          ================================================= */

          li: ({ children }) => (
            <li
              className="
                pl-1
                leading-7
                text-[#d1d1d1]
              "
            >
              {children}
            </li>
          ),

          /* =================================================
             CODE
          ================================================= */

          code: ({ children, className }) => {
            const match = /language-(\w+)/.exec(className || "");

            const code = String(children).replace(/\n$/, "");

            /* -----------------------------------------------
               INLINE CODE
            ------------------------------------------------ */

            if (!match) {
              return <code className="hermes-inline-code">{children}</code>;
            }

            /* -----------------------------------------------
               CODE BLOCK
            ------------------------------------------------ */

            return <CodeBlock language={match[1]} code={code} />;
          },

          /* =================================================
             PRE
          ================================================= */

          pre: ({ children }) => (
            <div className="my-5 min-w-0 max-w-full">{children}</div>
          ),

          /* =================================================
             BLOCKQUOTE
          ================================================= */

          blockquote: ({ children }) => (
            <blockquote
              className="
                my-5

                border-l-2
                border-[#e08d2e]

                pl-4

                font-[system-ui]
                text-[15px]
                leading-7

                text-[#a9a9a9]

                italic

                [&>p]:mb-0
              "
            >
              {children}
            </blockquote>
          ),

          /* =================================================
             LINKS
          ================================================= */

          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                font-medium

                text-[#e09a4a]

                underline
                decoration-[#e08d2e55]
                underline-offset-4

                transition-colors
                duration-150

                hover:text-[#f0a044]
                hover:decoration-[#e08d2e]
              "
            >
              {children}
            </a>
          ),

          /* =================================================
             HORIZONTAL RULE
          ================================================= */

          hr: () => (
            <hr
              className="
                my-7
                border-0
                border-t
                border-[#292929]
              "
            />
          ),

          /* =================================================
             TABLE
          ================================================= */

          table: ({ children }) => (
            <div className="markdown-table-scroll">
              <table>{children}</table>
            </div>
          ),

          /* =================================================
             TABLE HEAD
          ================================================= */

          thead: ({ children }) => <thead>{children}</thead>,

          /* =================================================
             TABLE BODY
          ================================================= */

          tbody: ({ children }) => <tbody>{children}</tbody>,

          /* =================================================
             TABLE ROW
          ================================================= */

          tr: ({ children }) => <tr>{children}</tr>,

          /* =================================================
             TABLE HEADER
          ================================================= */

          th: ({ children }) => <th>{children}</th>,

          /* =================================================
             TABLE DATA
          ================================================= */

          td: ({ children }) => <td>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </>
  );
};

/* =========================================================
   CODE BLOCK
========================================================= */

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  /* =======================================================
     COPY
  ======================================================= */

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  };

  return (
    <div className="hermes-code-block">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="hermes-code-header">
        <span className="hermes-code-language">
          {language
            ? language.charAt(0).toUpperCase() + language.slice(1)
            : "Code"}
        </span>

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="hermes-code-copy"
        >
          {copied ? (
            <>
              <Check size={15} strokeWidth={2} className="text-[#9be28f]" />

              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={15} strokeWidth={1.8} />

              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* =================================================
          CODE
      ================================================= */}

      <div className="hermes-code-scroll">
        <SyntaxHighlighter
          language={language || "text"}
          style={hermesDark}
          wrapLongLines={false}
          customStyle={{
            margin: 0,

            padding: "18px",

            background: "#0b0b0b",

            fontSize: "14px",

            lineHeight: "1.7",

            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

            whiteSpace: "pre",

            wordBreak: "normal",

            overflowWrap: "normal",

            overflow: "visible",

            width: "max-content",

            minWidth: "100%",

            maxWidth: "none",
          }}
          codeTagProps={{
            style: {
              whiteSpace: "pre",

              wordBreak: "normal",

              overflowWrap: "normal",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default MarkdownRenderer;
