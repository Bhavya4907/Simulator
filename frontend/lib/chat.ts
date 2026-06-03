import api from "./api";

export async function generateCharacter() {
  const res = await api.post("/characters/generate-character");
  return res.data;
}

export async function getCharacter(id: string) {
  const res = await api.get(`/characters/character/${id}`);
  return res.data;
}

export async function getMessages(id: string) {
  const res = await api.get(`/characters/messages/${id}`);
  return res.data;
}

export async function sendMessage(id: string, content: string) {
  const res = await api.post(`/chat/chat/${id}`, { message: content });
  return res.data;
}
