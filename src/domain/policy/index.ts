import type { Policy } from '../types';
export type PolicyChange = { field: string; before: string; after: string; description: string };
export function diffPolicies(old: Policy, next: Policy): PolicyChange[] {
  const labels: Partial<Record<keyof Policy, string>> = {
    ltv: '일반 LTV',
    firstHomeLtv: '생애최초 LTV',
    dsr: 'DSR',
    stressRate: '스트레스 가산금리',
    stressFactors: '금리 유형별 스트레스 반영률',
    maxYears: '최장 만기',
    mortgageLimits: '주담대 한도',
    tax: '취득세 · 부대비용',
    policyMortgage: '정책대출 자격',
  };
  return Object.entries(labels).flatMap(([key, label]) => {
    const field = key as keyof Policy;
    if (JSON.stringify(old[field]) === JSON.stringify(next[field])) return [];
    const fmt = (v: unknown) =>
      typeof v === 'number' ? (v < 1 ? `${+(v * 100).toFixed(2)}%` : String(v)) : JSON.stringify(v);
    return [
      {
        field: label!,
        before: fmt(old[field]),
        after: fmt(next[field]),
        description:
          key === 'stressRate'
            ? '심사 금리가 높아지면 같은 소득에서 빌릴 수 있는 금액이 줄어들 수 있어요.'
            : '변경된 기준을 현재 자산에 적용해 매수 가능 금액을 다시 계산합니다.',
      },
    ];
  });
}
