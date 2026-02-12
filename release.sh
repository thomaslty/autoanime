#!/usr/bin/env bash
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────
REGISTRY="ghcr.io"
IMAGE_NAME="thomaslty/autoanime"
IMAGE="${REGISTRY}/${IMAGE_NAME}"

# ── Helpers ──────────────────────────────────────────────────────
usage() {
  echo "Usage: $0 <version>"
  echo "  version  Semver tag prefixed with 'v' (e.g. v1.2.3)"
  echo ""
  echo "Prerequisites:"
  echo "  - docker CLI logged in to ghcr.io"
  echo "  - gh CLI authenticated (for creating releases)"
  exit 1
}

error() {
  echo "Error: $1" >&2
  exit 1
}

# ── Validate input ───────────────────────────────────────────────
[[ $# -lt 1 ]] && usage

VERSION="$1"

if [[ ! "${VERSION}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  error "Invalid version format '${VERSION}'. Expected vMAJOR.MINOR.PATCH (e.g. v1.2.3)"
fi

# ── Pre-flight checks ───────────────────────────────────────────
command -v docker >/dev/null 2>&1 || error "docker is not installed"
command -v gh >/dev/null 2>&1     || error "gh CLI is not installed"

if git rev-parse "${VERSION}" >/dev/null 2>&1; then
  error "Tag '${VERSION}' already exists locally. Delete it first or choose a new version."
fi

echo "==> Releasing ${IMAGE}:${VERSION}"
echo ""

# ── Step 1: Build Docker image ───────────────────────────────────
echo "==> Building Docker image..."
docker build -t "${IMAGE}:${VERSION}" -t "${IMAGE}:latest" .

# ── Step 2: Push to ghcr.io ─────────────────────────────────────
echo ""
echo "==> Pushing ${IMAGE}:${VERSION}..."
docker push "${IMAGE}:${VERSION}"

echo "==> Pushing ${IMAGE}:latest..."
docker push "${IMAGE}:latest"

# ── Step 3: Create git tag and push ──────────────────────────────
echo ""
echo "==> Creating git tag ${VERSION}..."
git tag -a "${VERSION}" -m "Release ${VERSION}"
git push origin "${VERSION}"

# ── Step 4: Create GitHub release ────────────────────────────────
echo ""
echo "==> Creating GitHub release..."
gh release create "${VERSION}" --generate-notes --title "${VERSION}"

echo ""
echo "==> Done! Release ${VERSION} published."
echo "    Image: ${IMAGE}:${VERSION}"
echo "    Release: https://github.com/${IMAGE_NAME}/releases/tag/${VERSION}"
