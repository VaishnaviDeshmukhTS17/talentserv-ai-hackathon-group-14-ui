from __future__ import annotations

import math
from typing import Any


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)


def score_decay(distance_km: float) -> int:
    if distance_km <= 0.8:
        return round(95 + (1 - distance_km / 0.8) * 5)
    if distance_km <= 2.0:
        return round(85 + (1 - (distance_km - 0.8) / 1.2) * 10)
    if distance_km <= 4.0:
        return round(70 + (1 - (distance_km - 2.0) / 2.0) * 15)
    if distance_km <= 6.0:
        return round(50 + (1 - (distance_km - 4.0) / 2.0) * 20)
    return max(40, round(50 - (distance_km - 6.0) * 5))


LOCALITY_FALLBACKS: dict[str, dict[str, int]] = {
    "Hinjewadi": {"connectivity": 90, "schools": 75, "lifestyle": 70, "infrastructure": 55},
    "Wakad": {"connectivity": 85, "schools": 88, "lifestyle": 80, "infrastructure": 75},
    "Baner": {"connectivity": 92, "schools": 85, "lifestyle": 95, "infrastructure": 85},
    "Hadapsar": {"connectivity": 88, "schools": 80, "lifestyle": 88, "infrastructure": 70},
    "Kharadi": {"connectivity": 88, "schools": 80, "lifestyle": 85, "infrastructure": 75},
    "Viman Nagar": {"connectivity": 94, "schools": 85, "lifestyle": 92, "infrastructure": 85},
    "Kothrud": {"connectivity": 85, "schools": 92, "lifestyle": 88, "infrastructure": 90},
    "Kalyani Nagar": {"connectivity": 92, "schools": 88, "lifestyle": 95, "infrastructure": 90},
    "Whitefield": {"connectivity": 88, "schools": 85, "lifestyle": 85, "infrastructure": 60},
    "Indiranagar": {"connectivity": 95, "schools": 85, "lifestyle": 98, "infrastructure": 80},
    "Koramangala": {"connectivity": 92, "schools": 88, "lifestyle": 96, "infrastructure": 75},
}


def find_nearest_poi(
    lat: float,
    lon: float,
    category: str,
    pois: list[dict[str, Any]],
    locality: str | None = None,
) -> dict[str, Any] | None:
    candidates = [p for p in pois if p.get("type") == category]
    if locality:
        local = [p for p in candidates if p.get("locality", "").lower() == locality.lower()]
        if local:
            candidates = local
    if not candidates:
        return None

    nearest = min(
        candidates,
        key=lambda p: haversine_distance(lat, lon, p["latitude"], p["longitude"]),
    )
    dist = haversine_distance(lat, lon, nearest["latitude"], nearest["longitude"])
    return {"poi": nearest, "distance_km": dist}


def calculate_location_scores(
    lat: float | None,
    lon: float | None,
    locality: str,
    pois: list[dict[str, Any]],
) -> dict[str, int]:
    if lat is None or lon is None:
        return LOCALITY_FALLBACKS.get(
            locality,
            {"connectivity": 80, "schools": 80, "lifestyle": 80, "infrastructure": 70},
        )

    scores: dict[str, int] = {}
    for category in ("commute", "school", "lifestyle", "infrastructure"):
        key = "connectivity" if category == "commute" else (
            "schools" if category == "school" else category
        )
        nearest = find_nearest_poi(lat, lon, category, pois, locality)
        if nearest:
            scores[key] = score_decay(nearest["distance_km"])
        else:
            scores[key] = 80 if category != "infrastructure" else 70
    return scores
