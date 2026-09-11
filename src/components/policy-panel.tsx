import { History, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import type { Assets, LoanTerms, Policy } from '@/domain/types';
import { diffPolicies } from '@/domain/policy';
import { policyImpact } from '@/domain/purchase';
import { formatMoney } from '@/domain/assets';
import { SectionHeading } from './ui';
export function PolicyPanel({
  history,
  assets,
  terms,
}: {
  history: Policy[];
  assets: Assets;
  terms: LoanTerms;
}) {
  const current = history[0],
    previous = history[1];
  const impact = previous ? policyImpact(assets, terms, previous, current) : null;
  const changes = previous ? diffPolicies(previous, current) : [];
  return (
    <section className="policy-page">
      <SectionHeading eyebrow="POLICY TIMELINE" title="정책이 바뀌면, 내 집의 범위도 바뀌니까">
        <span className="outline-badge">
          <History size={13} /> 정책 히스토리
        </span>
      </SectionHeading>
      <div className="policy-info">
        <ShieldCheck size={20} />
        <div>
          <strong>변경 흐름을 확인하는 모의 정책 이력이에요.</strong>
          <p>
            아래 버전과 시행일은 기능 시연을 위한 예시이며 실제 정책 변경 이력이 아닙니다. 공식
            출처는 참고 자료입니다.
          </p>
        </div>
      </div>
      {impact && (
        <div className="card impact-card">
          <span className="eyebrow">SAME ASSETS, DIFFERENT POLICY</span>
          <h2>같은 자산으로 비교했어요</h2>
          <div className="impact-numbers">
            <div>
              <span>이전 모의 정책</span>
              <strong>{formatMoney(impact.before)}</strong>
            </div>
            <ArrowRight />
            <div>
              <span>현재 모의 정책</span>
              <strong>{formatMoney(impact.after)}</strong>
            </div>
            <div className="impact-delta">
              <span>최대 매수가 변화</span>
              <strong>
                {impact.delta > 0 ? '+' : ''}
                {formatMoney(impact.delta)}
              </strong>
            </div>
          </div>
          <p>
            현재 자산과 직접 설정한 금리 기준입니다.{' '}
            {impact.delta === 0
              ? '현재는 다른 대출 한도가 먼저 적용되어 매수가 변화가 없어요.'
              : '스트레스 심사 조건의 변화가 대출 가능액에 반영돼요.'}
          </p>
        </div>
      )}
      {changes.map((c) => (
        <div className="policy-change card" key={c.field}>
          <h3>{c.field}</h3>
          <div>
            <span>{c.before}</span>
            <ArrowRight size={16} />
            <strong>{c.after}</strong>
          </div>
          <p>{c.description}</p>
          <small>모의 시행일 {current.effectiveDate}</small>
        </div>
      ))}
      <div className="timeline">
        {history.map((p, i) => (
          <article className="timeline-item" key={p.version}>
            <span className="timeline-dot" />
            <div className="timeline-date">
              {p.effectiveDate.replaceAll('-', '.')}
              <span>{i === 0 ? '현재 적용' : '이전 버전'}</span>
            </div>
            <div className="card timeline-card">
              <h3>
                {p.version} <span className="tiny-badge">MOCK</span>
              </h3>
              <dl>
                <div>
                  <dt>일반 / 생애최초 LTV</dt>
                  <dd>
                    {p.ltv * 100}% / {p.firstHomeLtv * 100}%
                  </dd>
                </div>
                <div>
                  <dt>DSR / 스트레스 가산금리</dt>
                  <dd>
                    {p.dsr * 100}% / +{p.stressRate * 100}%p
                  </dd>
                </div>
                <div>
                  <dt>주담대 한도 (15억 이하 / 25억 이하 / 초과)</dt>
                  <dd>{p.mortgageLimits.map((r) => formatMoney(r.limit)).join(' / ')}</dd>
                </div>
                <div>
                  <dt>생애최초 취득세 감면 상한</dt>
                  <dd>
                    {formatMoney(p.tax.firstHomeRelief)} · {formatMoney(p.tax.firstHomePriceLimit)}{' '}
                    이하
                  </dd>
                </div>
                <div>
                  <dt>정책대출 소득 한도 (일반 / 생애최초)</dt>
                  <dd>
                    보금자리론 {formatMoney(p.policyMortgage.bogeumjari.incomeLimit)} /{' '}
                    {formatMoney(p.policyMortgage.bogeumjari.firstHomeIncomeLimit)}
                    <br />
                    디딤돌 {formatMoney(p.policyMortgage.didimdol.incomeLimit)} /{' '}
                    {formatMoney(p.policyMortgage.didimdol.firstHomeIncomeLimit)}
                  </dd>
                </div>
              </dl>
              <div className="source-links">
                {p.source.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
                    {s.title}
                    <ExternalLink size={11} />
                  </a>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
