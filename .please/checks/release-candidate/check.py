"""Build the release candidate image for linux/amd64 and verify that it serves the application."""

import os
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.request import urlopen

TAG = "hiitbuddy:candidate"
PORT = "18080"


def build(version, source):
    subprocess.run(
        [
            "docker", "build", "--platform", "linux/amd64", "--tag", TAG,
            "--label", f"org.opencontainers.image.version=v{version}",
            "--label", f"org.opencontainers.image.revision={source}",
            ".",
        ],
        check=True,
    )  # fmt: skip


def serves(url, attempts=30, pause=1.0):
    for _ in range(attempts):
        try:
            with urlopen(url, timeout=5) as response:  # noqa: S310 - fixed local URL
                if response.status == 200 and b"<html" in response.read().lower():
                    return True
        except (URLError, OSError):
            pass
        time.sleep(pause)
    return False


def smoke():
    container = subprocess.check_output(
        ["docker", "run", "--detach", "--rm", "--platform", "linux/amd64", "--publish", f"127.0.0.1:{PORT}:8080", TAG], text=True
    ).strip()
    try:
        if not serves(f"http://127.0.0.1:{PORT}/"):
            raise ValueError("The candidate image does not serve the application")
    finally:
        subprocess.run(["docker", "stop", container], check=False)


def main():
    build(os.environ["EXPECTED_RELEASE_VERSION"], os.environ["GITHUB_SHA"])
    smoke()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as error:  # A crash is a technical failure, never a FAIL verdict.
        print(f"ERROR: {type(error).__name__}: {error}", file=sys.stderr)
        sys.exit(2)
