"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { generateCharacter } from "@/lib/chat";
import MoodBadge from "@/components/MoodBadge";

export default function DashboardPage() {
  const router = useRouter();
  const { token, username, logout } = useAuthStore();
  const { character, setCharacter, reset } = useChatStore();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  async function handleGenerate() {
    setError("");
    setGenerating(true);
    reset();
    try {
      const char = await generateCharacter();
      setCharacter(char);
    } catch {
      setError("Failed to generate character. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  const traits = character?.personality?.split(", ") ?? [];

  return (
    <div style={styles.screen}>
      <div style={styles.topBar}>
        <span style={styles.greeting}>hey, {username} 👋</span>
        <button style={styles.logoutBtn} onClick={() => { logout(); router.push("/login"); }}>
          sign out
        </button>
      </div>

      <div style={styles.content}>
        <h1 style={styles.heading}>your companion</h1>
        <p style={styles.sub}>generate a character and start chatting</p>

        {error && <div style={styles.error}>{error}</div>}

        {character ? (
          <div style={styles.charCard}>
            <div style={styles.cardHeader}>
              <div style={styles.bigAvatar}>
                {character.name.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={styles.charName}>{character.name}</div>
                <MoodBadge mood={character.mood} />
              </div>
            </div>

            <div style={styles.traitRow}>
              {traits.map((t) => (
                <span key={t} style={styles.traitBadge}>{t}</span>
              ))}
            </div>

            {character.backstory && (
              <p style={styles.backstory}>"{character.backstory}"</p>
            )}

            <div style={styles.scoreRow}>
              <span style={styles.scoreLabel}>relationship</span>
              <span style={styles.scoreNum}>{character.relationship_score} / 100</span>
            </div>
            <div style={styles.scoreBarBg}>
              <div style={{ ...styles.scoreBarFill, width: `${character.relationship_score}%` }} />
            </div>

            <div style={styles.btnGroup}>
              <button style={styles.chatBtn} onClick={() => router.push(`/chat/${character.id}`)}>
                start chatting →
              </button>
              <button style={styles.regenBtn} onClick={handleGenerate} disabled={generating}>
                {generating ? "generating..." : "regenerate"}
              </button>
            </div>
          </div>
        ) : (
          <button
            style={{ ...styles.generateBtn, opacity: generating ? 0.6 : 1 }}
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "generating..." : "generate character"}
          </button>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100dvh",
    background: "#0e0e0f",
    fontFamily: "'DM Sans', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "0.5px solid #2a2a2e",
    background: "#161618",
  },
  greeting: {
    fontSize: 14,
    color: "#888",
  },
  logoutBtn: {
    background: "none",
    border: "0.5px solid #2a2a2e",
    borderRadius: 8,
    padding: "5px 12px",
    fontSize: 13,
    color: "#666",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2.5rem 1.5rem",
    maxWidth: 480,
    margin: "0 auto",
    width: "100%",
  },
  heading: {
    fontSize: 28,
    fontWeight: 500,
    color: "#f0f0f0",
    margin: 0,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  error: {
    fontSize: 13,
    color: "#E24B4A",
    background: "#2a1010",
    border: "0.5px solid #3d1515",
    borderRadius: 10,
    padding: "8px 12px",
    marginBottom: 12,
    width: "100%",
  },
  generateBtn: {
    background: "#534AB7",
    border: "none",
    borderRadius: 14,
    padding: "14px 32px",
    fontSize: 15,
    fontWeight: 500,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
    marginTop: "4rem",
    transition: "opacity 0.15s",
  },
  charCard: {
    background: "#161618",
    border: "0.5px solid #2a2a2e",
    borderRadius: 20,
    padding: "1.5rem",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  bigAvatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #7F77DD, #D4537E)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 500,
    color: "#fff",
    flexShrink: 0,
  },
  charName: {
    fontSize: 18,
    fontWeight: 500,
    color: "#f0f0f0",
    marginBottom: 5,
  },
  traitRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
  },
  traitBadge: {
    fontSize: 12,
    color: "#AFA9EC",
    background: "#1a1830",
    border: "0.5px solid #2a2845",
    borderRadius: 99,
    padding: "3px 10px",
  },
  backstory: {
    fontSize: 13,
    color: "#555",
    fontStyle: "italic",
    lineHeight: 1.6,
    margin: 0,
  },
  scoreRow: {
    display: "flex",
    justifyContent: "space-between",
  },
  scoreLabel: {
    fontSize: 12,
    color: "#555",
  },
  scoreNum: {
    fontSize: 12,
    color: "#7F77DD",
    fontWeight: 500,
  },
  scoreBarBg: {
    height: 4,
    background: "#2a2a2e",
    borderRadius: 99,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #534AB7, #D4537E)",
    borderRadius: 99,
    transition: "width 0.6s ease",
  },
  btnGroup: {
    display: "flex",
    gap: 8,
    marginTop: 4,
  },
  chatBtn: {
    flex: 1,
    background: "#534AB7",
    border: "none",
    borderRadius: 12,
    padding: "12px",
    fontSize: 14,
    fontWeight: 500,
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  regenBtn: {
    background: "none",
    border: "0.5px solid #2a2a2e",
    borderRadius: 12,
    padding: "12px 16px",
    fontSize: 14,
    color: "#666",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};