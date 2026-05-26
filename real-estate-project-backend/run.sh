#!/usr/bin/env bash
# Run PropIntel backend with Python 3.12 (OpenSSL) via uv — required for MongoDB Atlas TLS.
set -euo pipefail
cd "$(dirname "$0")"

if [[ -f "$HOME/.local/bin/env" ]]; then
  # shellcheck disable=SC1091
  source "$HOME/.local/bin/env"
fi

if [[ ! -d .venv ]]; then
  uv venv .venv --python 3.12
  uv pip install -r requirements.txt
fi

source .venv/bin/activate
exec uvicorn main:app --reload --port 8000
