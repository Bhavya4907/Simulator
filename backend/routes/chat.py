from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from database.supabase import supabase
from models.message import MessageRequest
from services.llm_service import generate_reply
from services.mood_service import (
    get_delay_context,
    calculate_mood,
    calculate_relationship_delta,
)

router = APIRouter()


@router.post("/chat/{character_id}")
def chat(character_id: str, request: MessageRequest):
    # ── 1. Load character ───────────────────────────────────────────────
    try:
        char_response = (
            supabase
            .table("characters")
            .select("*")
            .eq("id", character_id)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load character: {str(e)}")

    if not char_response.data:
        raise HTTPException(status_code=404, detail="Character not found")

    character = char_response.data[0]

    # ── 2. Fetch recent message history (BEFORE saving new message) ─────
    try:
        history_response = (
            supabase
            .table("messages")
            .select("*")
            .eq("character_id", character_id)
            .order("created_at", desc=True)
            .limit(20)
            .execute()
        )
        history = list(reversed(history_response.data))  # oldest → newest
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

    # ── 3. Calculate delay since last message ───────────────────────────
    delay: float | None = None

    if history:
        last_message = history[-1]
        try:
            last_time = datetime.fromisoformat(
                last_message["created_at"].replace("Z", "+00:00")
            )
            now = datetime.now(timezone.utc)
            delay = (now - last_time).total_seconds()
        except Exception:
            delay = None  # graceful fallback

    delay_context = get_delay_context(delay)

    # ── 4. Calculate new mood and relationship score ─────────────────────
    current_mood = character.get("mood", "neutral")
    relationship_score = character.get("relationship_score", 50)

    new_mood = calculate_mood(
        relationship_score=relationship_score,
        delay_context=delay_context,
        current_mood=current_mood,
    )

    score_delta = calculate_relationship_delta(delay_context=delay_context)
    new_relationship_score = max(0, min(100, relationship_score + score_delta))

    # ── 5. Update character mood + relationship score in DB ─────────────
    try:
        supabase.table("characters").update({
            "mood": new_mood,
            "relationship_score": new_relationship_score,
        }).eq("id", character_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update character: {str(e)}")

    # ── 6. Generate reply ────────────────────────────────────────────────
    reply = generate_reply(
        name=character["name"],
        personality=character["personality"],
        backstory=character.get("backstory", ""),
        mood=new_mood,
        relationship_score=new_relationship_score,
        user_message=request.message,
        delay_context=delay_context,
        conversation_history=history,
    )

    # ── 7. Save user message + bot reply ────────────────────────────────
    try:
        supabase.table("messages").insert([
            {
                "character_id": character_id,
                "sender": "user",
                "content": request.message,
            },
            {
                "character_id": character_id,
                "sender": "bot",
                "content": reply,
            },
        ]).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save messages: {str(e)}")

    # ── 8. Return response ───────────────────────────────────────────────
    return {
        "reply": reply,
        "mood": new_mood,
        "relationship_score": new_relationship_score,
        "delay_context": delay_context,
    }