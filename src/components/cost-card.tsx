import { ReceiptText } from 'lucide-react';
import type { Scenario } from '@/domain/purchase';
import { formatMoney } from '@/domain/assets';
import { SectionHeading } from './ui';
const labels = {
  acquisition: '취득세',
  education: '지방교육세',
  rural: '농어촌특별세',
  brokerage: '중개보수 (VAT 포함)',
  registration: '등기 수수료',
  legal: '법무사 비용',
  stamp: '매매계약 인지세',
  loanStamp: '대출 인지세 (고객 부담)',
  bond: '국민주택채권 할인',
  other: '기타 비용',
};
export function CostCard({ scenario: s }: { scenario: Scenario }) {
  return (
    <section className="card cost-card">
      <SectionHeading title="집값 외에 필요한 비용">
        <ReceiptText size={20} />
      </SectionHeading>
      <p className="helper">선택한 시나리오의 매수 부대비용이에요.</p>
      <div className="cost-total">
        <span>총 예상 비용</span>
        <strong>{formatMoney(s.costs.total)}</strong>
      </div>
      <div className="cost-bar">
        <span
          style={{
            flex: Math.max(1, s.costs.acquisition + s.costs.education),
            background: '#347358',
          }}
        />
        <span style={{ flex: Math.max(1, s.costs.brokerage), background: '#9cba91' }} />
        <span
          style={{
            flex: Math.max(
              1,
              s.costs.total - s.costs.acquisition - s.costs.education - s.costs.brokerage,
            ),
            background: '#e3c99b',
          }}
        />
      </div>
      <dl className="cost-lines">
        {Object.entries(labels).map(([key, label]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>{formatMoney(s.costs[key as keyof typeof labels])}</dd>
          </div>
        ))}
      </dl>
      {s.costs.relief > 0 && (
        <div className="relief-note">
          생애최초 취득세 감면 <b>−{formatMoney(s.costs.relief)}</b>
        </div>
      )}
      <p className="section-footnote">
        무주택 가구의 1주택 취득 가정. 채권 할인·법무사 비용은 추정치이며, 감면은 실거주 등 요건
        충족을 전제로 해요.
      </p>
    </section>
  );
}
