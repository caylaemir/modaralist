"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      toast.success("Mesajın bize ulaştı. En kısa sürede dönüş yapacağız.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast.error("Bir şeyler ters gitti. Tekrar dener misin?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="border-b border-mist/30 pb-3">
          <label className="block text-[10px] uppercase tracking-[0.3em] text-mist">
            İsim
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full bg-transparent text-base text-ink outline-none placeholder:text-mist/50"
            placeholder="Adın soyadın"
          />
        </div>
        <div className="border-b border-mist/30 pb-3">
          <label className="block text-[10px] uppercase tracking-[0.3em] text-mist">
            E-posta
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full bg-transparent text-base text-ink outline-none placeholder:text-mist/50"
            placeholder="sen@ornek.com"
          />
        </div>
      </div>

      <div className="border-b border-mist/30 pb-3">
        <label className="block text-[10px] uppercase tracking-[0.3em] text-mist">
          Konu
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-2 w-full bg-transparent text-base text-ink outline-none placeholder:text-mist/50"
          placeholder="Kısa bir başlık"
        />
      </div>

      <div className="border-b border-mist/30 pb-3">
        <label className="block text-[10px] uppercase tracking-[0.3em] text-mist">
          Mesaj
        </label>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-2 w-full resize-none bg-transparent text-base text-ink outline-none placeholder:text-mist/50"
          placeholder="Bize ne anlatmak istersin?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-12 items-center border border-ink px-8 text-[11px] uppercase tracking-[0.3em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        {loading ? "Gönderiliyor..." : "Gönder"}
      </button>
    </form>
  );
}
