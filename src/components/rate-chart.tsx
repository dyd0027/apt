'use client';
import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { LoanTerms, Policy } from '@/domain/types';
import { rateScenarios } from '@/domain/mortgage/comparison';
import { stressRate } from '@/domain/mortgage';
import { formatMoney } from '@/domain/assets';
import { rateLabels } from './product-table';
import { SectionHeading } from './ui';
export function RateChart({
  loan,
  terms: t,
  policy: p,
  onChange,
}: {
  loan: number;
  terms: LoanTerms;
  policy: Policy;
  onChange: (patch: Partial<LoanTerms>) => void;
}) {
  const rows = useMemo(() => rateScenarios(loan, t), [loan, t]);
  const chart = rows.map((r) => ({ ...r, payment: r.resetPayment / 10000 }));
  return (
    <section className="card rate-chart" id="rates">
      <SectionHeading title="금리가 달라져도 괜찮을까요?">
        <TrendingUp size={20} />
      </SectionHeading>
      <p className="helper">
        {t.rateType === 'hybrid'
          ? `${t.fixedYears}년 고정 후, 남은 잔액에 새 금리를 적용했어요.`
          : t.rateType === 'fixed'
            ? '만기까지 같은 금리로 상환해요.'
            : '대출 시작 시점부터 금리가 달라지는 경우를 비교해요.'}
      </p>
      <div className="rate-controls">
        <div className="tabs compact-tabs">
          {(['fixed', 'hybrid', 'variable'] as const).map((type) => (
            <button
              key={type}
              className={t.rateType === type ? 'active' : ''}
              aria-pressed={t.rateType === type}
              onClick={() => onChange({ rateType: type })}
            >
              {rateLabels[type]}
            </button>
          ))}
        </div>
        <label className="rate-input">
          실제 금리{' '}
          <input
            aria-label="실제 대출금리"
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={+(t.rate * 100).toFixed(2)}
            onChange={(e) =>
              onChange({ rate: Math.min(20, Math.max(0, Number(e.target.value))) / 100 })
            }
          />
          %
        </label>
      </div>
      <div className="term-controls">
        <label>
          대출 기간
          <select
            aria-label="대출 기간"
            value={t.years}
            onChange={(e) => onChange({ years: Number(e.target.value) })}
          >
            {[10, 15, 20, 25, 30].map((v) => (
              <option key={v} value={v}>
                {v}년
              </option>
            ))}
          </select>
        </label>
        <label>
          상환 방식
          <select
            aria-label="상환 방식"
            value={t.repayment}
            onChange={(e) => onChange({ repayment: e.target.value as LoanTerms['repayment'] })}
          >
            <option value="annuity">원리금균등</option>
            <option value="equal-principal">원금균등</option>
          </select>
        </label>
        {t.rateType === 'hybrid' && (
          <label>
            고정 기간
            <select
              aria-label="고정 기간"
              value={t.fixedYears}
              onChange={(e) => onChange({ fixedYears: Number(e.target.value) })}
            >
              {[3, 5, 7].map((v) => (
                <option key={v} value={v}>
                  {v}년
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="chart-caption">
        <span>월 상환액 (만원)</span>
        <span>
          DSR 심사용 <b>{(stressRate(t, p) * 100).toFixed(2)}%</b>
        </span>
      </div>
      <div className="chart-container" aria-label="금리 변화별 월 상환액 그래프">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={chart} margin={{ top: 10, right: 18, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#518f74" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#518f74" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e9ede8" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#586a60', fontSize: 12, fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#586a60', fontSize: 12, fontWeight: 500 }}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #cfd9d1',
                background: '#ffffff',
                color: '#233c31',
                fontSize: 13,
                boxShadow: '0 8px 24px rgba(31, 55, 43, 0.10)',
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}만원`, '월 상환액']}
            />
            <Area
              type="monotone"
              dataKey="payment"
              stroke="#347358"
              strokeWidth={2.5}
              fill="url(#chart-fill)"
              dot={{ r: 4, fill: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="rate-result-grid">
        {rows.map((r) => (
          <div key={r.delta} className={r.delta === 0 ? 'current' : ''}>
            <span>{r.label}</span>
            <b>{formatMoney(r.resetPayment)}</b>
          </div>
        ))}
      </div>
      <details className="rate-details">
        <summary>첫해 이자 · 총이자 비교</summary>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>금리 가정</th>
                <th>첫해 이자</th>
                <th>총이자</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.delta}>
                  <td>
                    {r.label} ({(r.rate * 100).toFixed(1)}%)
                  </td>
                  <td>{formatMoney(r.firstYearInterest)}</td>
                  <td>{formatMoney(r.totalInterest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <p className="section-footnote">
        원금균등은 첫 회차, 혼합형은 금리 전환 직후 회차를 표시해요. 혼합형 심사에는 보수적으로
        스트레스 가산금리 전액을 적용합니다.
      </p>
    </section>
  );
}
