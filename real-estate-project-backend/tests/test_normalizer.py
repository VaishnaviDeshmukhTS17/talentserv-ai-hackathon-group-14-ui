from __future__ import annotations

import pytest

from services.normalizer import (
    normalize_area,
    normalize_bhk,
    normalize_locality,
    normalize_parsed_requirement,
    normalize_price,
    process_property,
)


def test_normalize_price():
    assert normalize_price("Rs 80 L") == 8_000_000
    assert normalize_price("78 Lac") == 7_800_000
    assert normalize_price("1.15 Cr") == 11_500_000
    assert normalize_price("22,000 / month") == 22_000


def test_normalize_area():
    assert normalize_area("850 sq.ft.") == 850
    assert normalize_area("855 sqft") == 855


def test_normalize_bhk():
    assert normalize_bhk("2 BHK Flat") == 2
    assert normalize_bhk("3 BHK") == 3


def test_normalize_locality():
    assert normalize_locality("Hinjawadi") == "Hinjewadi"
    assert normalize_locality("whitefield") == "Whitefield"


def test_normalize_parsed_requirement_openai_shapes():
    result = normalize_parsed_requirement(
        {
            "city": "pune",
            "locality": "wakad",
            "transaction_type": "buy",
            "bhk": "3",
            "budget_max": "10000000",
            "status_preference": "available",
            "property_type": "residential",
        }
    )
    assert result["city"] == "Pune"
    assert result["locality"] == "Wakad"
    assert result["transaction_type"] == "Buy"
    assert result["bhk"] == 3
    assert result["budget_max"] == 10_000_000
    assert result["status_preference"] is None
    assert result["property_type"] == "Apartment"


def test_process_property_flags_incomplete():
    result = process_property(
        {
            "property_id": "T1",
            "title": "",
            "price": "Rs 80 L",
            "area_sqft": "850 sq.ft.",
            "bhk": "2 BHK",
            "locality": "Hinjewadi",
            "status": "Ready",
        }
    )
    assert result["is_incomplete"] is True
    assert result["price_per_sqft"] > 0
