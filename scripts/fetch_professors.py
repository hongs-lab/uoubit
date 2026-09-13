"""울산대학교 교수 평점 데이터를 별별선생(starteacher.co.kr) 공개 API에서 수집한다.

- filter_id 617 = '교수' 사이트
- institute_id 552 = 울산대학교
- average_point 는 10000 스케일 정수 (73333 -> 7.3333 / 10)

사용:  python3 scripts/fetch_professors.py
출력:  data/professors.json
"""

from __future__ import annotations

import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/140.0 Safari/537.36"
)
SITE = "https://www.starteacher.co.kr"
API = "https://api.starteacher.co.kr/v1"

FILTER_ID = 617  # 교수
INSTITUTE_ID = 552  # 울산대학교
INSTITUTE_NAME = "울산대학교"
PAGE_LIMIT = 100
SLEEP = 0.35  # 서버 배려용 요청 간격

OUT = pathlib.Path(__file__).resolve().parent.parent / "data" / "professors.json"


def _get(url: str, headers: dict | None = None, retries: int = 3) -> str:
    req = urllib.request.Request(url, headers={"user-agent": UA, **(headers or {})})
    for attempt in range(retries):
        try:
            return urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
        except (urllib.error.URLError, TimeoutError) as exc:
            if attempt == retries - 1:
                raise
            print(f"  재시도 {attempt + 1}/{retries}: {exc}", file=sys.stderr)
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError("unreachable")


def guest_auth() -> dict:
    """SSR 페이지에 발급되어 있는 게스트 JWT / csrf 토큰을 꺼내 헤더로 만든다."""
    html = _get(f"{SITE}/professor/tutors")
    m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
    if not m:
        raise RuntimeError("__NEXT_DATA__ 를 찾지 못했습니다. 사이트 구조가 바뀐 것 같습니다.")
    jwt = json.loads(m.group(1))["props"]["initialState"]["auth"]["jwt"]
    return {
        "x-access-token": jwt["token"],
        "csrf-token": jwt["decodedToken"]["csrf"],
        "origin": SITE,
        "referer": f"{SITE}/professor/tutors",
    }


def fetch_page(headers: dict, page: int, limit: int = PAGE_LIMIT) -> dict:
    qs = urllib.parse.urlencode(
        {
            "institute_id": INSTITUTE_ID,
            "filter_id": FILTER_ID,
            "page": page,
            "limit": limit,
        }
    )
    return json.loads(_get(f"{API}/search/analysis/professor?{qs}", headers))


def normalize(raw: dict) -> dict | None:
    """API 응답 1건을 앱에서 쓰는 형태로 정리한다."""
    attr = raw.get("attribute") or {}
    point = attr.get("average_point") or 0
    subjects = raw.get("subject") or []
    dept = subjects[0]["name"] if subjects else "기타"

    institutes = raw.get("institute") or [
        ti.get("institute", {}) for ti in (raw.get("tutor_institute") or [])
    ]
    # 울산대학교 소속이 아닌 항목은 버린다 (겸임 등으로 섞여 들어오는 경우 방지)
    if institutes and not any(i.get("id") == INSTITUTE_ID for i in institutes):
        return None

    reviews = raw.get("total_review_count")
    if reviews is None:
        reviews = raw.get("tutor_review_count") or 0

    return {
        "id": raw["id"],
        "name": raw.get("name") or "이름없음",
        "department": dept,
        "university": INSTITUTE_NAME,
        "rating": round(point / 10000, 4),  # 0 ~ 10
        "reviewCount": reviews,
        "sex": attr.get("sex"),
        "sourceUrl": f"{SITE}/professor/tutors/{raw['id']}",
    }


def main() -> None:
    headers = guest_auth()

    first = fetch_page(headers, 1)
    total = first.get("total") or 0
    print(f"{INSTITUTE_NAME} 교수 총 {total}명")

    rows: list[dict] = []
    seen: set[int] = set()

    def absorb(payload: dict) -> None:
        for raw in payload.get("list") or []:
            if raw["id"] in seen:
                continue
            seen.add(raw["id"])
            item = normalize(raw)
            if item:
                rows.append(item)

    absorb(first)
    pages = -(-total // PAGE_LIMIT)
    for page in range(2, pages + 1):
        time.sleep(SLEEP)
        print(f"  page {page}/{pages} …")
        absorb(fetch_page(headers, page))

    rows.sort(key=lambda r: (-r["rating"], -r["reviewCount"], r["name"]))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "university": INSTITUTE_NAME,
                "instituteId": INSTITUTE_ID,
                "source": "starteacher.co.kr",
                "fetchedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                "total": len(rows),
                "professors": rows,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    rated = [r for r in rows if r["rating"] > 0]
    print(f"저장 완료: {OUT}  ({len(rows)}명 / 평점 보유 {len(rated)}명)")


if __name__ == "__main__":
    main()
