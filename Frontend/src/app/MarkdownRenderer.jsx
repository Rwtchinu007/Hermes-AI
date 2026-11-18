import React, { memo } from "react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import remarkMath from "remark-math";

import rehypeKatex from "rehype-katex";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { Copy, Check } from "lucide-react";

import "katex/dist/katex.min.css";

import { useCopy } from "../features/ui/hooks/useCopy";

/* =========================================================
   HERMES SYNTAX THEME
   Colors are CSS variables, so the same theme adapts to
   light and dark mode (see --code-* tokens in index.css).
========================================================= */

const v = (name) => ({ color: `var(--code-${name})` });

const hermesTheme = {
  "code[class*='language-']": { color: "var(--code-fg)", background: "transparent" },
  "pre[class*='language-']": { color: "var(--code-fg)", background: "transparent" },
  comment: { ...v("comment"), fontStyle: "italic" },
  prolog: v("comment"),
  doctype: v("comment"),
  cdata: v("comment"),
  punctuation: v("punct"),
  operator: v("punct"),
  property: v("tag"),
  tag: v("tag"),
  "attr-name": v("func"),
  boolean: v("number"),
  number: v("number"),
  constant: v("number"),
  symbol: v("number"),
  selector: v("string"),
  string: v("string"),
  char: v("string"),
  "attr-value": v("string"),
  inserted: v("string"),
  regex: v("string"),
  builtin: v("builtin"),
  variable: v("fg"),
  entity: v("keyword"),
  url: v("tag"),
  atrule: v("keyword"),
  keyword: v("keyword"),
  function: v("func"),
  "class-name": v("class"),
  important: { ...v("keyword"), fontWeight: "600" },
  deleted: { color: "var(--danger)" },
};

const LANGUAGE_LABELS = {
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  sh: "Shell",
  bash: "Bash",
  shell: "Shell",
  json: "JSON",
  html: "HTML",
  css: "CSS",
  sql: "SQL",
  cpp: "C++",
  csharp: "C#",
  cs: "C#",
  md: "Markdown",
  yaml: "YAML",
  yml: "YAML",
};

const labelFor = (language) =>
  LANGUAGE_LABELS[language?.toLowerCase()] ||
  (language ? language.charAt(0).toUpperCase() + language.slice(1) : "Code");

/* =========================================================
   MARKDOWN COMPONENTS
   Typography lives in .hermes-prose (index.css).
========================================================= */

const components = {
  /* -----------------------------------------------
     CODE: inline vs fenced block
  ------------------------------------------------ */
  code: ({ children, className }) => {
    const match = /language-([\w+#-]+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");

    // Inline code (no language and single line)
    if (!match && !code.includes("\n")) {
      return <code className="hermes-inline-code">{children}</code>;
    }

    return <CodeBlock language={match?.[1]} code={code} />;
  },

  /* PRE: CodeBlock renders its own container */
  pre: ({ children }) => <div className="min-w-0 max-w-full">{children}</div>,

  /* LINKS: open externally */
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),

  /* TABLE: horizontally scrollable wrapper */
  table: ({ children }) => (
    <div className="markdown-table-scroll hermes-scrollbar">
      <table>{children}</table>
    </div>
  ),
};

const remarkPlugins = [remarkGfm, remarkMath];
const rehypePlugins = [rehypeKatex];

/* =========================================================
   MARKDOWN RENDERER
========================================================= */

const MarkdownRenderer = ({ content }) => (
  <ReactMarkdown
    remarkPlugins={remarkPlugins}
    rehypePlugins={rehypePlugins}
    components={components}
  >
    {content}
  </ReactMarkdown>
);

/* =========================================================
   CODE BLOCK
========================================================= */

const CodeBlock = ({ language, code }) => {
  const [copied, copy] = useCopy(2000);

  return (
    <div className="hermes-code-block">
      {/* HEADER */}
      <div className="hermes-code-header">
        <span className="hermes-code-language">{labelFor(language)}</span>

        <button
          type="button"
          onClick={() => copy(code)}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="hermes-code-copy"
        >
          {copied ? (
            <>
              <Check size={14} strokeWidth={1.5} className="hermes-check text-success" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} strokeWidth={1.5} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* CODE */}
      <div className="hermes-code-scroll hermes-scrollbar">
        <SyntaxHighlighter
          language={language || "text"}
          style={hermesTheme}
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            padding: "16px 18px",
            background: "var(--code-bg)",
            fontSize: "13px",
            lineHeight: "1.7",
            fontFamily: "var(--font-mono)",
          }}
          codeTagProps={{
            style: { fontFamily: "var(--font-mono)" },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default memo(MarkdownRenderer);
