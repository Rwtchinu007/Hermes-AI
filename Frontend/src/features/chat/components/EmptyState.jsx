import { useState } from "react";
import { useSelector } from "react-redux";
import { BookOpen, CodeXml, Globe, Lightbulb } from "lucide-react";
import { pickGreeting } from "../utils/greetings";
import { HermesMark } from "../../ui/components/Logo";

const SUGGESTIONS = [
  {
    icon: BookOpen,
    label: "Explain a topic",
    prompt: "Explain how large language models work, in simple terms with an analogy.",
  },
  {
    icon: CodeXml,
    label: "Write or debug code",
    prompt: "Help me debug this code. Here's what it should do and the error I get:\n\n",
  },
  {
    icon: Globe,
    label: "Research something",
    prompt: "Research the latest developments in renewable energy and summarize the key points with sources.",
  },
  {
    icon: Lightbulb,
    label: "Brainstorm ideas",
    prompt: "Help me brainstorm ideas for a weekend side project I could build and show in my portfolio.",
  },
];

const capitalize = (value = "") => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Landing view for a new conversation. The composer is passed in so the
 * same instance (and its draft) moves into place once the chat starts.
 */
const EmptyState = ({ composer, onSuggestion }) => {
  const user = useSelector((state) => state.auth.user);
  const name = capitalize(user?.username?.split(/[_\s]/)[0]);
  // A fresh time-of-day line each time the home screen opens
  const [greeting] = useState(() => pickGreeting(name));

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 pb-16 pt-10 sm:px-6">
      <div className="animate-fade-up w-full max-w-[720px]">
        <div className="mb-9 flex flex-col items-center text-center">
          <HermesMark size={44} className="mb-6" />

          <h1 className="animate-greeting text-balance font-display text-[28px] font-semibold leading-tight tracking-[-0.025em] text-fg sm:text-[34px]">
            {greeting}
          </h1>
          <p className="animate-greeting-sub mt-2 text-[15px] text-muted">
            What can I help you with today?
          </p>
        </div>

        {composer}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SUGGESTIONS.map(({ icon, label, prompt }, index) => {
            const Icon = icon;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onSuggestion(prompt)}
                style={{ "--i": index }}
                className="animate-stagger group flex h-8 items-center gap-2 rounded-lg border border-line px-3 text-[13px] text-fg/80 transition-[color,background-color,transform,border-color,box-shadow] duration-150 ease-out hover:-translate-y-px hover:border-blue-line hover:bg-surface-2 hover:text-fg hover:shadow-blue"
              >
                <Icon
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted transition-colors duration-150 group-hover:text-blue"
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
