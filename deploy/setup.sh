#!/usr/bin/env bash
set -euo pipefail

REPO="${1:?사용법: sudo ./setup.sh <git-저장소-URL> <도메인>}"
DOMAIN="${2:?사용법: sudo ./setup.sh <git-저장소-URL> <도메인>}"

curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt-get install -y nodejs git caddy
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack enable

# Oracle Ubuntu 이미지는 iptables 가 22 번 말고 전부 막아 둔다. VCN 보안 목록과 별개다.
for port in 80 443; do
  iptables -C INPUT -p tcp --dport "$port" -j ACCEPT 2>/dev/null ||
    iptables -I INPUT -p tcp --dport "$port" -j ACCEPT
done
command -v netfilter-persistent >/dev/null && netfilter-persistent save

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
systemctl enable uoubit
# 다시 돌리면 업데이트다. enable --now 는 이미 떠 있으면 새 코드를 안 읽는다.
systemctl restart uoubit

sed "s/uoubit.example.com/$DOMAIN/" deploy/Caddyfile >/etc/caddy/Caddyfile
systemctl reload caddy

echo
echo "완료. https://$DOMAIN"
echo "상태: systemctl status uoubit caddy"
echo "로그: journalctl -u uoubit -f"
