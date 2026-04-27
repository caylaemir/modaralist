"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";

/**
 * SelooAI — Modaralist musteri asistani widget
 * Sag-altta float buton + click ile slide-up panel (Kodee tarzi)
 *
 * State'ler localStorage'da degil — her sayfa yenilemesinde sifirlanir
 * (kullanici verisini kalici tutmuyoruz, KVKK temiz)
 */

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
};

const STORAGE_KEY = "seloo-open";

const SUGGESTIONS = [
  "Bana M beden tişört öner",
  "Kargo bedava mı?",
  "Siyah sweat var mı?",
  "İade nasıl yapılır?",
];

const GREETING = `Merhaba, ben **Seloo** — Modaralist asistanın.

Ürün arıyorsan beden, renk ve fiyat aralığı söyle, sana uygun parçaları bulayım. Kargo, iade veya bedenler hakkında da sorabilirsin.`;

export function SelooAI() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Settings'ten aktif mi
  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then((d) => setEnabled(d?.seloo?.enabled === true))
      .catch(() => setEnabled(false));
  }, []);

  // Acilis durumunu sessionStorage'da hatirla (sekme bazli)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      // Otomatik acma — sadece kullanici manuel acmissa hatirlat
    }
  }, []);

  // Mesaj eklenince scroll en alta
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pending]);

  // Acilinca input'a focus
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  function toggleOpen() {
    setOpen((v) => {
      const next = !v;
      try {
        sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

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
            content: data?.error ?? "Bir sorun oluştu, tekrar dene.",
          },
        ]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Bağlantı hatası, tekrar dene." },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    void sendMessage(input);
  }

  if (enabled !== true) return null;

  return (
    <>
      {/* --- Float button (sag-alt) --- */}
      <motion.button
        type="button"
        onClick={toggleOpen}
        aria-label="SelooAI ile sohbet"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-ink text-paper shadow-2xl md:bottom-8 md:right-[5.5rem]"
        style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
      >
        {/* Pulse halkasi */}
        <span className="absolute inset-0 rounded-full bg-ink/30 motion-reduce:hidden">
          <motion.span
            className="absolute inset-0 rounded-full bg-ink/40"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
        </span>
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <X className="size-6" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <Sparkles className="size-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* --- Chat panel --- */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-3 bottom-24 z-40 mx-auto flex max-h-[80vh] max-w-md flex-col overflow-hidden border border-line bg-paper shadow-2xl md:inset-x-auto md:bottom-28 md:right-8 md:max-h-[600px] md:w-[420px]"
            style={{
              bottom: "max(6rem, calc(env(safe-area-inset-bottom) + 5rem))",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-ink px-5 py-4 text-paper">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-paper/10">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="display text-lg leading-none">Seloo</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-paper/60">
                    Modaralist asistanı
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleOpen}
                aria-label="Kapat"
                className="text-paper/70 hover:text-paper"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Mesajlar */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-bone/40 px-4 py-4"
            >
              {messages.length === 0 ? (
                <Greeting onSuggestion={(s) => void sendMessage(s)} />
              ) : (
                <div className="space-y-3">
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

            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="border-t border-line bg-paper p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bir şey sor — beden, renk, fiyat..."
                  maxLength={2000}
                  disabled={pending}
                  className="flex-1 border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  aria-label="Gönder"
                  className="grid size-10 shrink-0 place-items-center bg-ink text-paper transition-opacity hover:opacity-90 disabled:opacity-30"
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </div>
              <p className="mt-2 px-1 text-[10px] text-mist">
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
  // Markdown bold rendering — basit ** -> strong dönüşümü
  const html = GREETING.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(
    /\n/g,
    "<br/>"
  );
  return (
    <div>
      <div className="border border-line bg-paper p-4">
        <p
          className="text-sm leading-relaxed text-ink"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-mist">
        — örnek sorular
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="border border-line bg-paper px-3 py-1.5 text-[12px] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            {s}
          </button>
        ))}
      </div>
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
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-ink text-paper"
            : "border border-line bg-paper text-ink"
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

/**
 * AI metnini basit format: linkleri tıklanabilir yap, **bold**, satır kır
 */
function FormattedText({ text }: { text: string }) {
  // URL'leri bul ve <a> ile sar (autolink)
  const urlRegex = /(https?:\/\/[^\s)]+)/g;
  const withLinks = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(urlRegex, (url) => {
      // Trailing punctuation'i temizle
      const trail = url.match(/[.,;:!?]+$/)?.[0] ?? "";
      const clean = trail ? url.slice(0, -trail.length) : url;
      return `<a href="${clean}" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 break-all">${clean}</a>${trail}`;
    })
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");

  return <span dangerouslySetInnerHTML={{ __html: withLinks }} />;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-1.5 rounded-full bg-ink/60"
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}
