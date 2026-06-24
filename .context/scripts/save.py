#!/usr/bin/env python3
"""
auto-context: append seguro de eventos ao journal.jsonl

Uso:
    python3 save.py <project_dir> <type> <text> [--supersedes TS] [--session N]

type ∈ decision | error | milestone | pivot

Anexa UMA linha JSON ao .context/journal.jsonl sem reescrever o arquivo
(append-only, à prova de corrupção). Cria .context/ se não existir.
O state.md NÃO é tocado aqui — quem o escreve é a skill, com julgamento.
"""
import sys
import os
import json
import argparse
from datetime import datetime, timezone

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

VALID_TYPES = {"decision", "error", "milestone", "pivot"}


def next_session(journal_path: str) -> int:
    """Deduz o número da sessão a partir da última linha do journal."""
    if not os.path.exists(journal_path):
        return 1
    last = None
    with open(journal_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                last = line
    if not last:
        return 1
    try:
        return int(json.loads(last).get("session", 1))
    except (json.JSONDecodeError, ValueError):
        return 1


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("project_dir")
    p.add_argument("type")
    p.add_argument("text")
    p.add_argument("--supersedes", default=None)
    p.add_argument("--session", type=int, default=None)
    args = p.parse_args()

    if args.type not in VALID_TYPES:
        print(f"erro: type deve ser um de {sorted(VALID_TYPES)}", file=sys.stderr)
        return 2

    ctx_dir = os.path.join(args.project_dir, ".context")
    os.makedirs(ctx_dir, exist_ok=True)
    journal = os.path.join(ctx_dir, "journal.jsonl")

    session = args.session if args.session is not None else next_session(journal)

    entry = {
        "ts": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "session": session,
        "type": args.type,
        "text": args.text,
        "supersedes": args.supersedes,
    }

    # append atômico: abre em modo 'a', escreve uma linha, fecha.
    with open(journal, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"journal += [{args.type}] {args.text[:60]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
