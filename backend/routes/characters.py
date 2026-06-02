import random
from fastapi import APIRouter, HTTPException
from database.supabase import supabase

router = APIRouter()

NAMES = [
    "Aria", "Zoe", "Luna", "Nova", "Mia",
    "Cleo", "Ivy", "Jade", "Nora", "Lena",
    "Kai", "Rex", "Finn", "Eli", "Zach"
]

TRAITS = [
    "Playful",
    "Shy",
    "Sarcastic",
    "Clingy",
    "Jealous",
    "Energetic",
    "Romantic",
    "Introverted",
    "Chaotic",
    "Cold",
    "Wholesome",
    "Mysterious",
    "Tsundere",
    "Supportive",
    "Dramatic"
]

# Each archetype is a curated combo that creates a distinct personality feel
ARCHETYPES = [
    ["Tsundere", "Jealous", "Romantic"],
    ["Shy", "Wholesome", "Introverted"],
    ["Sarcastic", "Cold", "Mysterious"],
    ["Playful", "Energetic", "Chaotic"],
    ["Clingy", "Dramatic", "Romantic"],
    ["Supportive", "Wholesome", "Shy"],
    ["Mysterious", "Cold", "Introverted"],
    ["Energetic", "Playful", "Dramatic"],
]

BACKSTORIES = [
    "grew up moving between cities and never stayed long enough to make real friends",
    "used to be really open but got hurt once and built walls ever since",
    "has always been the 'reliable one' and secretly craves someone who checks on them too",
    "is terrified of being forgotten, so they try too hard to be memorable",
    "pretends not to care about anything but actually cares way too much",
    "has a habit of pushing people away right when they get close",
    "fell in love once and it ended badly — still recovering",
    "has never really had someone who stayed, so they test people constantly",
]


@router.post("/generate-character")
def generate():
    try:
        name = random.choice(NAMES)
        personality_traits = random.choice(ARCHETYPES)
        backstory = random.choice(BACKSTORIES)

        character = {
            "name": name,
            "personality": ", ".join(personality_traits),
            "backstory": backstory,
            "mood": "neutral",
            "relationship_score": 50,
        }

        response = supabase.table("characters").insert(character).execute()

        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create character")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/character/{character_id}")
def get_character(character_id: str):
    try:
        response = (
            supabase
            .table("characters")
            .select("*")
            .eq("id", character_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Character not found")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.get("/messages/{character_id}")
def get_messages(character_id: str):
    try:
        # Verify character exists first
        char_check = (
            supabase
            .table("characters")
            .select("id")
            .eq("id", character_id)
            .execute()
        )

        if not char_check.data:
            raise HTTPException(status_code=404, detail="Character not found")

        response = (
            supabase
            .table("messages")
            .select("*")
            .eq("character_id", character_id)
            .order("created_at", desc=False)
            .execute()
        )

        return response.data

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")