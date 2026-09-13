import * as s from './Disclaimer.css';
import Panel from './Panel';
import { useMarketStore } from '@/hooks/useMarket';

export default function Disclaimer() {
  const { dataset } = useMarketStore();
  const { stats, university, fetchedAt } = dataset;
  const day = fetchedAt.slice(0, 10);

  return (
    <Panel title="이 시세는 무엇인가요" note={`${day} 수집`}>
      <ul className={s.list}>
        <li>
          <span className={s.term}>가격 = 실제 평점 × 10,000.</span> 73,333원은
          평점 7.3333점이라는 뜻이고, 되돌리면 언제나 원래 평점이 나옵니다.
        </li>
        <li>
          <span className={s.term}>움직이는 건 평점이 아니라 호가입니다.</span>{' '}
          시세는 평점을 중심으로 흔들릴 뿐 중심값은 바뀌지 않습니다. 리뷰가 적은
          종목일수록 더 심하게 흔들립니다.
        </li>
        <li>
          출처는{' '}
          <a
            className={s.link}
            href="https://www.starteacher.co.kr/professor/institutes/552"
            target="_blank"
            rel="noreferrer noopener"
          >
            별별선생
          </a>{' '}
          {university} 교수 평점입니다. 조회된 {stats.surveyed}명 중 리뷰가 있는{' '}
          {stats.listed}명만 상장했고, 나머지 {stats.unlisted}명은 값을 만들
          근거가 없어 제외했습니다.
        </li>
        <li>
          <span className={s.term}>
            상장 종목 전체의 리뷰를 다 합쳐도 {stats.totalReviews}건입니다.
          </span>{' '}
          종목당 평균 세 건이 안 됩니다 — 순위를 진지하게 받아들일 표본이
          아닙니다.
        </li>
      </ul>
    </Panel>
  );
}
