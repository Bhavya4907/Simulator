"""
mood_service.py

Handles mood calculation based on relationship score,
delay context, and conversation dynamics.
"""


def get_delay_context(delay: float | None) -> str:
    """
    Converts a raw delay in seconds into a human-readable context string.

    Args:
        delay: Seconds since last message. None if this is the first message.

    Returns:
        A string label describing the delay.
    """
    if delay is None:
        return "first message"

    if delay < 60:
        return "instant reply"

    if delay < 3600:        # under 1 hour
        return "normal reply"

    if delay < 86400:       # under 24 hours
        return "hours later"

    return "days later"


def calculate_mood(
    relationship_score: int,
    delay_context: str,
    current_mood: str = "neutral",
) -> str:
    """
    Calculates the character's current mood based on relationship health,
    how long the user took to reply, and what mood they were already in.

    Priority order: delay > relationship score > default

    Args:
        relationship_score: 0–100 integer representing closeness.
        delay_context: Output of get_delay_context().
        current_mood: The character's mood before this message arrived.

    Returns:
        A mood string: one of neutral, happy, sad, angry, flirty, jealous, cold, excited.
    """

    # ── Delay-driven moods ──────────────────────────────────────────────
    if delay_context == "days later":
        # If the relationship is strong, they're sad/hurt. If weak, they're cold.
        if relationship_score >= 60:
            return "sad"
        else:
            return "cold"

    if delay_context == "hours later":
        # Clingy types get anxious; others are mildly bothered
        if relationship_score >= 70:
            return "jealous"

    # ── Relationship-score-driven moods ────────────────────────────────
    if relationship_score <= 15:
        return "angry"

    if relationship_score <= 35:
        return "cold"

    if relationship_score >= 90:
        # Very high score + fast reply = excited
        if delay_context in ("instant reply", "normal reply"):
            return "excited"
        return "flirty"

    if relationship_score >= 75:
        return "flirty"

    # ── Carry-over mood with some decay ────────────────────────────────
    # Strong negative moods persist unless relationship score is high
    if current_mood in ("angry", "cold") and relationship_score < 60:
        return current_mood

    if current_mood == "sad" and delay_context == "instant reply":
        # They came back fast — soften the sadness
        return "neutral"

    return "neutral"


def calculate_relationship_delta(
    delay_context: str,
    message_sentiment: str = "neutral",
) -> int:
    """
    Returns how much to adjust the relationship score after a message.

    Args:
        delay_context: How long it took the user to reply.
        message_sentiment: Optional — 'positive', 'negative', or 'neutral'.
                           You can hook this up to sentiment analysis later.

    Returns:
        An integer delta to add to relationship_score (can be negative).
    """
    delta = 0

    # Timing impact
    timing_deltas = {
        "first message":  +2,
        "instant reply":  +3,
        "normal reply":   +1,
        "hours later":    -1,
        "days later":     -5,
    }
    delta += timing_deltas.get(delay_context, 0)

    # Sentiment impact
    sentiment_deltas = {
        "positive":  +2,
        "neutral":    0,
        "negative":  -3,
    }
    delta += sentiment_deltas.get(message_sentiment, 0)

    return delta