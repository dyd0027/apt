import { useState } from 'react';
import { ArrowUpRight, ChevronDown, Check, Info } from 'lucide-react';
import type { Assets, LoanTerms, MortgageProduct, Policy } from '@/domain/types';
import { compareProducts } from '@/domain/mortgage/comparison';
import { formatMoney } from '@/domain/assets';
import { SectionHeading } from './ui';
export const rateLabels = { fixed: '고정금리', variable: '변동금리', hybrid: '혼합형' };
export function ProductTable({
  assets,
  price,
  products,
  policy,
  terms,
  selectedId,
  onSelect,
}: {
  assets: Assets;
  price: number;
  products: MortgageProduct[];
  policy: Policy;
  terms: LoanTerms;
  selectedId: string | null;
  onSelect: (p: MortgageProduct) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const offers = compareProducts(assets, price, products, policy, terms.repayment);
  return (
    <section id="products">
      <SectionHeading eyebrow="YOUR MORTGAGE OPTIONS" title="내 조건에 맞춰 살펴보는 대출">
        <span className="outline-badge">
          모의 상품 · {products[0]?.asOf.replaceAll('-', '.')} 기준
        </span>
      </SectionHeading>
      <div className="card product-card">
        <div className="product-intro">
          <span>
            <span className="status-dot" /> 선택한 매수가 <strong>{formatMoney(price)}</strong> 기준
          </span>
          <span>한도 충족 · 자격 조건 순</span>
        </div>
        <div className="table-scroll">
          <table className="product-table">
            <thead>
              <tr>
                <th>금융사 · 상품</th>
                <th>금리 유형</th>
                <th>예상 적용금리</th>
                <th>최대 예상 한도</th>
                <th>월 원리금</th>
                <th>
                  <span className="sr-only">상품 선택</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {offers.map(
                ({ product: p, capacity, fits, monthly, firstYearInterest, totalInterest }, i) => (
                  <ProductRows
                    key={p.id}
                    {...{
                      p,
                      capacity,
                      fits,
                      monthly,
                      firstYearInterest,
                      totalInterest,
                      i,
                      expanded,
                      setExpanded,
                      selectedId,
                      onSelect,
                    }}
                  />
                ),
              )}
            </tbody>
          </table>
        </div>
        <div className="product-mobile-list">
          {offers.map(
            ({ product: p, capacity, fits, monthly, firstYearInterest, totalInterest }, i) => (
              <article
                className={`mobile-product ${selectedId === p.id ? 'selected-product' : ''}`}
                key={p.id}
              >
                <div className="mobile-product-topline">
                  <span className={`rate-badge ${p.rateType}`}>{rateLabels[p.rateType]}</span>
                  {i === 0 && fits && <span className="fit-badge">조건 적합</span>}
                </div>
                <div className="mobile-product-rate">
                  <span>예상 적용금리</span>
                  <strong>{(p.rate * 100).toFixed(2)}%</strong>
                  <small>예시 시작 {(p.advertisedRate * 100).toFixed(2)}%</small>
                </div>
                <div className="mobile-product-numbers">
                  <div>
                    <span>월 원리금</span>
                    <strong>{formatMoney(monthly)}</strong>
                    <small>{p.years}년 기준</small>
                  </div>
                  <div>
                    <span>최대 예상 한도</span>
                    <strong>{formatMoney(capacity.limit)}</strong>
                    <small className={fits ? '' : 'shortfall'}>
                      {fits ? '필요 금액 충족' : '선택 가격에 한도 부족'}
                    </small>
                  </div>
                </div>
                <div className="mobile-product-identity">
                  <span className="bank-logo" style={{ background: p.color }}>
                    {p.initials}
                  </span>
                  <span>
                    <strong>{p.bank}</strong>
                    <small>{p.name}</small>
                  </span>
                </div>
                <div className="mobile-product-actions">
                  <button
                    className="mobile-detail-button"
                    aria-expanded={expanded === p.id}
                    onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                  >
                    우대조건 · 이자 보기 <ChevronDown size={14} />
                  </button>
                  <button
                    className={`button mobile-select-button ${selectedId === p.id ? 'active' : ''}`}
                    onClick={() => onSelect(p)}
                  >
                    {selectedId === p.id ? <Check size={15} /> : <ArrowUpRight size={15} />}
                    {selectedId === p.id ? '적용 중' : '이 조건 적용'}
                  </button>
                </div>
                {expanded === p.id && (
                  <div className="mobile-product-detail">
                    <div>
                      <span>첫해 이자</span>
                      <b>{formatMoney(firstYearInterest)}</b>
                    </div>
                    <div>
                      <span>만기까지 총이자</span>
                      <b>{formatMoney(totalInterest)}</b>
                    </div>
                    <p>
                      <strong>우대조건 예시</strong>
                      {p.conditions.join(' · ')}
                    </p>
                    <p>
                      {p.rateType === 'hybrid'
                        ? `${p.fixedYears}년 고정 후 변동 · 이후 현재 금리 유지 가정`
                        : '현재 금리 유지 가정'}{' '}
                      · {p.asOf} 모의 데이터
                    </p>
                    {!fits && (
                      <p className="shortfall">
                        월 상환액은 필요한 대출금 기준이며, 적용하면 이 상품에서 가능한 최대
                        매수가로 다시 계산합니다.
                      </p>
                    )}
                  </div>
                )}
              </article>
            ),
          )}
        </div>
        <div className="product-disclaimer">
          <Info size={14} />
          <span>
            표시 금리는 실제 공시·승인 금리가 아닌 예시입니다. 소득·가격·추가 자격을 충족하지 않은
            정책대출은 제외했어요.
          </span>
        </div>
      </div>
    </section>
  );
}
function ProductRows({
  p,
  capacity,
  fits,
  monthly,
  firstYearInterest,
  totalInterest,
  i,
  expanded,
  setExpanded,
  selectedId,
  onSelect,
}: {
  p: MortgageProduct;
  capacity: { limit: number };
  fits: boolean;
  monthly: number;
  firstYearInterest: number;
  totalInterest: number;
  i: number;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
  selectedId: string | null;
  onSelect: (p: MortgageProduct) => void;
}) {
  return (
    <>
      <tr>
        <td>
          <button
            className="bank-name"
            onClick={() => setExpanded(expanded === p.id ? null : p.id)}
            aria-expanded={expanded === p.id}
          >
            <span className="bank-logo" style={{ background: p.color }}>
              {p.initials}
            </span>
            <span>
              <strong>
                {p.bank}
                {i === 0 && fits && <em>조건 적합</em>}
              </strong>
              <small>
                {p.name} <ChevronDown size={11} />
              </small>
            </span>
          </button>
        </td>
        <td>
          <span className={`rate-badge ${p.rateType}`}>{rateLabels[p.rateType]}</span>
        </td>
        <td>
          <strong className="rate-number">
            {(p.rate * 100).toFixed(2)}
            <small>%</small>
          </strong>
          <span className="table-sub">예시 시작 {(p.advertisedRate * 100).toFixed(2)}%</span>
        </td>
        <td>
          <b>{formatMoney(capacity.limit)}</b>
          <span className={`table-sub ${fits ? '' : 'shortfall'}`}>
            {fits ? '필요 금액 충족' : '선택한 매수가에 한도 부족'}
          </span>
        </td>
        <td>
          <b>{formatMoney(monthly)}</b>
          <span className="table-sub">{p.years}년 기준</span>
        </td>
        <td>
          <button
            className={`select-product ${selectedId === p.id ? 'active' : ''}`}
            aria-label={`${p.bank} 조건으로 계산`}
            onClick={() => onSelect(p)}
          >
            {selectedId === p.id ? <Check size={16} /> : <ArrowUpRight size={17} />}
          </button>
        </td>
      </tr>
      {expanded === p.id && (
        <tr className="product-detail">
          <td colSpan={6}>
            <div>
              <span>
                첫해 이자 <b>{formatMoney(firstYearInterest)}</b>
              </span>
              <span>
                총이자 <b>{formatMoney(totalInterest)}</b>
              </span>
              <span>
                우대조건 예시 <b>{p.conditions.join(' · ')}</b>
              </span>
              <span>
                {p.rateType === 'hybrid'
                  ? `${p.fixedYears}년 고정 후 변동 · 이후 현재 금리 유지 가정`
                  : '현재 금리 유지 가정'}{' '}
                · {p.asOf} 모의 데이터
              </span>
              {!fits && (
                <span className="shortfall">
                  월 상환액은 필요한 대출금 기준의 참고값입니다. 이 상품 선택 시 가능한 최대
                  매수가로 다시 계산합니다.
                </span>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
