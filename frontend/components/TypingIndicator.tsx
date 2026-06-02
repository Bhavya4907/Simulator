export default function TypingIndicator() {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "4px 0" }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #7F77DD, #D4537E)",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          background: "#1e1e22",
          border: "0.5px solid #2a2a2e",
          borderRadius: 18,
          borderBottomLeftRadius: 5,
          padding: "10px 14px",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#555",
              display: "inline-block",
              animation: `typingBounce 1.2s infinite ${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); background: #555; }
          30% { transform: translateY(-5px); background: #7F77DD; }
        }
      `}</style>
    </div>
  );
}