#!/usr/bin/env python3
"""Install the Shluchim blog skill and its compatibility router for Codex."""

import argparse
from pathlib import Path
import shutil
import tempfile


def install(source: Path, skills_root: Path) -> Path:
    """Copy a complete skill; preserve any different existing version as a backup."""
    if source.name not in {"shluchim-blog-post", "shluchim-post-workflow"}:
        raise SystemExit(f"Unexpected skill name: {source.name}")
    if not source.is_dir() or source.is_symlink():
        raise SystemExit(f"Missing skill source: {source}")
    files = {str(path.relative_to(source)) for path in source.rglob("*") if path.is_file()}
    expected = files
    if not {"SKILL.md", "agents/openai.yaml"}.issubset(files) or any(path.is_symlink() for path in source.rglob("*")):
        raise SystemExit("The skill source is incomplete or contains unexpected files.")
    skills_root.mkdir(parents=True, exist_ok=True)
    destination = skills_root / source.name
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
            backup = Path(tempfile.mkdtemp(prefix=source.name + "-", dir=backup_root)) / destination.name
            destination.rename(backup)
            print(f"Previous version preserved: {backup}")
        prepared.rename(destination)
    print(f"Installed: {destination}")
    return destination


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skills-root", type=Path, default=Path.home() / ".agents" / "skills")
    args = parser.parse_args()
    sources = Path(__file__).resolve().parent.parent / ".agents" / "skills"
    for name in ["shluchim-blog-post", "shluchim-post-workflow"]:
        install(sources / name, args.skills_root.expanduser().resolve())
    print("Use $shluchim-blog-post for Shluchim posts in any project. Restart Codex if needed.")


if __name__ == "__main__":
    main()
