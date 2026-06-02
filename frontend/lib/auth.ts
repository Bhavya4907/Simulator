import api from "./api";

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function register(email: string, password: string, username: string) {
  const res = await api.post("/auth/register", { email, password, username });
  return res.data;
}