#!/usr/bin/env python3
"""
compact-pro: hook PreCompact (Claude Code).

Dispara no instante anterior a um compact (manual ou auto-compact perto do
limite de contexto). É o momento em que o histórico ia ser descartado — a
melhor hora para gravar o estado, com a conversa ainda inteira.

Este script NÃO destila o contexto sozinho (isso exige julgamento e é trabalho
da skill). Ele deixa um marcador 'PENDING_SAVE' em .context/ e imprime uma
instrução clara para a skill: salvar o state.md AGORA, antes do compact seguir.

Recebe o input do hook por stdin (JSON do Claude Code). Lê o campo 'trigger'
('manual' ou 'auto') só para registrar no marcador.
"""
import os
import sys
import json
from datetime import datetime, timezone

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def main() -> int:
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    ctx_dir = os.path.join(project_dir, ".context")
    os.makedirs(ctx_dir, exist_ok=True)

    trigger = "unknown"
    try:
        raw = sys.stdin.read()
        if raw.strip():
            trigger = json.loads(raw).get("trigger", "unknown")
    except (json.JSONDecodeError, ValueError):
        pass

    marker = os.path.join(ctx_dir, "PENDING_SAVE")
    with open(marker, "w", encoding="utf-8") as f:
        f.write(json.dumps({
            "ts": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
            "trigger": trigger,
        }) + "\n")

    print("─" * 56)
    print("compact-pro · PreCompact")
    print(f"Um compact ({trigger}) vai rodar. Antes de descartar o histórico,")
    print("a skill compact-pro deve atualizar .context/state.md AGORA")
    print("(fluxo SALVAR) e anexar eventos novos ao journal.jsonl.")
    print("─" * 56)
    return 0


if __name__ == "__main__":
    sys.exit(main())
