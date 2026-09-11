import { ArrowUpRight, MapPin, Info, Landmark, Coins, CalendarDays } from 'lucide-react';
import type { Assets, LoanTerms, Policy } from '@/domain/types';
import type { Scenario } from '@/domain/purchase';
import { formatMoney, availableCash } from '@/domain/assets';
import { stressRate } from '@/domain/mortgage';
import { Metric } from './ui';
function City() {
  return (
    <svg className="city-art" viewBox="0 0 280 230" fill="none" aria-hidden="true">
      <ellipse cx="148" cy="210" rx="122" ry="16" fill="#bfd4ca" opacity=".5" />
      <path d="M157 31 207 54V188L157 166Z" fill="#acc7b8" />
      <path d="M104 54 157 31V166L104 191Z" fill="#f0f6ed" />
      <path d="M104 54 155 78 207 54 157 31Z" fill="#fff" />
      <path d="M155 78V211L207 188V54Z" fill="#8eafa0" />
      <path d="M104 54 155 78V211L104 191Z" fill="#dfede1" />
      {[0, 1, 2, 3, 4, 5].map((y) => (
        <g key={y}>
          {[0, 1, 2].map((x) => (
            <path key={x} d={`M${112 + x * 13} ${76 + y * 19}l7 3v10l-7-3Z`} fill="#729789" />
          ))}
          {[0, 1, 2].map((x) => (
            <path key={x} d={`M${164 + x * 13} ${83 + y * 19}l7-3v10l-7 3Z`} fill="#d4e5d8" />
          ))}
        </g>
      ))}
      <path d="M46 128 82 112 116 129V200L79 216 46 199Z" fill="#c6dacc" />
      <path d="M46 128 79 143 116 129 82 112Z" fill="#f7faf0" />
      <path d="M79 143 116 129V200L79 216Z" fill="#9fbfae" />
      {[0, 1, 2].map((y) => (
        <g key={y}>
          <path d={`M54 ${144 + y * 17}l8 3v9l-8-3Zm14 6 6 3v9l-6-3Z`} fill="#789d87" />
          <path d={`M86 ${151 + y * 17}l8-4v9l-8 4Zm15-7 8-4v9l-8 4Z`} fill="#e5f0de" />
        </g>
      ))}
      <path d="M223 162v43M33 174v30" stroke="#668b72" strokeWidth="4" />
      <ellipse cx="223" cy="156" rx="17" ry="25" fill="#739b7b" />
      <ellipse cx="33" cy="169" rx="13" ry="19" fill="#8cae88" />
      <path
        d="M187 32c7-16 25-16 31-3 12-2 19 8 17 16h-62c-1-8 5-14 14-13Z"
        fill="white"
        opacity=".7"
      />
      <circle cx="58" cy="63" r="16" fill="#edf0ce" />
      <path
        d="m17 97 8-4 8 4m198 12 7-4 7 4"
        stroke="#8eaa97"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function Hero({
  scenario: s,
  assets: a,
  terms: t,
  policy: p,
}: {
  scenario: Scenario;
  assets: Assets;
  terms: LoanTerms;
  policy: Policy;
}) {
  return (
    <div className="hero-column">
      <section className="hero-card">
        <div className="hero-top">
          <span className="pill">
            <MapPin size={12} /> 서울 아파트
          </span>
          <span className="hero-estimate">현재 입력값 · 모의 정책 기반 예상치</span>
        </div>
        <div className="hero-content">
          <p>현재 설정한 조건 기준</p>
          <h2>오늘 서울에서 살 수 있는 최대 아파트</h2>
          <div className="hero-price fade-number" key={s.price} data-testid="max-price">
            {formatMoney(s.price)}
          </div>
          <span className="hero-sub">
            입력값이 바뀌면 결과도 바로 달라져요 <ArrowUpRight size={15} />
          </span>
        </div>
        <City />
        <div className="hero-bottom">
          <span>
            <span className="status-dot" />
            {a.firstHome ? '생애최초 LTV 적용' : '일반 무주택 LTV 적용'}
          </span>
          <span>
            한도를 결정한 조건 <strong>{s.capacity.binding}</strong>
            <Info size={13} />
          </span>
        </div>
      </section>
      <div className="metrics">
        <Metric
          label="실제 투입 자기자본"
          value={formatMoney(Math.max(0, availableCash(a) - s.costs.total))}
          sub="보존 현금 · 매수 비용 차감"
          icon={<Coins size={16} />}
        />
        <Metric
          label="최대 예상 대출금"
          value={formatMoney(s.loan)}
          sub={`DSR 심사 금리 ${(stressRate(t, p) * 100).toFixed(2)}%`}
          icon={<Landmark size={16} />}
        />
        <Metric
          label="예상 월 상환액"
          value={formatMoney(s.monthly)}
          sub={`${t.years}년 · 실제 금리 ${(t.rate * 100).toFixed(2)}%`}
          icon={<CalendarDays size={16} />}
        />
      </div>
    </div>
  );
}
