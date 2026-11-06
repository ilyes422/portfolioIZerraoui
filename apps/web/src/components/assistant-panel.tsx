"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Bot, MessageCircle } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import styles from "@/app/page.module.css";
import formStyles from "./portfolio-search.module.css";

type Source = { title: string; href: string };
type Message = {
  role: "user" | "assistant";
  text: string;
  mode?: "generative" | "sources" | "unknown";
  sources?: Source[];
};
const Chat = createContext<{
  messages: Message[];
  pending: boolean;
  send: (text: string) => Promise<void>;
} | null>(null);

const suggestions = [
  "Montre-moi ton CV",
  "Quels sont tes projets Laravel ?",
  "Quel est ton parcours ?",
  "Comment te contacter ?",
];

function useChat() {
  const chat = useContext(Chat);
  if (!chat) throw new Error("AssistantProvider est requis.");
  return chat;
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState(false);
  const running = useRef<AbortController | null>(null);

  useEffect(() => () => running.current?.abort(), []);

  async function send(text: string) {
    const question = text.trim().slice(0, 500);
    if (!question || running.current) return;
    const controller = new AbortController();
    running.current = controller;
    setMessages((current) => [...current, { role: "user", text: question }]);
    setPending(true);
    const timeout = setTimeout(() => controller.abort(), 24_000);
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          history: messages
            .slice(-6)
            .map(({ role, text }) => ({ role, text: text.slice(0, 800) })),
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Assistant indisponible");
      const answer = await response.json();
      if (typeof answer.text !== "string" || !Array.isArray(answer.sources))
        throw new Error("Réponse invalide");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: answer.text,
          mode: answer.mode,
          sources: answer.sources,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "La réponse n’a pas pu être chargée. Réessayez dans un instant ou explorez les rubriques du portfolio.",
        },
      ]);
    } finally {
      clearTimeout(timeout);
      running.current = null;
      setPending(false);
    }
  }

  return (
    <Chat.Provider value={{ messages, pending, send }}>
      {children}
    </Chat.Provider>
  );
}

function useAskQuestion(openAssistant: boolean) {
  const router = useRouter();
  const { pending, send } = useChat();

  function ask(question: string) {
    if (!question.trim() || pending) return;
    if (openAssistant) router.push("/assistant");
    void send(question);
  }

  return { pending, ask };
}

export function AskQuestion({
  compact = false,
  openAssistant = false,
}: {
  compact?: boolean;
  openAssistant?: boolean;
}) {
  const [question, setQuestion] = useState("");
  const { pending, ask } = useAskQuestion(openAssistant);
  const id = compact ? "question-rapide" : "question-portfolio";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim() || pending) return;
    ask(question);
    setQuestion("");
  }

  return (
    <form
      className={`${formStyles.form} ${compact ? formStyles.compact : ""}`}
      onSubmit={submit}
    >
      <MessageCircle size={compact ? 16 : 24} aria-hidden="true" />
      <label className="srOnly" htmlFor={id}>
        Poser une question sur le portfolio
      </label>
      <input
        id={id}
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        required
        maxLength={500}
        placeholder={
          compact
            ? "Écrivez votre question…"
            : "Posez-moi une question sur mon parcours, mes projets ou mes compétences…"
        }
      />
      <button type="submit" disabled={pending} aria-label="Envoyer la question">
        <ArrowUpRight size={compact ? 15 : 22} aria-hidden="true" />
      </button>
    </form>
  );
}

export function AssistantPanel({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const { messages, pending } = useChat();
  const { ask } = useAskQuestion(!standalone);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, pending]);

  return (
    <section
      className={`${styles.panel} ${standalone ? styles.assistantConversation : styles.assistantPanel}`}
      aria-labelledby="assistant-titre"
    >
      <div className={styles.panelHeader}>
        <h2 id="assistant-titre">
          <MessageCircle size={20} aria-hidden="true" />{" "}
          {standalone ? "Conversation" : "Assistant personnel"}
        </h2>
        {!standalone && (
          <Link href="/assistant">
            Ouvrir <ArrowRight size={13} aria-hidden="true" />
          </Link>
        )}
      </div>
      {!standalone || messages.length === 0 ? (
        <>
          <div className={styles.assistantIntro}>
            <span className={styles.bot}>
              <Bot size={23} aria-hidden="true" />
            </span>
            <div className={styles.bubble}>
              <strong>Bonjour !</strong>
              <p>
                Je peux vous aider à explorer le CV, les projets et le parcours
                d’Ilyes.
              </p>
            </div>
          </div>
          <p className={styles.suggestionLabel}>Exemples de questions</p>
          <div className={styles.suggestions}>
            {suggestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => ask(question)}
                disabled={pending}
              >
                {question}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div
          ref={log}
          className={styles.chatLog}
          role="log"
          aria-label="Conversation avec l’assistant"
        >
          {messages.map((message, index) => (
            <div
              className={`${styles.chatMessage} ${message.role === "user" ? styles.userMessage : ""}`}
              key={index}
            >
              <strong>
                {message.role === "user"
                  ? "Vous"
                  : message.mode === "sources"
                    ? "Extraits des sources"
                    : "Assistant"}
              </strong>
              <p>{message.text}</p>
              {message.sources && message.sources.length > 0 && (
                <ul className={styles.chatSources}>
                  {message.sources.map((source) => (
                    <li key={source.href}>
                      <Link href={source.href}>{source.title}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {pending && (
            <p role="status">Recherche dans les sources publiques…</p>
          )}
        </div>
      )}
      <div className={styles.assistantSearch}>
        <AskQuestion compact={!standalone} openAssistant={!standalone} />
      </div>
    </section>
  );
}
