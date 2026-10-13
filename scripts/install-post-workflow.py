#!/usr/bin/env python3
"""Install the project's Shluchim workflow as a user-level Codex skill."""

import argparse
from pathlib import Path
import shutil
import tempfile


def install(source: Path, skills_root: Path) -> Path:
    """Copy a complete skill; preserve any different existing version as a backup."""
    expected = {
        "SKILL.md",
        "agents/openai.yaml",
        "references/shluchim-post-workflow.md",
    }
    if not source.is_dir() or source.is_symlink():
        raise SystemExit(f"Missing skill source: {source}")
    files = {str(path.relative_to(source)) for path in source.rglob("*") if path.is_file()}
    if files != expected or any(path.is_symlink() for path in source.rglob("*")):
        raise SystemExit("The skill source is incomplete or contains unexpected files.")
    skills_root.mkdir(parents=True, exist_ok=True)
    destination = skills_root / "shluchim-post-workflow"
    if destination.is_symlink():
        raise SystemExit(f"The destination is a symbolic link; left untouched: {destination}")
    if destination.exists():
        if not destination.is_dir():
            raise SystemExit(f"The destination is not a directory: {destination}")
        existing = {str(path.relative_to(destination)) for path in destination.rglob("*") if path.is_file()}
        if existing == expected and not any(path.is_symlink() for path in destination.rglob("*")):
            if all((source / name).read_bytes() == (destination / name).read_bytes() for name in expected):
                print(f"Already installed: {destination}")
                return destination
    with tempfile.TemporaryDirectory(prefix=".shluchim-install-", dir=skills_root) as staging:
        prepared = Path(staging) / destination.name
        shutil.copytree(source, prepared)
        if destination.exists():
            backup_root = skills_root.parent / "skill-backups"
            backup_root.mkdir(parents=True, exist_ok=True)
            backup = Path(tempfile.mkdtemp(prefix="shluchim-post-workflow-", dir=backup_root)) / destination.name
            destination.rename(backup)
            print(f"Previous version preserved: {backup}")
        prepared.rename(destination)
    print(f"Installed: {destination}")
    return destination


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skills-root", type=Path, default=Path.home() / ".agents" / "skills")
    args = parser.parse_args()
    source = Path(__file__).resolve().parent.parent / ".agents" / "skills" / "shluchim-post-workflow"
    install(source, args.skills_root.expanduser().resolve())
    print("Use $shluchim-post-workflow for Shluchim posts in any project. Restart Codex if needed.")


if __name__ == "__main__":
    main()
