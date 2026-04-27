"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, ArrowUp } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

/**
 * SelooAI — Modaralist musteri asistani widget (v2)
 *
 * Tasarim notlari:
 * - Avatar: 'S' monogram italic (display font), ink + cream
 * - Buton: 64px (size-16), breathing scale animasyon, soft glow
 * - Panel: desktop 480px, mobil full + side margin, daha ferah padding
 * - Mesaj baloncuklari: yumusak (border yok, soft bg), avatar yan yana
 */

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "M beden tişört öner",
  "Kargo bedava mı?",
  "Siyah sweat var mı?",
  "İade nasıl yapılır?",
];

export function SelooAI() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then((d) => setEnabled(d?.seloo?.enabled === true))
      .catch(() => setEnabled(false));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pending]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  // ESC ile kapat (C6) — keyboard accessibility
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function sendMessage(text: string) {
    if (!text.trim() || pending) return;
    const userMsg: ChatMsg = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data?.error ?? "Bir sorun oluştu, tekrar dener misin?",
          },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Bağlantı hatası. Tekrar dener misin?" },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  }

  if (enabled !== true) return null;

  return (
    <>
      {/* ============ FLOAT BUTTON ============ */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="SelooAI ile sohbet"
        initial={{ opacity: 0, scale: 0, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-40 size-16 md:bottom-8 md:right-[6rem]"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        {/* Breathing pulse halkasi */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-ink/20 motion-reduce:hidden"
          animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Ana avatar */}
        <span className="relative grid size-16 place-items-center rounded-full bg-ink shadow-2xl ring-1 ring-ink/10">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-paper"
              >
                <X className="size-6" strokeWidth={2.5} />
              </motion.span>
            ) : (
              <motion.span
                key="monogram"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="display select-none text-3xl italic leading-none text-paper"
                style={{ marginTop: "-2px" }}
              >
                S
              </motion.span>
            )}
          </AnimatePresence>
          {/* Online dot — sag-alt corner */}
          {!open ? (
            <span className="absolute bottom-0.5 right-0.5 size-3.5 rounded-full border-2 border-ink bg-emerald-400">
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-emerald-400 motion-reduce:hidden"
                animate={{ scale: [1, 1.6], opacity: [0.7, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            </span>
          ) : null}
        </span>
      </motion.button>

      {/* ============ CHAT PANEL ============ */}
      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="SelooAI sohbet penceresi"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-24 z-40 mx-auto flex max-h-[85vh] max-w-[480px] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] md:inset-x-auto md:bottom-28 md:right-8 md:max-h-[640px] md:w-[480px]"
            style={{
              bottom: "max(6rem, calc(env(safe-area-inset-bottom) + 5rem))",
            }}
          >
            {/* === Header === */}
            <div className="relative overflow-hidden bg-ink px-5 py-5 text-paper">
              {/* Decorative arc */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-paper/[0.04]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-8 -bottom-16 size-32 rounded-full bg-paper/[0.03]"
              />
              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative grid size-12 shrink-0 place-items-center rounded-full bg-paper/10 ring-1 ring-paper/20">
                    <span
                      className="display text-2xl italic leading-none text-paper"
                      style={{ marginTop: "-1px" }}
                    >
                      S
                    </span>
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-ink bg-emerald-400" />
                  </div>
                  <div>
                    <p className="display text-[22px] leading-none">Seloo</p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-[0.3em] text-paper/55">
                      Modaralist Asistanı · Online
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Kapat"
                  className="grid size-9 place-items-center rounded-full text-paper/60 transition-colors hover:bg-paper/10 hover:text-paper"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* === Mesajlar === */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-bone/30 px-4 py-5"
            >
              {messages.length === 0 ? (
                <Greeting onSuggestion={(s) => void sendMessage(s)} />
              ) : (
                <div className="space-y-3.5">
                  {messages.map((m, i) => (
                    <Bubble key={i} role={m.role}>
                      {m.content}
                    </Bubble>
                  ))}
                  {pending ? (
                    <Bubble role="assistant">
                      <TypingDots />
                    </Bubble>
                  ) : null}
                </div>
              )}
            </div>

            {/* === Input === */}
            <form
              onSubmit={onSubmit}
              className="border-t border-ink/10 bg-paper p-3"
            >
              <div className="flex items-end gap-2 rounded-xl border border-ink/15 bg-bone/40 p-2 transition-colors focus-within:border-ink">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Bir şey sor..."
                  rows={1}
                  maxLength={2000}
                  disabled={pending}
                  className="flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] text-ink outline-none disabled:opacity-50"
                  style={{ maxHeight: "120px" }}
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  aria-label="Gönder"
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink text-paper transition-all hover:scale-105 disabled:bg-ink/30 disabled:hover:scale-100"
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ArrowUp className="size-4" strokeWidth={2.5} />
                  )}
                </button>
              </div>
              <p className="mt-2 px-1 text-center text-[10px] text-mist">
                AI cevapları hatalı olabilir — sipariş öncesi ürün sayfasını kontrol et
              </p>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function Greeting({ onSuggestion }: { onSuggestion: (s: string) => void }) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="display text-[28px] leading-tight text-ink">
          Merhaba.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/75">
          Ben <strong className="text-ink">Seloo</strong> — Modaralist'in asistanı.
          Beden, renk, fiyat veya kargo hakkında ne sorarsan cevaplarım.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-7"
      >
        <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
          — başlamak için
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.35,
                delay: 0.25 + i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ x: 2 }}
              className="group flex items-center justify-between rounded-lg border border-ink/10 bg-paper px-4 py-3 text-left text-[14px] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              <span>{s}</span>
              <span
                aria-hidden
                className="text-mist transition-colors group-hover:text-paper"
              >
                →
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser ? (
        <div className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-paper">
          <span
            className="display text-sm italic leading-none"
            style={{ marginTop: "-1px" }}
          >
            S
          </span>
        </div>
      ) : null}
      <div
        className={`max-w-[78%] px-4 py-2.5 text-[14.5px] leading-relaxed ${
          isUser
            ? "rounded-2xl rounded-br-sm bg-ink text-paper"
            : "rounded-2xl rounded-bl-sm bg-paper text-ink shadow-sm"
        }`}
      >
        {typeof children === "string" ? (
          <FormattedText text={children} />
        ) : (
          children
        )}
      </div>
    </motion.div>
  );
}

function FormattedText({ text }: { text: string }) {
  // 1) Once tum HTML/URL ozel karakterleri escape — boylece AI hostile cikti
  //    versin, raw HTML render olmaz.
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // 2) URL'leri tikkanabilir yap — encodeURI ile href'i sertlestir
  //    (URL icinde quote/onclick injection imkansizlasir)
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const withLinks = escaped.replace(urlRegex, (url) => {
    const trail = url.match(/[.,;:!?]+$/)?.[0] ?? "";
    const clean = trail ? url.slice(0, -trail.length) : url;
    // Sadece http/https'e izin ver (javascript:, data: vs. reddet)
    if (!/^https?:\/\//i.test(clean)) return url;
    const safe = encodeURI(clean);
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="underline underline-offset-4 break-words">${clean}</a>${trail}`;
  });

  // 3) **bold** + newline destegi
  const formatted = withLinks
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  // 4) FINAL: DOMPurify ile sadece <a><strong><br> izinli, tum geri kalan strip
  //    Defense-in-depth: bir sekilde injection olsa bile burada elenir
  const safe = DOMPurify.sanitize(formatted, {
    ALLOWED_TAGS: ["a", "strong", "br"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOWED_URI_REGEXP: /^https?:\/\//i,
  });

  return <span dangerouslySetInnerHTML={{ __html: safe }} />;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-2 rounded-full bg-ink/40"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
