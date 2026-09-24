import { test, expect, type Page, type Locator } from '@playwright/test'

// The `Popular Restaurants` section and its restaurant cards (links to /restaurant/...).
function popularSection(page: Page): Locator {
  return page
    .locator('section')
    .filter({ has: page.getByRole('heading', { level: 2, name: 'Popular Restaurants' }) })
}

function restaurantCards(page: Page): Locator {
  return popularSection(page).locator('a[href^="/restaurant/"]')
}

function card(page: Page, name: string): Locator {
  return popularSection(page).getByRole('link', { name, exact: true })
}

async function waitForCards(page: Page) {
  await expect(restaurantCards(page).first()).toBeVisible()
}

async function cardNames(page: Page): Promise<string[]> {
  const names = await restaurantCards(page).getByRole('heading', { level: 3 }).allInnerTexts()
  return names.map((n) => n.trim())
}

// True when the element or any of its descendants is greyed out (grayscale filter or opacity < 1).
async function isGreyedOut(el: Locator): Promise<boolean> {
  return el.evaluate((root) => {
    return [root, ...Array.from(root.querySelectorAll('*'))].some((e) => {
      const c = getComputedStyle(e)
      const grayscale = /grayscale\((?!0\)|0%\))/.test(c.filter)
      return grayscale || parseFloat(c.opacity) < 1
    })
  })
}

const RATING = /^\d(\.\d)?$/
const TIME_RANGE = /^\d+-\d+ min$/
const FEE = /^(\$\d+\.\d{2}|Free)$/
const CUISINES = /^[\p{L}][\p{L} &'-]*(, [\p{L}][\p{L} &'-]*)*$/u

test.describe('FD-01 · Browse restaurants', () => {
  test('FD-01.1 · Card shows name, cuisines, rating, delivery time range, delivery fee (or Free)', async ({ page }) => {
    // spec: "Each restaurant card shows the name, the cuisines, the rating, the delivery time range and the delivery fee (or **Free**)."
    // 1. Go to `/`.
    await page.goto('/')
    // 2. Find the `Popular Restaurants` section and all restaurant cards in it.
    await waitForCards(page)
    const cards = restaurantCards(page)
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)

    // 3. For every card check name, cuisines, rating, time range and fee.
    for (let i = 0; i < count; i++) {
      const c = cards.nth(i)
      const name = (await c.getByRole('heading', { level: 3 }).innerText()).trim()
      expect(name, `card #${i + 1} has a name`).not.toBe('')
      const lines = (await c.innerText())
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      expect(lines.some((l) => CUISINES.test(l) && l !== name), `${name}: cuisines`).toBe(true)
      expect(lines.some((l) => RATING.test(l)), `${name}: rating`).toBe(true)
      expect(lines.some((l) => TIME_RANGE.test(l)), `${name}: delivery time range`).toBe(true)
      expect(lines.some((l) => FEE.test(l)), `${name}: delivery fee or Free`).toBe(true)
    }

    // 4. Both fee forms are covered: `Free` (Pizza Corner) and a price (Burger Palace).
    await expect(card(page, 'Pizza Corner').getByText('Free', { exact: true })).toBeVisible()
    await expect(card(page, 'Burger Palace').getByText(/^\$\d+\.\d{2}$/)).toBeVisible()
  })

  test('FD-01.2 · Card shows current promotion when it has one', async ({ page }) => {
    // spec: "A card shows the restaurant's current promotion when it has one — for example *20% OFF orders over $25*."
    // 1. Go to `/`.
    await page.goto('/')
    await waitForCards(page)
    // 2-3. The Burger Palace card shows its promotion.
    await expect(card(page, 'Burger Palace').getByText('20% OFF orders over $25')).toBeVisible()

    // 4. Pizza Corner (no promotion) shows only rating, name, cuisines, time and fee.
    const pizza = card(page, 'Pizza Corner')
    const cuisines = (await pizza.getByRole('paragraph').first().innerText()).trim()
    expect(cuisines).toMatch(CUISINES)
    const lines = (await pizza.innerText())
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    const extra = lines.filter(
      (l) =>
        l !== 'Pizza Corner' &&
        l !== cuisines &&
        !RATING.test(l) &&
        !TIME_RANGE.test(l) &&
        !FEE.test(l),
    )
    expect(extra, 'Pizza Corner shows no promotion text').toEqual([])
  })

  test('FD-01.3 · Selecting a card opens the restaurant\'s page', async ({ page }) => {
    // spec: "Selecting a card opens that restaurant's page."
    // 1. Go to `/`.
    await page.goto('/')
    await waitForCards(page)
    // 2. Click the Burger Palace card.
    await card(page, 'Burger Palace').click()
    // 3. URL is /restaurant/1.
    await expect(page).toHaveURL(/\/restaurant\/1$/)
    // 4. h1 is Burger Palace.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Burger Palace')
  })

  test('FD-01.4 · View All shows the full list of restaurants', async ({ page }) => {
    // spec: "**View All** shows the full list of restaurants."
    // 1. Go to `/`.
    await page.goto('/')
    await waitForCards(page)
    // 2. Write down the cards under Popular Restaurants.
    const before = await cardNames(page)
    expect(before.length).toBeGreaterThan(0)

    // 3. Click View All.
    await page.getByRole('button', { name: 'View All' }).click()
    await page.waitForLoadState('networkidle')

    // 4. Collect the restaurant cards shown now (anywhere on the page).
    const nowCards = page.locator('a[href^="/restaurant/"]')
    await expect(nowCards.first()).toBeVisible()
    const after = (await nowCards.getByRole('heading', { level: 3 }).allInnerTexts()).map((n) => n.trim())

    // 5. No restaurant from step 2 is missing, count is >= before.
    expect(after.length).toBeGreaterThanOrEqual(before.length)
    for (const name of before) {
      expect(after, `${name} is still in the full list`).toContain(name)
    }
  })

  test('FD-01.5 · Non-delivering restaurant greyed out, Not available at your address badge, counted in subtitle, cannot be opened', async ({ page }) => {
    // spec: "A restaurant that does not deliver to the current address is shown greyed out with a *Not available at your address* badge, and the subtitle counts them (*1 don't deliver there*). It cannot be opened."
    // 1. Go to `/` (default address New York, NY).
    await page.goto('/')
    await waitForCards(page)
    await expect(page.getByRole('button', { name: 'New York, NY' })).toBeVisible()

    // 2. Find the card with the badge.
    const badged = restaurantCards(page).filter({ hasText: 'Not available at your address' })
    await expect(badged.first()).toBeVisible()
    const nonDelivering = badged.first()
    const name = (await nonDelivering.getByRole('heading', { level: 3 }).innerText()).trim()

    // 3. It is greyed out; a delivering card (Burger Palace) is not.
    expect(await isGreyedOut(nonDelivering), `${name} is greyed out`).toBe(true)
    expect(await isGreyedOut(card(page, 'Burger Palace')), 'Burger Palace is not greyed out').toBe(false)

    // 4. Subtitle counts them: "1 don't deliver there" and matches the number of badged cards.
    const subtitle = popularSection(page).getByText(/don't deliver there/)
    await expect(subtitle).toContainText("1 don't deliver there")
    const subtitleText = await subtitle.innerText()
    const counted = Number(subtitleText.match(/(\d+) don't deliver there/)?.[1])
    expect(counted).toBe(await badged.count())

    // 5. Click the non-delivering card.
    await nonDelivering.click()
    await page.waitForTimeout(1000)

    // 6. URL is still `/` and no restaurant page opened.
    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByRole('heading', { level: 1, name })).toHaveCount(0)
  })
})
