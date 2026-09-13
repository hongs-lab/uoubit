#!/usr/bin/env bash
set -euo pipefail

REPO="${1:?사용법: sudo ./setup.sh <git-저장소-URL>}"

curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs git caddy || { apt-get install -y nodejs git; echo "caddy 는 따로 설치하세요"; }
corepack enable

id -u uoubit &>/dev/null || useradd --system --home /opt/uoubit --shell /usr/sbin/nologin uoubit

rm -rf /opt/uoubit
git clone --depth 1 "$REPO" /opt/uoubit
cd /opt/uoubit
pnpm install --frozen-lockfile
pnpm seed
pnpm build
chown -R uoubit:uoubit /opt/uoubit

cp deploy/uoubit.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now uoubit

echo
echo "완료. 상태 확인:  systemctl status uoubit"
echo "로그:            journalctl -u uoubit -f"
