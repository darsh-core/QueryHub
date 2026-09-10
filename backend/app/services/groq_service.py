import os
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from app.config import settings

class GroqAIService:
    @classmethod
    def call_groq_chat(
        cls, 
        system_prompt: str, 
        user_prompt: str, 
        temperature: float = 0.2, 
        response_format_json: bool = False
    ) -> Optional[str]:
        api_key = getattr(settings, "GROQ_API_KEY", "") or os.getenv("GROQ_API_KEY", "")
        if not api_key:
            return None

        # Standard Groq Qwen / Llama models fallback list
        models_to_try = [
            getattr(settings, "GROQ_MODEL", "qwen-2.5-32b"),
            "qwen-2.5-32b",
            "qwen-2.5-coder-32b",
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant"
        ]
        
        unique_models = []
        for m in models_to_try:
            if m and m not in unique_models:
                unique_models.append(m)

        base_url = getattr(settings, "GROQ_BASE_URL", "https://api.groq.com/openai/v1")

        for model in unique_models:
            payload = {
                "model": model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": temperature
            }
            if response_format_json:
                payload["response_format"] = {"type": "json_object"}

            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                f"{base_url.rstrip('/')}/chat/completions",
                data=data_bytes,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                }
            )

            try:
                with urllib.request.urlopen(req, timeout=30.0) as resp:
                    if resp.status == 200:
                        body = json.loads(resp.read().decode("utf-8"))
                        choices = body.get("choices", [])
                        if choices:
                            content = choices[0].get("message", {}).get("content", "")
                            if content:
                                print(f"[Groq AI Engine] Generated response using model '{model}'.")
                                return content
            except Exception as e:
                print(f"[Groq AI Engine Notice] Model '{model}' error: {e}. Trying fallback...")

        return None
