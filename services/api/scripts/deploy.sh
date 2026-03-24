#!/usr/bin/env bash
set -euo pipefail

# 通过 scp/ssh 发布后端二进制，不依赖 docker-compose。
# 使用前需先设置：
#   DEPLOY_HOST=your-server
# 可选：
#   DEPLOY_USER=root
#   DEPLOY_DIR=/opt/usport-api
#   SERVICE_NAME=usport-api
#   VERSION=v0.1.0

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_HOST="${DEPLOY_HOST:?DEPLOY_HOST is required}"
DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/usport-api}"
SERVICE_NAME="${SERVICE_NAME:-usport-api}"
VERSION="${VERSION:-dev}"
TARGET_OS="${TARGET_OS:-linux}"
TARGET_ARCH="${TARGET_ARCH:-amd64}"

APP_NAME="$SERVICE_NAME" VERSION="$VERSION" TARGET_OS="$TARGET_OS" TARGET_ARCH="$TARGET_ARCH" "$ROOT_DIR/scripts/build.sh"

ARTIFACT_NAME="${SERVICE_NAME}-${VERSION}-${TARGET_OS}-${TARGET_ARCH}.tar.gz"
PACKAGE_PATH="$ROOT_DIR/release/$ARTIFACT_NAME"

if [[ ! -f "$PACKAGE_PATH" ]]; then
  echo "Package not found: $PACKAGE_PATH"
  exit 1
fi

REMOTE="$DEPLOY_USER@$DEPLOY_HOST"
echo "Uploading package to $REMOTE ..."
scp "$PACKAGE_PATH" "$REMOTE:/tmp/$ARTIFACT_NAME"

echo "Deploying to $DEPLOY_DIR ..."
ssh "$REMOTE" bash <<EOF
set -euo pipefail
mkdir -p "$DEPLOY_DIR"
rm -rf "$DEPLOY_DIR/current"
mkdir -p "$DEPLOY_DIR/current"
tar -xzf "/tmp/$ARTIFACT_NAME" -C "$DEPLOY_DIR/current"
cp -R "$DEPLOY_DIR/current/$SERVICE_NAME-$VERSION-$TARGET_OS-$TARGET_ARCH"/. "$DEPLOY_DIR/"
rm -rf "$DEPLOY_DIR/current"
install -m 644 "$DEPLOY_DIR/scripts/usport-api.service" "/etc/systemd/system/$SERVICE_NAME.service"
systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME"
systemctl status "$SERVICE_NAME" --no-pager
rm -f "/tmp/$ARTIFACT_NAME"
EOF

echo "Deploy completed."
