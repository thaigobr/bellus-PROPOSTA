#!/usr/bin/env python3
"""
compact-pro: hook SessionStart (Claude Code).

Roda ao abrir/retomar a sessão. Se há um state.md, lembra de restaurar.
Se há um marcador PENDING_SAVE deixado por um PreCompact anterior, avisa que
o estado pode não ter sido finalizado e deve ser conferido.

Mantém-se rápido (SessionStart roda toda vez).
"""
import os
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def main() -> int:
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    ctx_dir = os.path.join(project_dir, ".context")
    state = os.path.join(ctx_dir, "state.md")
    pending = os.path.join(ctx_dir, "PENDING_SAVE")

    if not os.path.exists(state):
        return 0  # projeto sem contexto salvo ainda; silêncio

    print("─" * 56)
    print("compact-pro: contexto salvo encontrado.")
    print("Rode  /resume  para restaurar (lê só o state.md, não a conversa).")
    if os.path.exists(pending):
        print("⚠ Havia um save pendente de um compact anterior — confira o")
        print("  state.md ao restaurar e remova .context/PENDING_SAVE.")
    print("─" * 56)
    return 0


if __name__ == "__main__":
    sys.exit(main())
