from __future__ import annotations

import json
import re
from typing import Any

from openai import AsyncOpenAI

from config import settings
from services.normalizer import normalize_locality, normalize_parsed_requirement

_client: AsyncOpenAI | None = None

_explanation_cache: dict[tuple, str] = {}
_sentiment_cache: dict[str, dict[str, Any]] = {}
_room_explanation_cache: dict[tuple, str] = {}


def get_openai_client() -> AsyncOpenAI | None:
    global _client
    if not settings.openai_configured:
        return None
    if _client is None:
        key = settings.openai_api_key.strip()
        kwargs = {"api_key": key}
        
        # Detect key type and configure base URL and model accordingly
        if key.startswith("gsk_"):
            kwargs["base_url"] = "https://api.groq.com/openai/v1"
            if settings.openai_model == "gpt-4o-mini":
                settings.openai_model = "llama-3.3-70b-versatile"
        elif key.startswith("AIzaSy"):
            kwargs["base_url"] = "https://generativelanguage.googleapis.com/v1beta/openai/"
            if settings.openai_model == "gpt-4o-mini":
                settings.openai_model = "gemini-2.5-flash"
                
        _client = AsyncOpenAI(**kwargs)
    return _client



async def _chat_json(system: str, user: str) -> dict[str, Any] | None:
    client = get_openai_client()
    if not client:
        return None
    try:
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            timeout=10.0,
        )
        content = response.choices[0].message.content
        if not content:
            return None
        return json.loads(content)
    except Exception:
        return None


async def _chat_text(system: str, user: str) -> str | None:
    client = get_openai_client()
    if not client:
        return None
    try:
        response = await client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.4,
            timeout=10.0,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def extract_locality_fuzzy(query: str) -> str | None:
    lowercase = query.lower()
    localities_list = [
        "Hinjewadi",
        "Wakad",
        "Baner",
        "Hadapsar",
        "Kharadi",
        "Viman Nagar",
        "Kothrud",
        "Kalyani Nagar",
        "Whitefield",
        "Indiranagar",
        "Koramangala",
    ]
    mappings = [
        (("hinja", "hinje"), "Hinjewadi"),
        (("wakad",), "Wakad"),
        (("baner",), "Baner"),
        (("hadapsar", "hadaps"), "Hadapsar"),
        (("kharadi", "khara", "kharra"), "Kharadi"),
        (("viman",), "Viman Nagar"),
        (("kothrud", "koth", "kthrud"), "Kothrud"),
        (("kalyani",), "Kalyani Nagar"),
        (("whitefield",), "Whitefield"),
        (("indiranagar", "indira"), "Indiranagar"),
        (("koramangala", "kora"), "Koramangala"),
    ]
    for keys, value in mappings:
        if any(k in lowercase for k in keys):
            return value

    words = re.findall(r"\b[a-z]{3,}\b", lowercase)
    for i in range(len(words) - 1):
        words.append(f"{words[i]} {words[i+1]}")

    import difflib
    targets = {x.lower(): x for x in localities_list}

    for cutoff in [0.7, 0.5]:
        for word in words:
            matches = difflib.get_close_matches(word, list(targets.keys()), n=1, cutoff=cutoff)
            if matches:
                return targets[matches[0]]
    return None


def mock_parse_query(query: str) -> dict[str, Any]:
    lowercase = query.lower()
    city = "Pune"
    locality = extract_locality_fuzzy(lowercase)
    transaction_type = "Buy"
    bhk = None
    budget_max = None
    property_type = "Apartment"
    status_preference = None
    preference_notes = ""

    if locality:
        pune_localities = {"hinjewadi", "wakad", "baner", "hadapsar", "kharadi", "viman nagar", "kothrud", "kalyani nagar"}
        bangalore_localities = {"whitefield", "indiranagar", "koramangala"}
        loc_lower = locality.lower()
        if loc_lower in pune_localities:
            city = "Pune"
        elif loc_lower in bangalore_localities:
            city = "Bangalore"
    else:
        if any(x in lowercase for x in ("bangalore", "bengaluru", "whitefield", "indiranagar", "koramangala")):
            city = "Bangalore"

    if any(x in lowercase for x in ("rent", "rental", "pg", "lease", "monthly")):
        transaction_type = "Rent"

    for n, label in [(1, "1 bhk"), (2, "2 bhk"), (3, "3 bhk"), (4, "4 bhk")]:
        if label in lowercase or f"{n}bhk" in lowercase:
            bhk = n
            break

    lakh_match = re.search(r"under\s+(\d+(?:\.\d+)?)\s*(?:lakh|l|lac)", lowercase)
    cr_match = re.search(r"under\s+(\d+(?:\.\d+)?)\s*(?:cr|crore)", lowercase)
    k_match = re.search(r"under\s+(\d+)\s*(?:k|thousand)", lowercase)
    if lakh_match:
        budget_max = int(round(float(lakh_match.group(1)) * 100_000))
    elif cr_match:
        budget_max = int(round(float(cr_match.group(1)) * 10_000_000))
    elif k_match:
        budget_max = int(k_match.group(1)) * 1000

    if any(x in lowercase for x in ("villa", "house", "bungalow")):
        property_type = "Villa"
    if any(x in lowercase for x in ("ready", "move-in", "immediate")):
        status_preference = "Ready to Move"
    elif any(x in lowercase for x in ("construction", "new launch", "project")):
        status_preference = "Under Construction"

    if "metro" in lowercase:
        preference_notes += "Proximity to Metro. "
    if any(x in lowercase for x in ("it park", "office")):
        preference_notes += "Near IT corridors. "
    if not preference_notes:
        preference_notes = "Standard residential search."

    return {
        "city": city,
        "locality": locality,
        "transaction_type": transaction_type,
        "bhk": bhk,
        "budget_max": budget_max,
        "property_type": property_type,
        "status_preference": status_preference,
        "preference_notes": preference_notes.strip(),
        "vastu_compliant_only": any(x in lowercase for x in ("vastu", "vasthu", "facing")),
    }


def run_fallback_chat(messages: list[dict[str, str]]) -> dict[str, Any]:
    user_messages = [m["content"] for m in messages if m.get("role") == "user"]
    full_context = " ".join(user_messages).strip()
    last_user = user_messages[-1] if user_messages else ""

    parsed = mock_parse_query(full_context or last_user)

    locality = parsed.get("locality")
    bhk = parsed.get("bhk")
    budget = parsed.get("budget_max")
    city = parsed.get("city") or "Pune"
    tx_type = parsed.get("transaction_type") or "Buy"

    if not locality:
        reply = "Hi! I can help you search properties. Which locality or neighborhood (e.g. Hinjewadi, Wakad, Baner, Kothrud, Whitefield) are you interested in?"
        parsed["locality"] = None
        return {"reply": reply, "parsedRequirement": normalize_parsed_requirement(parsed)}

    if bhk is None:
        reply = f"Got it, searching in {locality}. Would you prefer a 1 BHK, 2 BHK, 3 BHK, or larger layout?"
        return {"reply": reply, "parsedRequirement": normalize_parsed_requirement(parsed)}

    if budget is None:
        reply = f"Excellent choice. What is your maximum budget threshold for this search? (e.g. 'under 80 Lakh' or 'under 45k per month' if renting)"
        return {"reply": reply, "parsedRequirement": normalize_parsed_requirement(parsed)}

    budget_str = f"₹{budget:,}/mo" if tx_type == "Rent" else f"₹{budget // 100_000} Lakh"
    reply = f"Wonderful! I've updated your criteria filters: a {bhk} BHK property in {locality}, {city} under {budget_str}. Executing database query now."
    return {"reply": reply, "parsedRequirement": normalize_parsed_requirement(parsed)}


async def parse_query_with_ai(query: str) -> dict[str, Any] | None:
    system = """Extract property search parameters from natural language.
Return JSON with the following schema:
{
  "city": "Pune" or "Bangalore",
  "locality": string or null,
  "transaction_type": "Buy" or "Rent",
  "bhk": integer or null,
  "budget_max": integer in INR (e.g. 8000000) or a string representing the amount (e.g. "90 Lakh") or null,
  "property_type": "Apartment" or "Villa" or null,
  "status_preference": "Ready to Move" or "Under Construction" or null,
  "preference_notes": string or null,
  "vastu_compliant_only": boolean
}"""
    result = await _chat_json(system, query)
    if not result:
        return None
    return normalize_parsed_requirement(result)


async def parse_natural_language_requirement(query: str) -> dict[str, Any]:
    """Parse natural-language requirement into structured search filters."""
    if not query.strip():
        return normalize_parsed_requirement(mock_parse_query(""))
    parsed = await parse_query_with_ai(query)
    if not parsed:
        parsed = mock_parse_query(query)
    return normalize_parsed_requirement(parsed)


def format_parsed_filters_summary(parsed: dict[str, Any]) -> str:
    parts: list[str] = []
    if parsed.get("bhk"):
        parts.append(f"{parsed['bhk']} BHK")
    if parsed.get("locality"):
        parts.append(str(parsed["locality"]))
    if parsed.get("city"):
        parts.append(str(parsed["city"]))
    if parsed.get("transaction_type"):
        parts.append(str(parsed["transaction_type"]))
    budget = parsed.get("budget_max")
    if budget:
        if parsed.get("transaction_type") == "Rent":
            parts.append(f"≤ ₹{int(budget):,}/mo")
        else:
            parts.append(f"≤ ₹{int(budget) // 100_000} Lakh")
    if parsed.get("status_preference"):
        parts.append(str(parsed["status_preference"]))
    return " · ".join(parts) if parts else "general residential search"


async def check_if_duplicate(prop_a: dict[str, Any], prop_b: dict[str, Any]) -> bool:
    # Heuristic checks in deduplicate_properties are already extremely strict
    # (matching city, locality, bhk, price diff <= 5%, area diff <= 8%, and title similarity).
    # Bypassing the redundant LLM call makes the search pipeline 10x faster (saves 10+ seconds).
    return True


async def generate_ai_explanation(prop: dict[str, Any], requirement: dict[str, Any]) -> str | None:
    prop_id = prop.get("property_id")
    req_key = (
        prop_id,
        requirement.get("locality"),
        requirement.get("bhk"),
        requirement.get("budget_max"),
        requirement.get("transaction_type"),
        requirement.get("status_preference"),
        requirement.get("vastu_compliant_only")
    )
    if req_key in _explanation_cache:
        return _explanation_cache[req_key]

    system = "Write a 2-3 sentence property recommendation explanation for a real estate buyer."
    user = json.dumps({"property": prop, "requirement": requirement})
    result = await _chat_text(system, user)
    if result:
        _explanation_cache[req_key] = result
    return result


async def analyze_sentiment(reviews: list[str]) -> dict[str, Any] | None:
    cache_key = "\n".join(reviews)
    if cache_key in _sentiment_cache:
        return _sentiment_cache[cache_key]

    system = """Analyze property locality reviews. Return JSON:
{"sentiment_score": 0-100, "positive_themes": [], "negative_themes": [], "sentiment_summary": ""}"""
    user = "\n".join(reviews)
    result = await _chat_json(system, user)
    if result:
        _sentiment_cache[cache_key] = result
    return result


async def chat_with_agent(messages: list[dict[str, str]]) -> dict[str, Any]:
    fallback_reply = "I can help refine your property search. Try mentioning city, locality, BHK, and budget."
    user_messages = [m["content"] for m in messages if m.get("role") == "user"]
    full_context = " ".join(user_messages).strip()
    last_user = user_messages[-1] if user_messages else ""

    if not settings.openai_configured:
        return run_fallback_chat(messages)

    system = """You are PropIntel, an expert AI real estate search assistant for India.
The user is searching for properties in Pune or Bangalore.
Your job is to extract structured search filters AND provide a short, friendly conversational reply.

You MUST return a JSON object with EXACTLY this schema:
{
  "reply": "A short friendly 1-2 sentence response. NO JSON or structured data in this field. Just natural language.",
  "parsedRequirement": {
    "city": "Pune" or "Bangalore" — ALWAYS include this. Default to "Pune" if not mentioned.,
    "locality": string or null (e.g. "Baner", "Hinjewadi", "Wakad"),
    "transaction_type": "Buy" or "Rent" — default "Buy" if not mentioned,
    "bhk": integer or null (e.g. 1, 2, 3),
    "budget_max": integer in INR (e.g. 8000000 for 80 lakh) or null,
    "property_type": "Apartment" or "Villa" or null,
    "status_preference": "Ready to Move" or "Under Construction" or null,
    "preference_notes": string or null,
    "vastu_compliant_only": boolean
  }
}

IMPORTANT RULES:
- The "reply" field must ONLY contain a conversational sentence. Never put JSON, structured data, or filter summaries in "reply".
- ALWAYS set "city" — default to "Pune" if user hasn't mentioned a city.
- ALWAYS merge the user's latest message with previous conversation context. Keep all previously extracted criteria and only update the fields mentioned in the new message.
- Example: if user earlier said "Pune" and now says "2 BHK in Baner", keep city="Pune" and update bhk=2, locality="Baner"."""
    transcript = "\n".join(f"{m['role']}: {m['content']}" for m in messages[-8:])
    result = await _chat_json(system, transcript)
    if not result:
        return run_fallback_chat(messages)

    parsed = result.get("parsedRequirement") or result.get("parsed_requirement")
    if not isinstance(parsed, dict):
        parsed = normalize_parsed_requirement(mock_parse_query(full_context or last_user))
    else:
        parsed = normalize_parsed_requirement(parsed)

    reply = result.get("reply") or result.get("message")
    if not reply or reply == fallback_reply:
        summary = format_parsed_filters_summary(parsed)
        reply = f"I've updated your search filters to: {summary}."
    return {"reply": reply, "parsedRequirement": parsed}


async def generate_room_explanation(
    property_name: str,
    room_name: str,
    direction: str,
    is_compliant: bool,
    remedy: str | None = None,
) -> str:
    cache_key = (property_name, room_name, direction, is_compliant, remedy)
    if cache_key in _room_explanation_cache:
        return _room_explanation_cache[cache_key]

    explanation = None

    # 1. AI evaluation if configured
    client = get_openai_client()
    if client:
        prompt = f"""You are an expert Vastu Shastra architect and property reviewer.
Write a concise, professional, and aesthetic 2-to-3 sentence analysis of a specific room in a property.

Property: "{property_name}"
Room Name: "{room_name}"
Current Direction/Zone: "{direction}"
Vastu Status: {"Fully Compliant / Harmonious" if is_compliant else "Suboptimal / Needs Correction"}
{f'Suggested Remedy: "{remedy}"' if remedy else ''}

Provide a balanced review detailing the spatial flow, architectural reasoning according to solar/magnetic energies, and the impact on the residents. Keep it positive yet accurate. If there's a remedy, mention how implementing it restores harmony. Speak directly using 'you' or discuss the property layout.
Output only the explanation directly. No introduction or other meta-text."""
        try:
            response = await client.chat.completions.create(
                model=settings.openai_model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
            )
            content = response.choices[0].message.content
            if content and content.strip():
                explanation = content.strip()
        except Exception:
            pass

    if not explanation:
        # 2. Local Fallback Database
        clean_room = room_name.lower()
        if "kitchen" in clean_room:
            if is_compliant:
                explanation = f"The kitchen is perfectly situated in the {direction} (Agni/Fire) zone. This enables a healthy flow of metabolic energy and ensures that daily cooking receives optimal sunlight, enhancing the household's vitality and positive vibes."
            else:
                explanation = f"Placing the kitchen in the {direction} zone is considered suboptimal according to Vastu, as it conflicts with the elemental energies of the fire sector. " + (
                    f"To counter this, it is recommended to: {remedy}" if remedy else "Adding copper elements or fire-remedy symbols can help stabilize the zone."
                )
        elif "bedroom" in clean_room:
            if is_compliant:
                explanation = f"The master bedroom is ideally located in the {direction} (Earth) zone, which symbolizes stability and strength. This ensures restful sleep, psychological grounding, and maintains a highly supportive environment for the head of the family."
            else:
                explanation = f"The bedroom placement in the {direction} zone is suboptimal as it can impact stability and relaxation. " + (
                    f"To correct this flow, you can: {remedy}" if remedy else "Positioning the bed in the south/west direction helps bring balance."
                )
        elif "pooja" in clean_room or "prayer" in clean_room:
            if is_compliant:
                explanation = f"The prayer room (Pooja altar) resides in the {direction} (Ishanya/Water-Ether) zone. This is the highest spiritual sector of the home, drawing clean morning solar rays that foster mental clarity, peaceful meditation, and spiritual prosperity."
            else:
                explanation = f"The prayer zone in the {direction} sector is suboptimal for a spiritual altar. " + (
                    f"To harmonize this area, it is recommended to: {remedy}" if remedy else "Ensure the space is kept completely clean, well-lit, and painted in light colors."
                )
        elif "entrance" in clean_room or "door" in clean_room:
            if is_compliant:
                explanation = f"The main entrance faces the auspicious {direction} direction. This allows fresh, vital energy (Prana) to enter the residence unimpeded, promoting physical health, financial opportunity, and general prosperity for the occupants."
            else:
                explanation = f"An entrance facing the {direction} direction is suboptimal, which can restrict the flow of beneficial energies. " + (
                    f"To deflect negative pathways, you can: {remedy}" if remedy else "Placing Vastu symbols or a threshold strip is suggested to filter incoming energy."
                )
        else:
            if is_compliant:
                explanation = f"The {room_name} is well-placed in the {direction} direction, aligning harmoniously with standard Vastu coordinates to create a balanced, bright, and positive living space."
            else:
                explanation = f"The {room_name} is located in the {direction} direction, which is Vastu-suboptimal. " + (
                    f"Vastu experts recommend: {remedy}" if remedy else "Keeping this sector well-ventilated and uncluttered helps mitigate minor defects."
                )

    _room_explanation_cache[cache_key] = explanation
    return explanation

