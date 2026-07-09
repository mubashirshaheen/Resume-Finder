import json
from typing import Any

import httpx

from app.core.config import settings
from app.utils.text_cleaner import clean_list


class OllamaService:
    async def extract_resume_profile(self, text: str) -> dict[str, Any]:
        prompt = (
            "Extract a resume profile from the text. Return strict JSON only with this shape: "
            '{"skills":[],"keywords":[],"job_titles":[],"experience_level":""}. '
            "Use concise normalized skill names. Resume text:\n"
            f"{text[:12000]}"
        )
        try:
            async with httpx.AsyncClient(timeout=90) as client:
                response = await client.post(
                    f"{settings.ollama_base_url.rstrip('/')}/api/generate",
                    json={"model": settings.ollama_model, "prompt": prompt, "stream": False, "format": "json"},
                )
                response.raise_for_status()
                payload = response.json()
                raw = payload.get("response", "{}")
                parsed = json.loads(raw)
        except Exception:
            parsed = self._fallback_extract(text)
        return {
            "skills": clean_list(parsed.get("skills", [])),
            "keywords": clean_list(parsed.get("keywords", [])),
            "job_titles": clean_list(parsed.get("job_titles", [])),
            "experience_level": str(parsed.get("experience_level") or "unspecified"),
        }

    def _fallback_extract(self, text: str) -> dict[str, Any]:
        known = [
            "python", "javascript", "typescript", "react", "fastapi", "django", "sql", "postgresql",
            "aws", "docker", "kubernetes", "excel", "tableau", "power bi", "sales", "marketing",
            "project management", "customer support", "qa", "devops", "figma",
        ]
        lower = text.lower()
        skills = [skill for skill in known if skill in lower]
        titles = [title for title in ["software engineer", "developer", "data analyst", "project manager"] if title in lower]
        return {"skills": skills, "keywords": skills, "job_titles": titles, "experience_level": "unspecified"}


ollama_service = OllamaService()
