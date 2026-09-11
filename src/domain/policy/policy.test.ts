import { it, expect } from 'vitest';
import { diffPolicies } from '.';
import { currentPolicy, previousPolicy } from './mock';
it('ignores check timestamps but detects changed rules', () => {
  expect(diffPolicies(currentPolicy, { ...currentPolicy, checkedAt: '2030-01-01' })).toEqual([]);
  expect(diffPolicies(previousPolicy, currentPolicy)).toEqual([
    expect.objectContaining({ field: '스트레스 가산금리', before: '1.5%', after: '3%' }),
  ]);
});
