import { Check, ArrowDown, ChevronDown } from 'lucide-react';
import type { Scenario } from '@/domain/purchase';
import { formatMoney } from '@/domain/assets';
import { SectionHeading } from './ui';
export function ScenarioCards({
  scenarios,
  selected,
  onSelect,
}: {
  scenarios: Scenario[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  return (
    <section id="scenarios">
      <SectionHeading eyebrow="FIND YOUR COMFORT ZONE" title="조금 덜 빌리면, 얼마나 여유로울까요?">
        <span className="section-note">내게 편안한 시나리오를 선택해 보세요</span>
      </SectionHeading>
      <div className="scenario-grid">
        {scenarios.map((s, i) => (
          <article key={s.discount} className={`scenario-card ${selected === i ? 'selected' : ''}`}>
            <button
              className="scenario-select"
              aria-pressed={selected === i}
              onClick={() => onSelect(i)}
            >
              <div className="scenario-label">
                <span>{i === 0 ? '영끌 최대' : `최대 − ${formatMoney(s.discount)}`}</span>
                <span className="radio-mark">{selected === i && <Check size={11} />}</span>
              </div>
              <h3 className="fade-number" key={s.price}>
                {formatMoney(s.price)}
              </h3>
              <div className="scenario-key-metrics">
                <div>
                  <span>필요 대출금</span>
                  <strong>{formatMoney(s.loan)}</strong>
                </div>
                <div>
                  <span>월 상환액</span>
                  <strong>{formatMoney(s.monthly)}</strong>
                </div>
                <div>
                  <span>남는 현금</span>
                  <strong>{formatMoney(s.cashAfter)}</strong>
                </div>
              </div>
              <div className="scenario-interest-grid">
                <div>
                  <span>첫해 이자</span>
                  <b>{formatMoney(s.firstYearInterest)}</b>
                </div>
                <div>
                  <span>총이자</span>
                  <b>{formatMoney(s.totalInterest)}</b>
                </div>
              </div>
              <div className={`savings ${i === 0 ? 'neutral' : ''}`}>
                {i === 0 ? (
                  <>
                    <span className="status-dot" /> 현재 조건을 최대한 활용해요
                  </>
                ) : (
                  <>
                    <ArrowDown size={13} /> 월 {formatMoney(s.monthlySaving)} · 총이자{' '}
                    {formatMoney(s.interestSaving)} 절약
                  </>
                )}
              </div>
            </button>
            <details className="scenario-details">
              <summary>
                자세히 보기 <ChevronDown size={13} />
              </summary>
              <dl>
                {[
                  ['필요 자기자본', s.equity],
                  ['취득 관련 총비용', s.costs.total],
                  ['월 상환액 절감', s.monthlySaving],
                  ['영끌 대비 총이자 절감', s.interestSaving],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{formatMoney(Number(value))}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </article>
        ))}
      </div>
      <p className="section-footnote">
        보존 현금은 유지하고 여유 금액을 대출 축소에 사용해요. 변동·혼합형 총이자는 현재 금리가
        유지된다는 가정이에요.
      </p>
    </section>
  );
}
