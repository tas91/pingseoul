import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? ''

test.describe('관리자 어드민 플로우', () => {
  test.beforeEach(async ({ page }) => {
    // 매 테스트 전 로그인
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin')
  })

  test('시나리오 1: 관리자 로그인', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[type="email"]', ADMIN_EMAIL)
    await page.fill('input[type="password"]', ADMIN_PASSWORD)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/admin')
    // 사이드바 네비게이션 확인
    await expect(page.locator('nav, aside').first()).toBeVisible()
  })

  test('시나리오 2: 예약 승인 (pending → confirmed)', async ({ page }) => {
    await page.goto('/admin/reservations')

    // pending 상태 배지가 있는 행 확인
    const pendingBadge = page.locator('text=대기중').first()
    await expect(pendingBadge).toBeVisible()

    // 해당 행 클릭해서 상세 패널 열기
    const pendingRow = pendingBadge.locator('../..') // 부모 행으로 이동
    await pendingBadge.click()

    // 상세 패널의 승인 버튼 클릭
    const approveBtn = page.locator('button', { hasText: '승인' })
    await expect(approveBtn).toBeVisible()
    await approveBtn.click()

    // 상태가 예약확정으로 변경됨 확인
    await expect(page.locator('text=예약확정').first()).toBeVisible()
  })

  test('시나리오 3: 테이블맵 확인', async ({ page }) => {
    await page.goto('/admin/table-map')

    // 테이블맵 컨테이너 렌더링 확인 (420×720)
    const tableMap = page.locator('[style*="width: 420"]').or(page.locator('[style*="width:420"]'))
    await expect(tableMap.first()).toBeVisible()

    // 테이블 셀들이 렌더링됨 확인 (최소 1개 이상)
    await expect(page.locator('.absolute.flex.flex-col.items-center').first()).toBeVisible()
  })

  test('시나리오 4: 체크인 (confirmed → in_use)', async ({ page }) => {
    await page.goto('/admin/reservations')

    // confirmed 상태 배지 클릭
    const confirmedBadge = page.locator('text=예약확정').first()
    await expect(confirmedBadge).toBeVisible()
    await confirmedBadge.click()

    // 상세 패널의 체크인 버튼 클릭
    const checkinBtn = page.locator('button', { hasText: '체크인' })
    await expect(checkinBtn).toBeVisible()
    await checkinBtn.click()

    // 상태가 이용중으로 변경됨 확인
    await expect(page.locator('text=이용중').first()).toBeVisible()
  })

  test('시나리오 5: 체크아웃 (in_use → completed)', async ({ page }) => {
    await page.goto('/admin/reservations')

    // in_use 상태 배지 클릭
    const inUseBadge = page.locator('text=이용중').first()
    await expect(inUseBadge).toBeVisible()
    await inUseBadge.click()

    // 상세 패널의 체크아웃 버튼 클릭
    const checkoutBtn = page.locator('button', { hasText: '체크아웃' })
    await expect(checkoutBtn).toBeVisible()
    await checkoutBtn.click()

    // 상태가 완료로 변경됨 확인
    await expect(page.locator('text=완료').first()).toBeVisible()
  })
})
