import { NextResponse } from 'next/server';
import { policyProvider } from '@/server/providers';
import { policyRepository } from '@/server/policy-repository';
import { diffPolicies } from '@/domain/policy';
export async function POST() {
  try {
    const [next, history] = await Promise.all([
      policyProvider.fetchLatest(),
      policyRepository.history(),
    ]);
    const old = history[0] ?? next;
    const changes = diffPolicies(old, next);
    await policyRepository.save(next, changes.length > 0);
    return NextResponse.json(
      { policy: next, previous: old, changes, storage: policyRepository.mode },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Policy refresh failed', error);
    return NextResponse.json(
      { error: '정책 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.' },
      { status: 503 },
    );
  }
}
