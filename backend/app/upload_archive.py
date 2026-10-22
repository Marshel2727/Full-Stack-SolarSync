"""Maintenance-only upload archive; no HTTP endpoints or credentials in archives."""
import argparse
from pathlib import Path, PurePosixPath
import tarfile

from app.utils.config import get_settings


def create_archive(archive: Path, root: Path):
    root = root.resolve()
    if not root.is_dir():
        raise ValueError("Uploads directory does not exist")
    if root in archive.resolve().parents:
        raise ValueError("Archive must be outside the uploads directory")
    with tarfile.open(archive, "w:gz") as output:
        for path in sorted(root.rglob("*")):
            if path.is_symlink():
                raise ValueError("Symlinks are not allowed in uploads")
            if path.is_file():
                output.add(path, arcname=path.relative_to(root).as_posix(), recursive=False)


def restore_archive(archive: Path, root: Path):
    root.mkdir(parents=True, exist_ok=True)
    if any(root.iterdir()):
        raise ValueError("Restore requires an empty uploads directory")
    with tarfile.open(archive, "r:gz") as source:
        members = source.getmembers()
        for member in members:
            name = PurePosixPath(member.name)
            if (name.is_absolute() or ".." in name.parts or "\\" in member.name
                    or not member.isfile() or not name.parts or ":" in member.name):
                raise ValueError("Unsafe archive member")
        source.extractall(root, members=members, filter="data")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("create", "restore"))
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    root = get_settings().upload_dir
    if args.action == "create":
        create_archive(args.archive, root)
    else:
        restore_archive(args.archive, root)
    print("Upload archive completed.")


if __name__ == "__main__":
    main()
