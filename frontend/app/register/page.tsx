"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError("");
    setLoading(true);
    try {
      const data = await register(email, password, username);
      setAuth(data.access_token, data.user_id, data.username);
      router.push("/dashboard");
    } catch (e: any) {
  const detail = e.response?.data?.detail;
  if (Array.isArray(detail)) {
    setError(detail.map((d: any) => d.msg).join(", "));
  } else if (typeof detail === "string") {
    setError(detail);
  } else {
    setError("Something went wrong");
  }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.screen}>
      <div style={styles.card}>
        <h1 style={styles.title}>create account</h1>
        <p style={styles.sub}>start your story</p>

        {error && <div style={styles.error}>{error}</div>}

        <input
          style={styles.input}
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="password (min 8 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
        />

        <button
          style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? "creating account..." : "create account"}
        </button>

        <p style={styles.switchText}>
          already have one?{" "}
          <span style={styles.link} onClick={() => router.push("/login")}>
            sign in
          </span>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  screen: {
    minHeight: "100dvh",
    background: "#0e0e0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#161618",
    border: "0.5px solid #2a2a2e",
    borderRadius: 20,
    padding: "2rem 1.75rem",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 500,
    color: "#f0f0f0",
    margin: 0,
  },
  sub: {
    fontSize: 14,
    color: "#666",
    margin: "0 0 8px",
  },
  error: {
    fontSize: 13,
    color: "#E24B4A",
    background: "#2a1010",
    border: "0.5px solid #3d1515",
    borderRadius: 10,
    padding: "8px 12px",
  },
  input: {
    background: "#1e1e22",
    border: "0.5px solid #2a2a2e",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 14,
    color: "#e8e8e8",
    outline: "none",
    fontFamily: "inherit",
    width: "100%",
  },
  btn: {
    background: "#534AB7",
    border: "none",
    borderRadius: 12,
    padding: "12px",
    fontSize: 15,
    fontWeight: 500,
    color: "#fff",
    cursor: "pointer",
    marginTop: 4,
    fontFamily: "inherit",
    transition: "opacity 0.15s",
  },
  switchText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    margin: "4px 0 0",
  },
  link: {
    color: "#7F77DD",
    cursor: "pointer",
  },
};