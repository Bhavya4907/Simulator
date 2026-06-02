"use client";

export default function RelationshipBar({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "#666", letterSpacing: "0.04em" }}>
          relationship
        </span>
        <span style={{ fontSize: 11, color: "#7F77DD", fontWeight: 500 }}>
          {clamped} / 100
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: "#2a2a2e",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${clamped}%`,
            background: "linear-gradient(90deg, #534AB7, #D4537E)",
            borderRadius: 99,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}