import React, { useState } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Copy, Check } from "lucide-react";

import "katex/dist/katex.min.css";

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

            border: 1px solid #3a3a3a;

            border-radius: 14px;

            background: #2f2f2f;

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

            background: #2f2f2f;

            border-bottom: 1px solid #414141;

            box-sizing: border-box;
          }


          /* =====================================================
             CODE LANGUAGE
          ====================================================== */

          .hermes-code-language {
            min-width: 0;

            overflow: hidden;

            color: #b8b8b8;

            font-size: 12px;

            font-weight: 500;

            white-space: nowrap;

            text-overflow: ellipsis;
          }


          /* =====================================================
             CODE COPY BUTTON
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

            color: #b8b8b8;

            font-size: 12px;

            cursor: pointer;

            transition:
              background 0.15s ease,
              color 0.15s ease;
          }


          .hermes-code-copy:hover {
            background: #414141;

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

            /*
             * Maximum height before vertical scrolling.
             */
            max-height: 560px;

            /*
             * Horizontal + vertical scrolling.
             */
            overflow-x: auto;
            overflow-y: auto;

            /*
             * Better scrolling on mobile.
             */
            -webkit-overflow-scrolling: touch;

            scrollbar-width: thin;

            scrollbar-color: #555555 transparent;

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
            background: #555555;

            border-radius: 999px;
          }


          .hermes-code-scroll::-webkit-scrollbar-thumb:hover {
            background: #707070;
          }


          .hermes-code-scroll::-webkit-scrollbar-corner {
            background: transparent;
          }


          /* =====================================================
             CODE PRE
          ====================================================== */

          .hermes-code-scroll pre {
            width: max-content !important;

            /*
             * Short code fills the available width.
             */
            min-width: 100% !important;

            /*
             * Long lines are allowed to become wider.
             */
            max-width: none !important;

            margin: 0 !important;

            /*
             * NEVER wrap code lines.
             */
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
             KATEX / MATH
          ====================================================== */

          .katex {
            font-size: 1.05em;
          }


          .katex-display {
            max-width: 100%;

            margin: 1rem 0;

            padding: 4px 0;

            overflow-x: auto;

            overflow-y: hidden;

            scrollbar-width: thin;

            scrollbar-color: #3a3a3a transparent;
          }


          .katex-display::-webkit-scrollbar {
            height: 5px;
          }


          .katex-display::-webkit-scrollbar-track {
            background: transparent;
          }


          .katex-display::-webkit-scrollbar-thumb {
            background: #3a3a3a;

            border-radius: 999px;
          }


          .katex-display::-webkit-scrollbar-thumb:hover {
            background: #555555;
          }


          /* =====================================================
             RESPONSIVE MARKDOWN TABLE
          ====================================================== */

          .markdown-table-scroll {
            width: 100%;
            max-width: 100%;
            min-width: 0;

            margin: 16px 0;

            /*
             * IMPORTANT:
             * Only the table scrolls horizontally.
             */
            overflow-x: auto;

            overflow-y: hidden;

            border: 1px solid #303030;

            border-radius: 12px;

            /*
             * Better mobile scrolling.
             */
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
            /*
             * DO NOT use width: 100%.
             *
             * That causes the table to squeeze itself
             * on mobile.
             */
            width: max-content !important;

            /*
             * Minimum readable width.
             */
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

            padding: 14px 16px;

            text-align: left;

            vertical-align: middle;

            background: #242424;

            border-bottom: 1px solid #3a3a3a;

            color: #dddddd;

            font-size: 15px;

            font-weight: 600;

            line-height: 1.45;
          }


          /* =====================================================
             TABLE DATA
          ====================================================== */

          .markdown-table-scroll td {
            min-width: 120px;

            padding: 14px 16px;

            vertical-align: top;

            background: #181818;

            border-bottom: 1px solid #303030;

            color: #cccccc;

            font-size: 15px;

            line-height: 1.6;
          }


          /* =====================================================
             LAST ROW
          ====================================================== */

          .markdown-table-scroll tr:last-child td {
            border-bottom: none;
          }


          /* =====================================================
             INLINE CODE INSIDE TABLE
          ====================================================== */

          .markdown-table-scroll code {
            /*
             * IMPORTANT:
             * Keep O(log n), O(n^2), etc. together.
             */
            white-space: nowrap !important;

            word-break: normal !important;

            overflow-wrap: normal !important;

            border-radius: 6px;

            background: #292929;

            border: 1px solid #353535;

            padding: 2px 7px;

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
             MOBILE TABLE
          ====================================================== */

          @media (max-width: 640px) {

            .markdown-table-scroll {
              margin: 14px 0;

              border-radius: 10px;
            }


            .markdown-table-scroll table {
              /*
               * The table stays readable.
               *
               * User swipes horizontally.
               */
              min-width: 680px;
            }


            .markdown-table-scroll th {
              padding: 12px 14px;

              font-size: 13px;

              line-height: 1.4;
            }


            .markdown-table-scroll td {
              padding: 12px 14px;

              font-size: 13px;

              line-height: 1.5;
            }


            .markdown-table-scroll::-webkit-scrollbar {
              height: 5px;
            }
          }


          /* =====================================================
             VERY SMALL PHONES
          ====================================================== */

          @media (max-width: 380px) {

            .markdown-table-scroll table {
              min-width: 640px;
            }


            .markdown-table-scroll th,
            .markdown-table-scroll td {
              padding: 10px 12px;

              font-size: 12px;
            }
          }


          /* =====================================================
             MOBILE CODE BLOCK
          ====================================================== */

          @media (max-width: 640px) {

            .hermes-code-block {
              margin: 16px 0;

              border-radius: 12px;
            }


            .hermes-code-header {
              height: 42px;

              padding: 0 10px 0 12px;
            }


            .hermes-code-scroll {
              /*
               * Smaller height on mobile.
               */
              max-height: 420px;

              overflow-x: auto;

              overflow-y: auto;
            }


            .hermes-code-scroll::-webkit-scrollbar {
              width: 5px;

              height: 5px;
            }


            .hermes-code-scroll pre {
              /*
               * Smaller padding on mobile.
               */
              padding: 14px !important;

              font-size: 13px !important;

              line-height: 1.65 !important;
            }


            .hermes-code-copy {
              padding: 5px;

              font-size: 11px;
            }


            .hermes-code-copy span {
              display: none;
            }


            .hermes-code-language {
              font-size: 11px;
            }
          }


          /* =====================================================
             VERY SMALL PHONES
          ====================================================== */

          @media (max-width: 380px) {

            .hermes-code-block {
              border-radius: 10px;
            }


            .hermes-code-scroll {
              max-height: 360px;
            }


            .hermes-code-scroll pre {
              padding: 12px !important;

              font-size: 12px !important;
            }
          }

        `}
      </style>

      {/* =====================================================
          REACT MARKDOWN
      ====================================================== */}

      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          /* =================================================
             PARAGRAPH
          ================================================= */

          p: ({ children }) => (
            <p className="mb-4 leading-7 last:mb-0">{children}</p>
          ),

          /* =================================================
             HEADINGS
          ================================================= */

          h1: ({ children }) => (
            <h1 className="mt-6 mb-4 text-2xl font-bold first:mt-0">
              {children}
            </h1>
          ),

          h2: ({ children }) => (
            <h2 className="mt-6 mb-3 text-xl font-semibold first:mt-0">
              {children}
            </h2>
          ),

          h3: ({ children }) => (
            <h3 className="mt-5 mb-2 text-lg font-semibold first:mt-0">
              {children}
            </h3>
          ),

          h4: ({ children }) => (
            <h4 className="mt-4 mb-2 text-base font-semibold">{children}</h4>
          ),

          /* =================================================
             TEXT
          ================================================= */

          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),

          em: ({ children }) => <em className="italic">{children}</em>,

          /* =================================================
             UNORDERED LIST
          ================================================= */

          ul: ({ children }) => (
            <ul className="mb-4 ml-5 list-disc space-y-1 pl-2">{children}</ul>
          ),

          /* =================================================
             ORDERED LIST
          ================================================= */

          ol: ({ children }) => (
            <ol className="mb-4 ml-5 list-decimal space-y-1 pl-2">
              {children}
            </ol>
          ),

          /* =================================================
             LIST ITEM
          ================================================= */

          li: ({ children }) => <li className="pl-1 leading-7">{children}</li>,

          /* =================================================
             CODE
          ================================================= */

          code: ({ children, className }) => {
            const match = /language-(\w+)/.exec(className || "");

            const code = String(children).replace(/\n$/, "");

            /*
             * INLINE CODE
             */

            if (!match) {
              return (
                <code
                  className="
                    rounded-md
                    border
                    border-[#303030]
                    bg-[#242424]
                    px-1.5
                    py-0.5
                    font-mono
                    text-[0.9em]
                  "
                >
                  {children}
                </code>
              );
            }

            /*
             * CODE BLOCK
             */

            return <CodeBlock language={match[1]} code={code} />;
          },

          /* =================================================
             PRE
          ================================================= */

          pre: ({ children }) => (
            <div className="my-4 min-w-0 max-w-full">{children}</div>
          ),

          /* =================================================
             BLOCKQUOTE
          ================================================= */

          blockquote: ({ children }) => (
            <blockquote
              className="
                my-4
                border-l-4
                border-[#555555]
                pl-4
                italic
                opacity-80
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
                underline
                underline-offset-2
                transition
                hover:opacity-70
              "
            >
              {children}
            </a>
          ),

          /* =================================================
             HORIZONTAL RULE
          ================================================= */

          hr: () => <hr className="my-6 border-[#303030]" />,

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
             TABLE HEADER
          ================================================= */

          th: ({ children }) => <th>{children}</th>,

          /* =================================================
             TABLE DATA
          ================================================= */

          td: ({ children }) => <td>{children}</td>,

          /* =================================================
             TABLE ROW
          ================================================= */

          tr: ({ children }) => <tr>{children}</tr>,
        }}
      >
        {content}
      </ReactMarkdown>
    </>
  );
};

/* =========================================================
   CODE BLOCK COMPONENT
========================================================= */

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  /* =======================================================
     COPY CODE
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
          CODE HEADER
      ================================================= */}

      <div className="hermes-code-header">
        {/* Language */}

        <span className="hermes-code-language">
          {language
            ? language.charAt(0).toUpperCase() + language.slice(1)
            : "Code"}
        </span>

        {/* Copy */}

        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="hermes-code-copy"
        >
          {copied ? (
            <>
              <Check size={15} strokeWidth={2} className="text-[#e08d2e]" />

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
          CODE CONTENT
      ================================================= */}

      <div className="hermes-code-scroll">
        <SyntaxHighlighter
          language={language || "text"}
          /*
           * Keep syntax highlighting.
           */
          style={oneDark}
          /*
           * Never wrap long lines.
           */
          wrapLongLines={false}
          customStyle={{
            margin: 0,

            padding: "18px",

            /*
             * ChatGPT-style dark code background.
             */
            background: "#2f2f2f",

            fontSize: "14px",

            lineHeight: "1.7",

            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

            /*
             * Keep long lines intact.
             */
            whiteSpace: "pre",

            wordBreak: "normal",

            overflowWrap: "normal",

            /*
             * Parent handles scrolling.
             */
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
