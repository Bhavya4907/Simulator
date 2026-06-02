"use client";

const MOOD_COLORS: Record<string, { dot: string; text: string; bg: string; border: string }> = {
  flirty:  { dot: "#ED93B1", text: "#ED93B1", bg: "#2a1e2e", border: "#3d2540" },
  excited: { dot: "#EF9F27", text: "#EF9F27", bg: "#2a2010", border: "#3d3015" },
  neutral: { dot: "#888780", text: "#888780", bg: "#1e1e1e", border: "#2a2a2e" },
  sad:     { dot: "#85B7EB", text: "#85B7EB", bg: "#131c2a", border: "#1e2e40" },
  angry:   { dot: "#E24B4A", text: "#E24B4A", bg: "#2a1010", border: "#3d1515" },
  cold:    { dot: "#5DCAA5", text: "#5DCAA5", bg: "#0f2420", border: "#1a3830" },
  jealous: { dot: "#AFA9EC", text: "#AFA9EC", bg: "#1a1830", border: "#2a2845" },
};

export default function MoodBadge({ mood }: { mood: string }) {
  const colors = MOOD_COLORS[mood] ?? MOOD_COLORS.neutral;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        borderRadius: "99px",
        background: colors.bg,
        border: `0.5px solid ${colors.border}`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: colors.dot,
          display: "inline-block",
          animation: "pulse 2s infinite",
        }}
      />
      <span style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>
        {mood}
      </span>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}