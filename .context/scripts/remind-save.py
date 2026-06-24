#!/usr/bin/env python3
"""
auto-context: hook SessionEnd (Claude Code).

Não tenta destilar contexto sozinho — isso exige julgamento e é trabalho da
skill. Este script apenas sinaliza que a sessão terminou sem um save recente,
imprimindo um lembrete que aparece no fim da sessão.

Saída vazia (exit 0) se o state.md foi atualizado há menos de THRESHOLD_MIN.
"""
import os
import sys
import re
from datetime import datetime, timezone

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

THRESHOLD_MIN = 20  # se salvou nos últimos 20 min, não incomoda


def minutes_since_save(state_path: str):
    if not os.path.exists(state_path):
        return None
    with open(state_path, "r", encoding="utf-8") as f:
        head = f.read(400)
    m = re.search(r"atualizado:\s*([0-9T:\-]+Z)", head)
    if not m:
        return None
    try:
        ts = datetime.fromisoformat(m.group(1).replace("Z", "+00:00"))
    except ValueError:
        return None
    delta = datetime.now(timezone.utc) - ts
    return delta.total_seconds() / 60


def main() -> int:
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    state_path = os.path.join(project_dir, ".context", "state.md")

    mins = minutes_since_save(state_path)
    if mins is not None and mins < THRESHOLD_MIN:
        return 0  # save recente, silêncio

    print("─" * 50)
    print("auto-context: sessão encerrando sem save recente.")
    print("Rode  /resume save  para gravar o estado antes de fechar.")
    print("─" * 50)
    return 0


if __name__ == "__main__":
    sys.exit(main())
