import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import api from "@/api/client";

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      await api.post("/support/", { name, message });
      setSent(true);
      setName("");
      setMessage("");
      setTimeout(() => { setSent(false); setOpen(false); }, 2500);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 900,
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--color-primary)", color: "#fff",
          border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s",
        }}
        title="Техническая поддержка"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 24, zIndex: 900,
          width: 320, background: "var(--color-white)", borderRadius: 14,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "var(--color-primary)", padding: "14px 18px", color: "#fff" }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Техническая поддержка</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Напишите нам — ответим как можно скорее</div>
          </div>

          {/* Body */}
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {sent ? (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-success)", fontWeight: 600 }}>
                ✓ Сообщение отправлено!
              </div>
            ) : (
              <>
                <input
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-gray-300)", fontSize: 13, fontFamily: "inherit", outline: "none" }}
                />
                <textarea
                  placeholder="Опишите проблему…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid var(--color-gray-300)", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none" }}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 0", borderRadius: 8, border: "none", cursor: loading ? "wait" : "pointer",
                    background: "var(--color-primary)", color: "#fff", fontWeight: 600, fontSize: 13, fontFamily: "inherit",
                    opacity: !message.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={14} /> {loading ? "Отправка…" : "Отправить"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
