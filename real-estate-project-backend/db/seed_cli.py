from __future__ import annotations

"""CLI: python -m db.seed_cli [--force]"""
import asyncio
import sys

from db.seed import seed_database, get_seed_status


async def main() -> None:
    force = "--force" in sys.argv
    print("Seeding MongoDB from seed/*.json ...")
    counts = await seed_database(force=force)
    print("Seed complete:", counts)
    status = await get_seed_status()
    print("Current counts:", status)


if __name__ == "__main__":
    asyncio.run(main())
