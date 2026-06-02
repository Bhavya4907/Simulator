"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { getCharacter, getMessages, sendMessage } from "@/lib/chat";
import MoodBadge from "@/components/MoodBadge";
import RelationshipBar from "@/components/RelationshipBar";
import TypingIndicator from "@/components/TypingIndicator";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthStore();
  const {
    character,
    messages,
    isTyping,
    setCharacter,
    setMessages,
    addMessage,
    updateCharacterState,
    setIsTyping,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  // Load character + history on mount
  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [char, msgs] = await Promise.all([
          getCharacter(id),
          getMessages(id),
        ]);
        setCharacter(char);
        setMessages(msgs);
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;

    setInput("");
    addMessage({ character_id: id, sender: "user", content: text });
    setIsTyping(true);

    try {
      const data = await sendMessage(id, text);
      addMessage({ character_id: id, sender: "bot", content: data.reply });
      updateCharacterState(data.mood, data.relationship_score);
    } catch {
      addMessage({
        character_id: id,
        sender: "bot",
        content: "...",
      });
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  const initials = character?.name?.slice(0, 1).toUpperCase() ?? "?";

  return (
    <div style={styles.screen}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.avatar}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={styles.charName}>{character?.name}</div>
            <div style={{ marginTop: 3 }}>
              <MoodBadge mood={character?.mood ?? "neutral"} />
            </div>
          </div>
          <button style={styles.backBtn} onClick={() => router.push("/dashboard")}>
            ←
          </button>
        </div>
        <RelationshipBar score={character?.relationship_score ?? 50} />
      </div>

      {/* ── Messages ── */}
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.emptyState}>
            say something to {character?.name}...
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.msgRow,
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.sender === "bot" && (
              <div style={styles.botAvatar}>{initials}</div>
            )}
            <div
              style={{
                ...styles.bubble,
                ...(msg.sender === "user" ? styles.userBubble : styles.botBubble),
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ padding: "0 4px" }}>
            <TypingIndicator />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input bar ── */}
      <div style={styles.inputBar}>
        <input
          ref={inputRef}
          style={styles.inputField}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`message ${character?.name ?? ""}...`}
          disabled={isTyping}
          autoFocus
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: isTyping || !input.trim() ? 0.4 : 1,
          }}
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    background: "#0e0e0f",
    maxWidth: 480,
    margin: "0 auto",
    fontFamily: "'DM Sans', sans-serif",
  },
  loadingScreen: {
    height: "100dvh",
    background: "#0e0e0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#7F77DD",
    animation: "pulse 1.2s infinite",
  },
  header: {
    background: "#161618",
    borderBottom: "0.5px solid #2a2a2e",
    padding: "14px 16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    flexShrink: 0,
  },
  headerTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7F77DD, #D4537E)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 500,
    color: "#fff",
    flexShrink: 0,
  },
  charName: {
    fontSize: 15,
    fontWeight: 500,
    color: "#f0f0f0",
    lineHeight: 1.2,
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#666",
    fontSize: 20,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 8,
  },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  emptyState: {
    textAlign: "center",
    color: "#444",
    fontSize: 14,
    marginTop: "40%",
  },
  msgRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7F77DD, #D4537E)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    color: "#fff",
    fontWeight: 500,
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: 260,
    padding: "9px 13px",
    borderRadius: 18,
    fontSize: 14,
    lineHeight: 1.55,
  },
  userBubble: {
    background: "#534AB7",
    color: "#fff",
    borderBottomRightRadius: 5,
  },
  botBubble: {
    background: "#1e1e22",
    color: "#e8e8e8",
    borderBottomLeftRadius: 5,
    border: "0.5px solid #2a2a2e",
  },
  inputBar: {
    background: "#161618",
    borderTop: "0.5px solid #2a2a2e",
    padding: "10px 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  inputField: {
    flex: 1,
    background: "#1e1e22",
    border: "0.5px solid #2a2a2e",
    borderRadius: 20,
    padding: "10px 14px",
    fontSize: 14,
    color: "#e8e8e8",
    outline: "none",
    fontFamily: "inherit",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#534AB7",
    border: "none",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.15s, opacity 0.15s",
  },
};