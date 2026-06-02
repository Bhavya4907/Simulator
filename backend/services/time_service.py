from datetime import datetime, timezone


def get_time_context() -> str:
    """
    Returns a string describing the current time of day.
    Uses local server time. For user-timezone awareness, pass
    a UTC offset from the client and adjust accordingly.

    Returns:
        One of: 'morning', 'afternoon', 'evening', 'night'
    """
    hour = datetime.now().hour

    if 5 <= hour < 12:
        return "morning"

    if 12 <= hour < 17:
        return "afternoon"

    if 17 <= hour < 22:
        return "evening"

    return "night"


def get_utc_now() -> datetime:
    """Returns the current UTC time as a timezone-aware datetime."""
    return datetime.now(timezone.utc)