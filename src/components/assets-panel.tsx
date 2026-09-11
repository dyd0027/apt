'use client';
import { useRef, useState } from 'react';
import { ArrowUpRight, SlidersHorizontal, X, RotateCcw, Wallet, ShieldCheck } from 'lucide-react';
import { useSimulator } from '@/store/simulator';
import { MoneyInput, Toggle } from './ui';
import { formatMoney, householdIncome, reserveTotal } from '@/domain/assets';
import type { Reserves } from '@/domain/types';
const reserveLabels: Record<keyof Reserves, string> = {
  investment: '투자 유지금',
  emergency: '비상자금',
  furniture: '가전 · 가구',
  moving: '이사비',
  renovation: '인테리어',
  other: '기타 예정 지출',
};
const debtLabels = {
  credit: '신용대출',
  car: '자동차 할부',
  overdraft: '마이너스통장',
  other: '기타 DSR 반영 부채',
};
export function AssetsPanel() {
  const { assets: a, setAssets, reset } = useSimulator();
  const dialog = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState('자산 · 소득');
  const debtBalance = a.debts.reduce((sum, debt) => sum + debt.balance, 0);
  return (
    <>
      <section className="asset-panel card" aria-label="현재 계산에 적용한 자산 조건">
        <div className="panel-title">
          <h2>
            <Wallet size={18} /> 나의 자산
          </h2>
          <span className="tiny-badge">현재 적용 중</span>
        </div>
        <div className="asset-summary-grid">
          <div className="asset-summary-item primary-summary">
            <MoneyInput
              compact
              id="cash"
              label="총 보유 현금"
              value={a.cash}
              onChange={(cash) => setAssets({ cash })}
            />
            <small>매수 전 보유한 전체 현금</small>
          </div>
          <div className="asset-summary-item">
            <span>부부합산 연소득</span>
            <strong className="fade-number" key={householdIncome(a)}>
              {formatMoney(householdIncome(a))}
            </strong>
            <small>{a.married ? '공동차주 소득 합산 가정' : '본인 소득만 적용'}</small>
          </div>
          <div className="asset-summary-item">
            <span>기존 금융부채</span>
            <strong className="fade-number" key={debtBalance}>
              {formatMoney(debtBalance)}
            </strong>
            <small>입력한 부채 잔액 합계</small>
          </div>
          <div className="asset-summary-item">
            <span>반드시 남겨둘 현금</span>
            <strong className="fade-number" key={reserveTotal(a)}>
              {formatMoney(reserveTotal(a))}
            </strong>
            <small>투자·비상금·이사 등 6개 항목</small>
          </div>
        </div>
        <div className="asset-actions">
          <div className="asset-flags" aria-label="추가 적용 조건">
            <span>{a.firstHome ? '생애최초 적용' : '일반 LTV 적용'}</span>
            <span>{a.married ? '부부 소득 합산' : '본인 소득 적용'}</span>
          </div>
          <button className="button asset-edit" onClick={() => dialog.current?.showModal()}>
            <SlidersHorizontal size={16} /> 내 자산 자세히 설정
            <ArrowUpRight size={16} />
          </button>
          <small className="private-note">
            <ShieldCheck size={14} /> 입력한 자산은 서버로 전송하지 않아요
          </small>
        </div>
      </section>
      <dialog
        ref={dialog}
        className="asset-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="dialog-inner">
          <div className="dialog-heading">
            <div>
              <span className="eyebrow">MY FINANCES</span>
              <h2>내 자산 설정</h2>
              <p>입력하면 매수 가능 금액이 바로 바뀌어요.</p>
            </div>
            <button
              className="icon-button"
              aria-label="자산 설정 닫기"
              onClick={() => dialog.current?.close()}
            >
              <X />
            </button>
          </div>
          <div className="tabs" role="tablist">
            {['자산 · 소득', '남겨둘 현금', '기존 부채'].map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={tab === t ? 'active' : ''}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="dialog-fields">
            {tab === '자산 · 소득' && (
              <>
                <MoneyInput
                  id="full-cash"
                  label="총 보유 현금"
                  value={a.cash}
                  onChange={(cash) => setAssets({ cash })}
                />
                <MoneyInput
                  id="income"
                  label="본인 연소득 (세전)"
                  value={a.income}
                  onChange={(income) => setAssets({ income })}
                />
                <Toggle
                  label="혼인 여부"
                  checked={a.married}
                  onChange={(married) => setAssets({ married })}
                />
                {a.married && (
                  <MoneyInput
                    id="spouse-income"
                    label="배우자 연소득 (세전)"
                    value={a.spouseIncome}
                    onChange={(spouseIncome) => setAssets({ spouseIncome })}
                  />
                )}
                <div className="soft-box">
                  적용 합산 소득 <strong>{formatMoney(householdIncome(a))}</strong>
                  <small>부부 공동차주로 소득과 부채를 함께 심사하는 가정이에요.</small>
                </div>
                <Toggle
                  label="생애최초 주택 구입"
                  checked={a.firstHome}
                  onChange={(firstHome) => setAssets({ firstHome })}
                />
                <Toggle
                  label="전용면적 85㎡ 초과"
                  hint="농어촌특별세 추정에 반영해요"
                  checked={a.areaOver85}
                  onChange={(areaOver85) => setAssets({ areaOver85 })}
                />
                <details className="advanced">
                  <summary>정책대출 추가 자격</summary>
                  <p>
                    모의 조건: 성년 세대주, 세대원 전원 무주택, 실거주 및 상품별 연령·면적 요건을
                    충족한다고 가정할 때 켜 주세요. 미혼 단독세대주 등의 예외는 별도 심사가
                    필요해요.
                  </p>
                  <Toggle
                    label="추가 자격 충족 가정"
                    checked={a.policyQualified}
                    onChange={(policyQualified) => setAssets({ policyQualified })}
                  />
                  <MoneyInput
                    id="net-assets"
                    label="가구 순자산 (정책대출 심사용)"
                    value={a.netAssets}
                    onChange={(netAssets) => setAssets({ netAssets })}
                  />
                </details>
              </>
            )}
            {tab === '남겨둘 현금' && (
              <>
                <p className="helper">집을 사고 나서도 지키고 싶은 돈을 먼저 남겨둘게요.</p>
                {Object.entries(reserveLabels).map(([key, label]) => (
                  <MoneyInput
                    key={key}
                    id={`reserve-${key}`}
                    label={label}
                    value={a.reserves[key as keyof Reserves]}
                    onChange={(value) => setAssets({ reserves: { ...a.reserves, [key]: value } })}
                  />
                ))}
                <div className="soft-box">
                  보존할 현금 합계<strong>{formatMoney(reserveTotal(a))}</strong>
                </div>
                {reserveTotal(a) > a.cash && (
                  <p className="error-note">남겨둘 현금이 총 보유 현금보다 많아요.</p>
                )}
              </>
            )}
            {tab === '기존 부채' && (
              <>
                <p className="helper">
                  연간 상환액은 금융기관의 DSR 산정액을 입력해 주세요. 마이너스통장은 사용액이 아닌
                  약정 한도를 잔액에 입력하세요.
                </p>
                {a.debts.map((d, i) => (
                  <div className="debt-group" key={d.kind}>
                    <h3>{debtLabels[d.kind]}</h3>
                    <MoneyInput
                      id={`balance-${d.kind}`}
                      label={d.kind === 'overdraft' ? '약정 한도' : '현재 잔액'}
                      value={d.balance}
                      onChange={(balance) =>
                        setAssets({
                          debts: a.debts.map((v, j) => (j === i ? { ...v, balance } : v)),
                        })
                      }
                    />
                    <MoneyInput
                      id={`payment-${d.kind}`}
                      label="DSR용 연간 원리금 상환액"
                      value={d.annualPayment}
                      onChange={(annualPayment) =>
                        setAssets({
                          debts: a.debts.map((v, j) => (j === i ? { ...v, annualPayment } : v)),
                        })
                      }
                    />
                    {d.balance > 0 && d.annualPayment === 0 && (
                      <p className="error-note">
                        연간 상환액이 0원이어서 이 부채가 DSR에 반영되지 않아요.
                      </p>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="dialog-footer">
            <button className="text-button" onClick={reset}>
              <RotateCcw size={14} /> 예시로 초기화
            </button>
            <button className="button primary" onClick={() => dialog.current?.close()}>
              계산 결과 보기
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
