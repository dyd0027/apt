import { Dashboard } from '@/components/dashboard';
import { policyRepository } from '@/server/policy-repository';
import { mortgageRateProvider } from '@/server/providers';
import { currentPolicy, policyHistory } from '@/domain/policy/mock';
export const dynamic = 'force-dynamic';
export default async function Page() {
  const products = await mortgageRateProvider.listProducts();
  let history = policyHistory,
    storage: string = policyRepository.mode,
    initialError: string | undefined;
  try {
    const saved = await policyRepository.history();
    if (saved.length) history = saved;
  } catch (error) {
    console.error('Policy history unavailable', error);
    storage = 'demo';
    initialError = '정책 DB 연결에 실패해 모의 데이터로 표시하고 있어요.';
  }
  return (
    <Dashboard
      initialPolicy={history[0] ?? currentPolicy}
      history={history}
      products={products}
      storage={storage}
      initialError={initialError}
    />
  );
}
