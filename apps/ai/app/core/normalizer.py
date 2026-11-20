import re
import unicodedata


def normalized(value: str) -> str:
    """Normalize Vietnamese text: remove accents, fold case, strip extra whitespace."""
    folded = unicodedata.normalize("NFD", value.casefold()).replace("đ", "d")
    return " ".join(re.findall(r"[a-z0-9]+", "".join(c for c in folded if not unicodedata.combining(c))))


def contains_phrase(value: str, phrase: str) -> bool:
    """Check if normalized value contains normalized phrase as whole token(s)."""
    target = normalized(phrase)
    return bool(target) and f" {target} " in f" {normalized(value)} "


def plain(value: str | None, limit: int = 500) -> str:
    """Strip HTML tags and truncate text."""
    return " ".join(re.sub(r"<[^>]+>", " ", value or "").split())[:limit]

