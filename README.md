## 구조

```
client/   Vite + React + vanilla-extract  (5183)
server/   Node 표준 모듈만 — http · sqlite · crypto  (5184)
scripts/  별별선생 수집 → 상장 종목 생성
data/     수집 원본 + 거래 DB
```

시세는 서버 한 곳에서만 굴린다. 사용자가 사고팔기 시작하면 브라우저마다 가격이
다를 수 없기 때문이다. 클라이언트는 SSE 로 받아 보기만 한다.

## 실행

```bash
pnpm install
pnpm seed          # data/professors.json → client/src/data/listings.json
pnpm dev           # API(5184) + 클라이언트(5183) 동시 실행
pnpm check         # 체결 산술 · 호가 · 서버 왕복 셀프체크
```

평점 데이터를 새로 긁으려면 `python3 scripts/fetch_professors.py`.

## 배포

서버가 `client/dist` 를 직접 서빙하므로 **서비스 하나**로 끝난다. 같은 출처라
CORS 설정도, 세션 쿠키 도메인 문제도 없다.

```bash
pnpm build && pnpm start   # 한 포트에서 화면 + API
```

서버리스(Vercel·Netlify·Workers)는 맞지 않는다. 시세 엔진이 1초마다 도는
상주 프로세스이고, SSE 가 장기 연결이며, SQLite 가 파일이기 때문이다.
프런트만 따로 올리면 세션 쿠키가 `SameSite=Lax` 라 교차 사이트에서 전달되지
않아 로그인이 깨진다.

### Render (무료 · 데이터 안 남음)

[render.yaml](render.yaml) 이 있어서 저장소만 연결하면 된다. 15분 무요청이면
잠들고, 깨어날 때 계정·보유·체결이 전부 사라진다. 시세는 켜질 때 120틱을 미리
굴려서 바로 정상으로 보이므로 화면 자체는 멀쩡하다.

### Oracle Cloud / GCP Always Free VM (데이터 남음)

`deploy/` 에 systemd 유닛과 Caddy 설정이 있다.

```bash
sudo ./deploy/setup.sh https://github.com/<user>/<repo>.git
```

DB 는 `/var/lib/uoubit/exchange.db` 에 둔다. systemd 의 `StateDirectory` 가
만들고 권한까지 맞추므로, 코드를 갈아엎어도 계정과 체결 기록은 남는다.

HTTPS 는 Caddy 가 Let's Encrypt 에서 자동으로 받아 갱신한다. `deploy/Caddyfile`
의 도메인만 바꾸면 된다. 도메인이 없으면 DuckDNS 같은 무료 서브도메인이면
충분하다.

**`flush_interval -1` 을 지우지 말 것.** 리버스 프록시가 응답을 버퍼링하면
SSE 가 흐르지 않아 시세가 멈춘 것처럼 보인다.

**Oracle 은 방화벽이 두 겹이다.** 콘솔의 VCN 보안 목록만 열고 끝내면 접속이
안 된다. 인스턴스 안의 iptables 도 같이 열어야 한다.

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo netfilter-persistent save
```

배포 후 갱신:

```bash
cd /opt/uoubit && sudo -u uoubit git pull && sudo -u uoubit pnpm install --frozen-lockfile \
  && sudo -u uoubit pnpm seed && sudo -u uoubit pnpm build && sudo systemctl restart uoubit
```

## 거래 규칙

포지션은 **부호 있는 수량 하나**다. `qty > 0` 이 롱, `qty < 0` 이 숏.
매수가 올리고 매도가 내린다 — 0 아래로 내려간 매도가 곧 공매도다.
덕분에 매수·매도·롱·숏이 전부 같은 코드 경로를 탄다.

- 시드머니 1,000,000원 (가입 시 1회)
- 평가금액 = 현금 + Σ(qty × 현재가). 숏은 qty 가 음수라 저절로 깎인다
- 시장가만 지원. 호가를 위에서부터 걷어내며 평균 체결가를 낸다
- 공매도는 평가액의 1.5배를 현금으로 잡아 둬야 한다 (자기 돈 50% 증거금)

## API

| | |
|---|---|
| `POST /api/auth/signup` · `login` · `logout` | 쿠키 세션 |
| `GET /api/me` | 잔고 · 보유 · 평가손익 |
| `GET /api/quotes` | 전체 시세 + 이력 (접속 시 1회) |
| `GET /api/stream` | SSE 틱 |
| `GET /api/orderbook/:code` | 10단계 호가 + 거래량 · 거래대금 |
| `POST /api/orders` | `{code, side: buy\|sell, qty}` |
| `GET /api/trades` · `/api/ranking` | 체결 내역 · 수익률 랭킹 |

## 한계

- **실제 매칭 엔진이 아니다.** 호가는 종목·틱으로 결정되는 해시라 지정가 주문이
  쌓이지 않는다. 지정가·미체결이 필요하면 orders 테이블 + 가격-시간 우선 매칭으로
  갈아타야 한다.
- **강제청산이 없다.** 증거금률을 낮추려면 마진콜부터 만들어야 한다.
- **표본이 얇다.** 상장 358종목의 리뷰를 다 합쳐도 1,031건이다. 순위를 진지하게
  받아들일 데이터가 아니다.

## 디자인

[oh-my-design.kr](https://oh-my-design.kr) 의 Upbit 레퍼런스(Verified 32/32).
옅은 회색 판 위 흰 패널, 4px 라운드, 12px 본문, 상승 `#dd3c44` / 하락 `#1375ec`.
레퍼런스에 없는 값(hover 계열 등)은 `client/src/styles/theme.ts` 의 `extension`
블록에 따로 묶어 뒀다 — 지어낸 값은 지어냈다고 표시된 자리에 있어야 한다.
