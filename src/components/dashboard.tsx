'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  House,
  LayoutDashboard,
  ChartNoAxesCombined,
  History,
  ArrowUpRight,
  RefreshCw,
  Check,
  MapPin,
  Bookmark,
  Info,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import type { LoanTerms, MortgageProduct, Policy } from '@/domain/types';
import type { PolicyChange } from '@/domain/policy';
import { useSimulator } from '@/store/simulator';
import { createScenarios, policyImpact } from '@/domain/purchase';
import { formatMoney, reserveTotal } from '@/domain/assets';
import { assetsSchema } from '@/domain/assets/schema';
import { Hero } from './hero';
import { AssetsPanel } from './assets-panel';
import { ScenarioCards } from './scenario-cards';
import { ProductTable } from './product-table';
import { RateChart } from './rate-chart';
import { CostCard } from './cost-card';
import { PolicyPanel } from './policy-panel';
type RefreshResult = { policy: Policy; previous: Policy; changes: PolicyChange[]; storage: string };
export function Dashboard({
  initialPolicy,
  history,
  products,
  storage,
  initialError,
}: {
  initialPolicy: Policy;
  history: Policy[];
  products: MortgageProduct[];
  storage: string;
  initialError?: string;
}) {
  const { assets, terms, setTerms, setAssets } = useSimulator();
  const [policy, setPolicy] = useState(initialPolicy),
    [view, setView] = useState('dashboard'),
    [selected, setSelected] = useState(0),
    [productId, setProductId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false),
    [notice, setNotice] = useState(initialError ?? ''),
    [noticeError, setNoticeError] = useState(Boolean(initialError));
  const [refreshResult, setRefreshResult] = useState<RefreshResult | null>(null);
  const chosenProduct = products.find((p) => p.id === productId);
  const scenarios = useMemo(
    () => createScenarios(assets, terms, policy, chosenProduct),
    [assets, terms, policy, chosenProduct],
  );
  const active = scenarios[selected];
  async function refresh() {
    setRefreshing(true);
    setNoticeError(false);
    try {
      const response = await fetch('/api/policy', { method: 'POST' });
      if (!response.ok) throw new Error('정책 확인에 실패했어요. 다시 시도해 주세요.');
      const data: RefreshResult = await response.json();
      setPolicy(data.policy);
      setRefreshResult(data);
      const date = new Date(data.policy.checkedAt).toLocaleDateString('ko-KR', {
        timeZone: 'Asia/Seoul',
      });
      setNotice(
        `${date} 모의 정책 ${data.changes.length ? '변경 감지' : '변동 없음'} · 실시간 공시 연동 전입니다.`,
      );
    } catch (e) {
      setNoticeError(true);
      setNotice(e instanceof Error ? e.message : '정책 확인 실패');
    } finally {
      setRefreshing(false);
    }
  }
  function changeTerms(patch: Partial<LoanTerms>) {
    setProductId(null);
    setTerms(patch);
  }
  function chooseProduct(p: MortgageProduct) {
    setProductId(p.id);
    setTerms({
      rate: p.rate,
      rateType: p.rateType,
      years: Math.min(p.years, policy.maxYears),
      fixedYears: p.fixedYears,
    });
    setNotice(`${p.bank} 모의 상품 조건으로 최대 매수가를 다시 계산했어요.`);
    setNoticeError(false);
  }
  function save() {
    try {
      localStorage.setItem('home-today-assets', JSON.stringify(assets));
      setNotice('이 브라우저에 자산 설정을 저장했어요.');
      setNoticeError(false);
    } catch {
      setNotice('브라우저 저장소를 사용할 수 없어요.');
      setNoticeError(true);
    }
  }
  function restore() {
    try {
      const raw = localStorage.getItem('home-today-assets');
      if (!raw) throw new Error('저장한 자산 설정이 없어요.');
      const parsed = assetsSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) throw new Error('저장된 설정을 읽을 수 없어요.');
      setAssets(parsed.data);
      setNotice('저장한 자산 설정을 불러왔어요.');
      setNoticeError(false);
    } catch (e) {
      setNoticeError(true);
      setNotice(e instanceof Error ? e.message : '불러오지 못했어요.');
    }
  }
  function navigate(next: string) {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const mergedHistory = [policy, ...history.filter((p) => p.version !== policy.version)];
  const impact = refreshResult?.changes.length
    ? policyImpact(assets, terms, refreshResult.previous, refreshResult.policy)
    : null;
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="오늘 살 수 있는 집 홈">
          <span className="brand-icon">
            <House size={23} strokeWidth={1.8} />
          </span>
          <span>
            오늘 살 수 있는 집<small>나에게 맞는 집의 시작</small>
          </span>
        </Link>
        <div className="sidebar-label">MY HOME PLANNER</div>
        <nav aria-label="메인 메뉴">
          <button
            className={view === 'dashboard' ? 'active' : ''}
            onClick={() => navigate('dashboard')}
          >
            <LayoutDashboard size={18} /> 나의 대시보드
            <span className="nav-dot" />
          </button>
          <button
            className={view === 'compare' ? 'active' : ''}
            onClick={() => navigate('compare')}
          >
            <ChartNoAxesCombined size={18} /> 시나리오 비교
          </button>
          <button className={view === 'policy' ? 'active' : ''} onClick={() => navigate('policy')}>
            <History size={18} /> 정책 히스토리
            <span className="nav-count">{mergedHistory.length}</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">
              <House size={19} />
            </span>
            <strong>내 집 마련의 첫걸음</strong>
            <p>
              집을 찾기 전에,
              <br />
              나의 가능 금액부터 알아보세요.
            </p>
            <button
              onClick={() => {
                navigate('dashboard');
                document.getElementById('cash')?.focus();
              }}
            >
              내 자산 살펴보기 <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="sidebar-status">
            <span className="status-dot" /> 서울 기준 시뮬레이션
          </div>
          <span className="version-label">HOME, WITHIN REACH.</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            마이 홈 플래너
            <ChevronRight size={13} />
            <strong>
              {view === 'policy'
                ? '정책 히스토리'
                : view === 'compare'
                  ? '시나리오 비교'
                  : '나의 대시보드'}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="seoul-label">
              <MapPin size={13} /> 서울특별시
            </span>
            <button className="avatar" onClick={restore} aria-label="저장한 자산 불러오기">
              나
            </button>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="page-eyebrow">
                <span className="status-dot" /> MY HOME, MY PACE
              </div>
              <h1>
                {view === 'policy'
                  ? '정책의 변화, 한눈에'
                  : view === 'compare'
                    ? '나에게 편안한 선택'
                    : '내 집 마련, 숫자로 더 가까이'}
              </h1>
              <p>나의 자산과 대출 조건으로, 오늘의 가능성을 확인해 보세요.</p>
            </div>
            <button className="button save-button" onClick={save}>
              <Bookmark size={15} /> 설정 저장
            </button>
          </div>
          <div className="policy-banner">
            <div>
              <span className="policy-icon">
                <ShieldCheck size={18} />
              </span>
              <span>
                <strong>정책과 금리, 함께 반영했어요</strong>
                <small>
                  {policy.effectiveDate.replaceAll('-', '.')} 모의 정책 ·{' '}
                  {storage === 'database' ? 'DB 버전 관리' : '데모 모드'} · 실제 공시 연동 전
                </small>
              </span>
            </div>
            <button onClick={refresh} disabled={refreshing}>
              <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
              {refreshing ? '확인 중…' : '현재 정책 반영'}
            </button>
          </div>
          {notice && (
            <div
              className={`notice ${noticeError ? 'error' : ''}`}
              role={noticeError ? 'alert' : 'status'}
            >
              {noticeError ? <Info size={16} /> : <Check size={16} />}
              <span>
                {notice}
                {impact && (
                  <b>
                    {' '}
                    이전 {formatMoney(impact.before)} → 현재 {formatMoney(impact.after)} (변화{' '}
                    {formatMoney(impact.delta)})
                  </b>
                )}
              </span>
              <button className="text-button" aria-label="알림 닫기" onClick={() => setNotice('')}>
                ×
              </button>
            </div>
          )}
          {view === 'policy' ? (
            <PolicyPanel history={mergedHistory} assets={assets} terms={terms} />
          ) : (
            <>
              <section className="input-stage" aria-labelledby="asset-stage-title">
                <div className="stage-heading">
                  <span className="stage-number">1</span>
                  <div>
                    <span className="stage-kicker">INPUT</span>
                    <h2 id="asset-stage-title">먼저, 현재 자산 조건을 확인해 주세요</h2>
                    <p>아래 값이 모든 계산의 기준이 됩니다.</p>
                  </div>
                </div>
                <AssetsPanel />
              </section>
              <div className="calculation-flow" aria-hidden="true">
                <span />
                <p>입력한 조건으로 바로 계산했어요</p>
                <span />
              </div>
              <section className="result-stage" aria-labelledby="result-stage-title">
                <div className="stage-heading result-heading">
                  <span className="stage-number">2</span>
                  <div>
                    <span className="stage-kicker">RESULT</span>
                    <h2 id="result-stage-title">현재 설정한 조건을 기준으로 계산한 결과</h2>
                    <p>자산이나 대출 조건을 바꾸면 아래 결과가 함께 갱신됩니다.</p>
                  </div>
                </div>
                <Hero scenario={scenarios[0]} assets={assets} terms={terms} policy={policy} />
              </section>
              {reserveTotal(assets) > assets.cash && (
                <div role="alert" className="notice error">
                  남겨둘 현금이 총 보유 현금을 초과해요. 자산 설정을 확인해 주세요.
                </div>
              )}
              {assets.debts.some((d) => d.balance > 0 && d.annualPayment === 0) && (
                <div role="alert" className="notice error">
                  잔액이 있는 부채의 연간 상환액이 0원입니다. DSR 한도가 과대 계산될 수 있으니 자산
                  설정에서 입력해 주세요.
                </div>
              )}
              <ScenarioCards scenarios={scenarios} selected={selected} onSelect={setSelected} />
              {view === 'dashboard' && (
                <ProductTable
                  assets={assets}
                  price={active.price}
                  products={products}
                  policy={policy}
                  terms={terms}
                  selectedId={productId}
                  onSelect={chooseProduct}
                />
              )}
              <div className="details-grid">
                <RateChart
                  loan={active.loan}
                  terms={terms}
                  policy={policy}
                  onChange={changeTerms}
                />
                <CostCard scenario={active} />
              </div>
              <div className="bottom-callout">
                <div>
                  <span className="callout-icon">
                    <History size={22} />
                  </span>
                  <span>
                    <strong>어제와 다른 가능 금액, 이유가 궁금하다면</strong>
                    <small>정책 변화가 나의 매수 가능 금액에 미치는 영향을 확인해 보세요.</small>
                  </span>
                </div>
                <button onClick={() => navigate('policy')}>
                  정책 히스토리 보기 <ArrowUpRight size={16} />
                </button>
              </div>
            </>
          )}
          <footer>
            <span className="footer-brand">
              <House size={15} /> 오늘 살 수 있는 집
            </span>
            <p>
              모의 데이터 기반 예상치이며 실제 대출 승인이나 세금 고지 금액과 다를 수 있어요.
              <br />
              무주택 가구의 서울 아파트 1주택 취득 · 공동차주 소득 합산 · 최대 30년 상환 가정입니다.
            </p>
            <span>작은 계획이, 나의 집으로.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
