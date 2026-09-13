# DESIGN.md — 울산대 평점거래소

이 파일은 **oh-my-design.kr 의 `upbit` 레퍼런스**(Verified 32/32 claims, checked
2026-07-13)에서 가져온 값과, 이 프로젝트가 스스로 정한 값을 구분해 적어 둔
것이다. oh-my-design 이 배포하는 원본 DESIGN.md 를 그대로 옮긴 것이 아니라,
빌더 화면에서 확인한 검증 값 위에 프로젝트 문맥을 얹은 작업본이다.

레퍼런스 원본을 받고 검증하려면 프로젝트 루트에서 직접 실행하면 된다.

```bash
npx oh-my-design-cli@latest design-md validate DESIGN.md
```

---

## 1. Experience

### Product surface

공개 웹 한 페이지짜리 읽기 전용 시세 화면. 로그인·주문·자금 이동이 없고,
데스크톱 1440px 본판 + 오른쪽 레일, 1080px 아래에서 한 단으로 접힌다.

### Primary tasks

1. 울산대학교 교수 358명의 평점을 한 화면에서 훑고 정렬한다.
2. 학과(섹터)별로 좁혀 본다.
3. 한 교수를 열어 평점·리뷰 수·표본 신뢰도를 확인하고 원문 리뷰로 넘어간다.

### Visual theme

거래소 화면의 문법을 따른다 — 옅은 회색 판 위에 흰 패널, 1px 보더, 4px
라운드, 12px 본문. 여백이 아니라 밀도로 말한다.

처음에는 `toss` 레퍼런스로 잡았다가 갈아탔다. Toss 는 큰 글씨와 넉넉한 여백으로
금융을 편하게 보이게 하는 시스템이라 랜딩 페이지처럼 읽혔다. 이 화면이 해야 할
일은 숫자를 빽빽하게 늘어놓는 것이고, 그건 Upbit 쪽 문법이다. 결정적으로
Upbit 레퍼런스에는 상승/하락이 아예 토큰(`rise`/`fall`)으로 박혀 있다.

---

## 2. Color

레퍼런스 값 (`src/styles/theme.ts` 의 `reference` 블록).

| 토큰          | 값        | 쓰임                              |
| ------------- | --------- | --------------------------------- |
| `accent`      | `#0062df` | 액션, 선택 상태, 원문 링크 버튼   |
| `accentDeep`  | `#003597` | 진한 강조                         |
| `canvas`      | `#e9ecf1` | 페이지 바탕                       |
| `surface`     | `#ffffff` | 패널 면                           |
| `control`     | `#f4f5f7` | 표 헤더, 컨트롤 바탕              |
| `border`      | `#d6d8db` | 패널·컨트롤 테두리                |
| `ink`         | `#1a2434` | 제목, 현재가, 티커 띠 바탕        |
| `body`        | `#333333` | 본문                              |
| `muted`       | `#565d6a` | 라벨, 보합                        |
| `disabled`    | `#8e929b` | 축 라벨, 보조 정보                |
| `rise`        | `#dd3c44` | **상승 — 시세 문맥 전용**         |
| `fall`        | `#1375ec` | **하락 — 시세 문맥 전용**         |

레퍼런스가 `rise`/`fall` 을 "captured exchange-market context 밖으로 내보내지
말 것" 으로 못박아 뒀다. 그래서 이 두 색은 `Delta.css.ts` 와 차트에서만 쓰고,
에러·성공 같은 의미로 재사용하지 않는다.

### 프로젝트 확장 (`extension` 블록)

Upbit 캡처는 `interactionCount: 0` 이라 hover·focus 계열 증거가 통째로 없다.
레퍼런스는 "정적 마크업에서 상태를 지어내지 말 것" 이라고 하므로, 필요한
상태는 레퍼런스 값이 아니라 프로젝트 결정으로 따로 표시해 둔다.

| 토큰                | 값        | 왜 필요했나                       |
| ------------------- | --------- | --------------------------------- |
| `accentHover`       | `#0052bd` | 버튼 hover                        |
| `rowHover`          | `#f7f8fa` | 표 행 hover — control 보다 옅게   |
| `riseWeak`          | `#fdf3f4` | 체결 플래시 배경                  |
| `fallWeak`          | `#f0f5fd` | 체결 플래시 배경                  |
| `flat`              | `#565d6a` | 보합                              |
| `grid`              | `#eef0f3` | 차트 격자 — border 보다 연하게    |
| `onInk`             | `#ffffff` | ink 를 면으로 쓸 때의 글자색      |

---

## 3. Typography

레퍼런스 실측은 두 개뿐이다.

- 본문 `14px / 400 / 21px` — 공개 홈·목록 본문
- 라벨 `12px / 400` — 거래소 라벨과 quick-fill 컨트롤

여기에 표 헤더 11px(Upbit `th` 실측)을 더해 스케일을 만들었다.
`src/styles/font.ts` 참고.

서체는 브랜드 폰트를 흉내내지 않는다. 레퍼런스가 "Roboto 는 런타임이 해결한
시스템 폰트일 뿐 Upbit 브랜드 폰트가 아니다" 라고 명시했으므로, 한글이 제대로
나오는 Pretendard 스택만 쓴다.

숫자가 나오는 자리는 전부 `tabular-nums` 다. 거래소 화면에서 이건 취향이 아니라
요건이다 — 자릿수가 흔들리면 세로로 못 읽는다.

---

## 4. Spacing & Shape

레퍼런스가 증거로 가진 값은 셋이다.

- 간격: `control-inline` **8px**
- 라운드: Control **4px**, Square **0px**
- 컨트롤 높이: quick-fill **28px**

`src/styles/spacing.ts` 에서 8px 을 기준으로 2/4/8/12/16/24/32 스케일을 만들고,
라운드는 4px 과 0px 두 개만 유지한다. 카드마다 16px 라운드를 두르면 대시보드가
되지 거래소가 되지 않는다.

시세 행 높이는 38px 이다. Upbit 시세표 실측이 46px 인데 거기는 두 줄이고
여기는 한 줄이라 더 낮췄다.

---

## 5. Components

레퍼런스가 실측으로 남긴 컴포넌트는 **exchange quick-fill 배지** 하나다.

```
배경 #ffffff · 글자 #1a2434 · 1px solid #d6d8db · radius 4px
padding 0 8px 1px · 12px / 400 · height 28px
```

`src/components/common/Badge.css.ts` 가 이 도형을 그대로 쓴다. 나머지 면
(패널, 표, 차트)은 이 도형과 위의 색·간격 토큰으로 조립한 것이고, Upbit 이
문서화한 컴포넌트가 아니다.

### Do

- 상승/하락 색은 시세 문맥 안에서만 쓴다.
- 숫자는 전부 고정폭으로 돌린다.
- 표본이 부족한 종목은 숨기지 말고 표시한다 (`ConfidenceBadge`).

### Don't

- 레퍼런스에 없는 hover·focus·motion 을 레퍼런스 값인 척 적지 않는다.
- 4px 과 0px 을 평균 내 2px 같은 값을 만들지 않는다.
- 그림자로 면을 가르지 않는다. 이 시스템은 1px 보더로 가른다.

---

## 6. Governance

- 레퍼런스 값은 `src/styles/theme.ts` 의 `reference` 블록에만 둔다.
- 프로젝트가 정한 값은 `extension` 블록에 두고, 왜 필요했는지 주석을 남긴다.
- 새 색이 필요하면 컴포넌트 CSS 에 리터럴로 적지 말고 `extension` 에 추가한다.

---

## 7. Attribution

- 디자인 레퍼런스: [oh-my-design.kr](https://oh-my-design.kr) `upbit`
  (Verified 32/32, checked 2026-07-13) · MIT
- 로고와 상표는 각 회사 소유다. 이 프로젝트는 색·간격·타이포 값만 참조했고
  Upbit 의 브랜드 자산은 쓰지 않는다.
