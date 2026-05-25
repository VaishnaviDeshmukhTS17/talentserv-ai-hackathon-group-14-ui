from __future__ import annotations

import re
from typing import Any


def normalize_price(price: str | int | float) -> int:
    if isinstance(price, (int, float)):
        return int(round(price))
    if not price:
        return 0

    clean_str = str(price).lower().strip()
    clean_num_str = re.sub(r"[₹$,\s]", "", clean_str)
    clean_num_str = re.sub(r"(?i)rs|/month|/mo", "", clean_num_str)

    num_match = re.search(r"(\d+(?:\.\d+)?)", clean_num_str)
    val = float(num_match.group(1)) if num_match else 0.0

    if "cr" in clean_str or "crore" in clean_str:
        return int(round(val * 10_000_000))

    if any(x in clean_str for x in ("lakh", "lac", " l", "l ")) or re.search(r"\d+\s*l\b", clean_str):
        return int(round(val * 100_000))

    if "k" in clean_str:
        return int(round(val * 1000))

    if num_match:
        return int(round(val))
    return 0


def normalize_area(area: str | int | float) -> int:
    if isinstance(area, (int, float)):
        return int(round(area))
    if not area:
        return 0
    match = re.search(r"\d+(?:\.\d+)?", str(area))
    if not match:
        return 0
    try:
        return int(round(float(match.group(0))))
    except ValueError:
        return 0


def normalize_bhk(bhk: str | int | float) -> int:
    if isinstance(bhk, (int, float)):
        return int(bhk)
    if not bhk:
        return 0
    match = re.search(r"\d+", str(bhk))
    return int(match.group(0)) if match else 0


def normalize_locality(locality: str) -> str:
    if not locality:
        return ""
    clean = locality.strip().lower()

    mappings = [
        (("hinja", "hinje"), "Hinjewadi"),
        (("wakad",), "Wakad"),
        (("baner",), "Baner"),
        (("hadapsar", "hadaps"), "Hadapsar"),
        (("kharadi", "khara", "kharra"), "Kharadi"),
        (("viman",), "Viman Nagar"),
        (("kothrud", "koth"), "Kothrud"),
        (("kalyani",), "Kalyani Nagar"),
        (("whitefield",), "Whitefield"),
        (("indiranagar", "indira"), "Indiranagar"),
        (("koramangala", "kora"), "Koramangala"),
    ]
    for keys, value in mappings:
        if any(k in clean for k in keys):
            return value

    return " ".join(w.capitalize() for w in locality.split())


def normalize_status(status: str) -> str:
    t = status.lower()
    if "ready" in t:
        return "Ready to Move"
    if "construction" in t or "launch" in t:
        return "Under Construction"
    if "resale" in t:
        return "Resale"
    return status.strip() or "Unknown"


def calculate_vastu_compliance(prop: dict[str, Any]) -> dict[str, Any]:
    vastu_details = prop.get("vastu_details") or {}
    facing = vastu_details.get("facing_direction") or prop.get("vastu_facing")
    kitchen = vastu_details.get("kitchen_direction")
    bedroom = vastu_details.get("bedroom_direction")
    pooja = vastu_details.get("pooja_direction")
    shape = vastu_details.get("layout_shape")

    id_match = re.search(r"\d+", prop.get("property_id", "1"))
    id_num = int(id_match.group(0)) if id_match else 1

    if not facing or not kitchen or not bedroom or not shape:
        if id_num % 2 != 0:
            facing = facing or "East"
            kitchen = kitchen or "South-East"
            bedroom = bedroom or "South-West"
            pooja = pooja or "North-East"
            shape = shape or "Rectangular"
        else:
            remainder = id_num % 10
            if remainder in (2, 6):
                facing, kitchen, bedroom, pooja, shape = (
                    facing or "North",
                    kitchen or "North-West",
                    bedroom or "South-West",
                    pooja or "North-East",
                    shape or "Square",
                )
            elif remainder in (4, 8):
                facing, kitchen, bedroom, pooja, shape = (
                    facing or "West",
                    kitchen or "South-East",
                    bedroom or "North-East",
                    pooja or "West",
                    shape or "Square",
                )
            else:
                facing, kitchen, bedroom, pooja, shape = (
                    facing or "South",
                    kitchen or "North-East",
                    bedroom or "North-West",
                    pooja or "South-West",
                    shape or "Irregular",
                )

    score = 0
    if facing in ("East", "North", "North-East"):
        score += 40
    elif facing in ("North-West", "South-East"):
        score += 25
    elif facing == "West":
        score += 20
    else:
        score += 10

    if kitchen in ("South-East", "North-West"):
        score += 20
    elif kitchen in ("East", "West"):
        score += 12
    else:
        score += 5

    if bedroom in ("South-West", "South"):
        score += 20
    elif bedroom in ("West", "North-West"):
        score += 12
    else:
        score += 5

    if shape in ("Square", "Rectangular"):
        score += 20
    else:
        score += 10

    if score >= 80:
        level = "High"
    elif score < 50:
        level = "Remedy Recommended"
    else:
        level = "Moderate"

    return {
        "vastu_score": score,
        "vastu_compliant_level": level,
        "vastu_details": {
            "facing_direction": facing,
            "kitchen_direction": kitchen,
            "bedroom_direction": bedroom,
            "pooja_direction": pooja,
            "layout_shape": shape,
        },
    }


def process_property(prop: dict[str, Any]) -> dict[str, Any]:
    price = normalize_price(prop.get("price", 0))
    area_sqft = normalize_area(prop.get("area_sqft", 0))
    bhk = normalize_bhk(prop.get("bhk", 0))
    locality = normalize_locality(prop.get("locality", ""))
    status = normalize_status(prop.get("status", ""))
    price_per_sqft = round(price / area_sqft) if area_sqft > 0 else 0
    is_incomplete = not prop.get("title") or price == 0 or area_sqft == 0 or bhk == 0 or not prop.get("locality")

    cleaned = {
        **prop,
        "locality": locality,
        "status": status,
        "price": price,
        "area_sqft": area_sqft,
        "bhk": bhk,
        "price_per_sqft": price_per_sqft,
        "is_incomplete": is_incomplete,
    }
    cleaned.update(calculate_vastu_compliance(prop))
    return cleaned


def clean_properties_list(props: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [process_property(p) for p in props]


def normalize_parsed_requirement(req: dict[str, Any]) -> dict[str, Any]:
    """Normalize AI/chat parsed fields to match MongoDB listing values."""
    out = dict(req)

    tx = str(out.get("transaction_type", "Buy")).strip().lower()
    out["transaction_type"] = "Rent" if tx in ("rent", "rental", "lease", "pg") else "Buy"

    city = str(out.get("city", "Pune")).strip()
    if city.lower() in ("bangalore", "bengaluru"):
        out["city"] = "Bangalore"
    elif city:
        out["city"] = city.title()

    if out.get("locality"):
        out["locality"] = normalize_locality(str(out["locality"]))

    status = out.get("status_preference")
    if status:
        status_lower = str(status).lower()
        if "ready" in status_lower or "move" in status_lower:
            out["status_preference"] = "Ready to Move"
        elif "construction" in status_lower or "under" in status_lower:
            out["status_preference"] = "Under Construction"
        elif status_lower in ("ready to move", "under construction"):
            out["status_preference"] = status if status in ("Ready to Move", "Under Construction") else None
        else:
            out["status_preference"] = None

    bhk = out.get("bhk")
    if bhk is not None:
        try:
            out["bhk"] = int(bhk)
        except (TypeError, ValueError):
            out["bhk"] = None

    budget = out.get("budget_max")
    if budget is not None:
        try:
            out["budget_max"] = int(budget)
        except (TypeError, ValueError):
            out["budget_max"] = None

    prop_type = out.get("property_type")
    if prop_type and str(prop_type).lower() in ("residential", "flat", "apartment", "home"):
        out["property_type"] = "Apartment"
    elif prop_type and str(prop_type).lower() in ("villa", "house", "bungalow"):
        out["property_type"] = "Villa"

    if "vastu_compliant_only" in out:
        out["vastu_compliant_only"] = bool(out["vastu_compliant_only"])

    return out
