import re


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    value = value.lower()
    value = re.sub(r"[^a-z0-9+#.\s]", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def clean_list(values: list[str] | None) -> list[str]:
    if not values:
        return []
    seen: set[str] = set()
    cleaned: list[str] = []
    for value in values:
        normalized = normalize_text(str(value))
        if normalized and normalized not in seen:
            seen.add(normalized)
            cleaned.append(value.strip())
    return cleaned
