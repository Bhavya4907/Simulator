import api from "./api";

export async function generateCharacter() {
  const res = await api.post("/characters/generate-character");
  return res.data;
}

export async function getCharacter(characterId: string) {
  const res = await api.get(`/characters/character/${characterId}`);
  return res.data;
}

export async function getMessages(characterId: string) {
  const res = await api.get(`/characters/messages/${characterId}`);
  return res.data;
}

export async function sendMessage(characterId: string, message: string) {
  const res = await api.post(`/chat/chat/${characterId}`, { message });
  return res.data;
}