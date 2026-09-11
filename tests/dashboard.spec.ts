import { test, expect } from '@playwright/test';
test('desktop calculations, input, scenarios, rates, products, persistence and policy', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '내 집 마련, 숫자로 더 가까이' })).toBeVisible();
  const assetStage = page.getByRole('heading', { name: '먼저, 현재 자산 조건을 확인해 주세요' });
  const resultStage = page.getByRole('heading', {
    name: '현재 설정한 조건을 기준으로 계산한 결과',
  });
  expect((await assetStage.boundingBox())!.y).toBeLessThan((await resultStage.boundingBox())!.y);
  const max = page.getByTestId('max-price');
  const initial = await max.innerText();
  await page.getByRole('textbox', { name: '총 보유 현금', exact: true }).fill('550000000');
  await expect(max).not.toHaveText(initial);
  await page.getByRole('button', { name: '내 자산 자세히 설정' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('본인 연소득 (세전)').fill('65000000');
  await page.getByRole('switch', { name: '혼인 여부', exact: true }).click();
  await expect(page.getByLabel('배우자 연소득 (세전)')).toHaveCount(0);
  await page.getByRole('tab', { name: '남겨둘 현금' }).click();
  await page.getByLabel('비상자금', { exact: true }).fill('30000000');
  await page.getByRole('tab', { name: '기존 부채' }).click();
  await page.locator('#balance-credit').fill('10000000');
  await page.locator('#payment-credit').fill('2000000');
  await page.getByRole('button', { name: '계산 결과 보기' }).click();
  await page.locator('.scenario-select').nth(2).click();
  await expect(page.locator('.scenario-select').nth(2)).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.scenario-details summary').nth(2).click();
  await expect(page.locator('.scenario-details').nth(2)).toHaveAttribute('open', '');
  await page.getByRole('button', { name: '신한은행 조건으로 계산' }).click();
  await expect(page.getByRole('status')).toContainText('신한은행');
  await page.getByRole('button', { name: '고정금리', exact: true }).click();
  await expect(page.getByRole('button', { name: '고정금리', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: '설정 저장', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '저장한 자산 불러오기' }).click();
  await expect(page.getByRole('textbox', { name: '총 보유 현금', exact: true })).toHaveValue(
    '550,000,000',
  );
  await page.getByRole('button', { name: '현재 정책 반영' }).click();
  await expect(page.getByRole('status')).toContainText('모의 정책 변동 없음');
  await page.getByRole('button', { name: '정책 히스토리', exact: false }).first().click();
  await expect(page.getByRole('heading', { name: '같은 자산으로 비교했어요' })).toBeVisible();
  expect(errors).toEqual([]);
});
test('responsive layouts preserve input-first flow without page overflow', async ({ page }) => {
  test.setTimeout(120_000);
  for (const viewport of [
    { width: 360, height: 800, name: '360' },
    { width: 375, height: 812, name: '375' },
    { width: 390, height: 844, name: '390' },
    { width: 430, height: 932, name: '430' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1440, height: 1000, name: 'desktop' },
    { width: 1920, height: 1080, name: 'wide' },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByTestId('max-price')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
    const assetStage = page.getByRole('heading', { name: '먼저, 현재 자산 조건을 확인해 주세요' });
    const resultStage = page.getByRole('heading', {
      name: '현재 설정한 조건을 기준으로 계산한 결과',
    });
    expect((await assetStage.boundingBox())!.y).toBeLessThan((await resultStage.boundingBox())!.y);
    await page.screenshot({ path: `test-results/${viewport.name}.png`, fullPage: true });

    if ([360, 768, 1440].includes(viewport.width)) {
      await page.locator('.sidebar nav button').nth(2).click();
      await expect(page.locator('.policy-page')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width,
      );
      await page.screenshot({
        path: `test-results/policy-${viewport.name}.png`,
        fullPage: true,
      });
    }
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  await expect(page.locator('.product-mobile-list')).toBeVisible();
  await expect(page.locator('.product-table')).toBeHidden();
  await page.getByRole('button', { name: '내 자산 자세히 설정' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(dialogBox).not.toBeNull();
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(360);
  expect(dialogBox!.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox!.y + dialogBox!.height).toBeLessThanOrEqual(800);
  await page.getByLabel('본인 연소득 (세전)').fill('0');
  await page.getByRole('button', { name: '자산 설정 닫기' }).click();
  await page.getByLabel('실제 대출금리').fill('0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});
test('policy errors keep existing calculation and support retry', async ({ page }) => {
  await page.goto('/');
  const before = await page.getByTestId('max-price').innerText();
  await page.route('**/api/policy', (route) => route.fulfill({ status: 503, body: '{}' }));
  await page.getByRole('button', { name: '현재 정책 반영' }).click();
  await expect(page.locator('.notice[role=alert]')).toContainText('실패');
  await expect(page.getByTestId('max-price')).toHaveText(before);
  await page.unroute('**/api/policy');
  await page.getByRole('button', { name: '현재 정책 반영' }).click();
  await expect(page.getByRole('status')).toContainText('변동 없음');
});
test('desktop screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/');
  await expect(page.locator('.recharts-surface').first()).toBeVisible();
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: true });
});
