#!/usr/bin/env bash
set -euo pipefail

# 构建后端发布包，不依赖 docker-compose。

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="${APP_NAME:-usport-api}"
VERSION="${VERSION:-dev}"
TARGET_OS="${TARGET_OS:-linux}"
TARGET_ARCH="${TARGET_ARCH:-amd64}"
OUTPUT_DIR="${OUTPUT_DIR:-$ROOT_DIR/bin}"
RELEASE_DIR="${RELEASE_DIR:-$ROOT_DIR/release}"
GIT_COMMIT="$(git -C "$ROOT_DIR" rev-parse --short HEAD 2>/dev/null || echo unknown)"
BUILD_TIME="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$OUTPUT_DIR" "$RELEASE_DIR"

pushd "$ROOT_DIR" >/dev/null
go mod tidy
go test ./...

ARTIFACT_NAME="${APP_NAME}-${VERSION}-${TARGET_OS}-${TARGET_ARCH}"
ARTIFACT_PATH="$OUTPUT_DIR/$ARTIFACT_NAME"

echo "Building $ARTIFACT_NAME ..."
CGO_ENABLED=0 GOOS="$TARGET_OS" GOARCH="$TARGET_ARCH" \
  go build \
  -trimpath \
  -ldflags "-s -w -X github.com/usport/usport-api/pkg/buildinfo.Version=$VERSION -X github.com/usport/usport-api/pkg/buildinfo.Commit=$GIT_COMMIT -X github.com/usport/usport-api/pkg/buildinfo.BuildTime=$BUILD_TIME" \
  -o "$ARTIFACT_PATH" \
  ./cmd/server

PACKAGE_DIR="$RELEASE_DIR/$ARTIFACT_NAME"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/scripts"

cp "$ARTIFACT_PATH" "$PACKAGE_DIR/$APP_NAME"
cp "$ROOT_DIR/config.example.yml" "$PACKAGE_DIR/config.yml"
cp "$ROOT_DIR/.env.example" "$PACKAGE_DIR/.env"
cp "$ROOT_DIR/scripts/init.sql" "$PACKAGE_DIR/scripts/init.sql"
cp "$ROOT_DIR/scripts/usport-api.service" "$PACKAGE_DIR/scripts/usport-api.service"

tar -C "$RELEASE_DIR" -czf "$RELEASE_DIR/$ARTIFACT_NAME.tar.gz" "$ARTIFACT_NAME"

echo "Build completed:"
echo "  Binary: $ARTIFACT_PATH"
echo "  Package: $RELEASE_DIR/$ARTIFACT_NAME.tar.gz"
popd >/dev/null
