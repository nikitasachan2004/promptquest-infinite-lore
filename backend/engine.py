import json
import re
import time
from openai import OpenAI
from config import NIM_API_KEY

# NVIDIA NIM — OpenAI-compatible, free tier, no billing needed
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NIM_API_KEY,
)

MODEL = "meta/llama-3.1-8b-instruct"


def generate_story_turn(previous_state: dict, player_action: str, theme: str = "cyberpunk") -> dict:
    system_msg = f"""You are an expert AI Game Master running an immersive, choice-driven {theme} text adventure.
Respond ONLY with a valid JSON object — no markdown, no explanation, no preamble.

JSON format:
{{
    "room_title": "String: Name of the location",
    "story_text": "String: The narrative text of what happens",
    "ascii_art": "String: 5-10 lines of ASCII art",
    "theme_palette": "{theme}",
    "game_changes": {{
        "health_delta": 0,
        "inventory_added": [],
        "inventory_removed": []
    }},
    "options": ["Choice 1", "Choice 2", "Choice 3"],
    "is_game_over": false,
    "game_over_reason": ""
}}"""

    user_msg = f"""Current game state:
{json.dumps(previous_state) if previous_state else "Start of game. Player is waking up in the setting."}

Player action: "{player_action}"

Evaluate the action logically, track health/inventory, describe consequences vividly, generate ASCII art.

For the 3 options, follow these rules strictly:
- Each option must be SPECIFIC to what just happened in the story — never generic like "Fight", "Run", or "Explore"
- Each option must lead to a meaningfully DIFFERENT outcome or path
- Write them as concrete actions the player would take, referencing actual objects, characters, or places from the current scene
- No two options should feel similar to each other
- Options should reflect the player's current inventory and health state"""

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.9,
                max_tokens=2048,
            )
            break
        except Exception as e:
            error_str = str(e).lower()
            is_rate_limit = "429" in error_str or "rate" in error_str or "quota" in error_str
            if is_rate_limit and attempt < max_retries - 1:
                wait = 2 ** attempt
                print(f"[engine] Rate limited. Retrying in {wait}s... (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait)
                continue
            raise

    text = response.choices[0].message.content.strip()

    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    # Extract first JSON object if model added extra text
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if match:
        text = match.group(0)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        open_braces = text.count("{") - text.count("}")
        open_brackets = text.count("[") - text.count("]")
        text += "]" * open_brackets + "}" * open_braces
        return json.loads(text)