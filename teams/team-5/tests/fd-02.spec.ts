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

function searchBox(page: Page): Locator {
  return page.getByRole('textbox', { name: 'Search for restaurants or dishes...' })
}

function chip(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true })
}

async function cardNames(page: Page): Promise<string[]> {
  const names = await restaurantCards(page).getByRole('heading', { level: 3 }).allInnerTexts()
  return names.map((n) => n.trim())
}

// Name + cuisines paragraph (the <p> right after the h3) of every shown card.
async function shownCards(page: Page): Promise<{ name: string; cuisines: string; href: string }[]> {
  return restaurantCards(page).evaluateAll((els) =>
    els.map((a) => ({
      name: (a.querySelector('h3')?.textContent ?? '').trim(),
      cuisines: (a.querySelector('h3 + p')?.textContent ?? '').trim(),
      href: a.getAttribute('href') ?? '',
    })),
  )
}

// Waits until the list has stopped changing (two equal reads in a row), then returns it.
async function settledNames(page: Page): Promise<string[]> {
  let last: string[] | null = null
  let current: string[] = []
  await expect
    .poll(
      async () => {
        await page.waitForTimeout(300)
        current = await cardNames(page)
        const stable = last !== null && JSON.stringify(last) === JSON.stringify(current)
        last = current
        return stable
      },
      { timeout: 10_000 },
    )
    .toBe(true)
  return current
}

async function openHome(page: Page): Promise<string[]> {
  await page.goto('/')
  await expect(restaurantCards(page).first()).toBeVisible()
  await expect(restaurantCards(page)).toHaveCount(5)
  return cardNames(page)
}

test.describe('FD-02 · Search and filter', () => {
  test('FD-02.1 · Search finds by restaurant name or dish name', async ({ page }) => {
    // spec: "The search box finds restaurants by **restaurant name** or by **dish name**. *"Classic Beef"* finds the restaurant that serves the Classic Beef Burger."
    // 1. Go to `/`.
    await openHome(page)
    // 2. Search a dish name.
    await searchBox(page).fill('Classic Beef')
    // 3-4. Burger Palace (serves the Classic Beef Burger) is in the list.
    await expect(card(page, 'Burger Palace')).toBeVisible()
    // 5. Search a restaurant name.
    await searchBox(page).fill('')
    await searchBox(page).fill('Sushi Masters')
    // 6. Sushi Masters is shown, Pizza Corner is not.
    await expect(card(page, 'Sushi Masters')).toBeVisible()
    await expect(card(page, 'Pizza Corner')).toHaveCount(0)
  })

  test('FD-02.2 · Search ignores upper and lower case', async ({ page }) => {
    // spec: "Search ignores upper and lower case: *burger* and *BURGER* give the same result."
    // 1. Go to `/`.
    await openHome(page)
    // 2. Lower case.
    await searchBox(page).fill('burger')
    const lower = await settledNames(page)
    // 3. Upper case.
    await searchBox(page).fill('')
    await searchBox(page).fill('BURGER')
    const upper = await settledNames(page)
    // 4. Same result, not empty.
    expect(lower.length, 'burger gives a non-empty list').toBeGreaterThan(0)
    expect(upper).toEqual(lower)
    // 5. Extra pair on a dish name.
    await searchBox(page).fill('classic beef')
    const dishLower = await settledNames(page)
    await searchBox(page).fill('CLASSIC BEEF')
    const dishUpper = await settledNames(page)
    expect(dishLower.length, 'classic beef gives a non-empty list').toBeGreaterThan(0)
    expect(dishUpper).toEqual(dishLower)
  })

  test('FD-02.3 · Results update while typing; Search button gives the same result', async ({ page }) => {
    // spec: "Results update while the customer types; pressing **Search** gives the same result."
    // 1. Go to `/`, store the 5 cards.
    const baseline = await openHome(page)
    // 2. Type key by key, no Enter, no Search click.
    await searchBox(page).click()
    await searchBox(page).pressSequentially('burger', { delay: 80 })
    // 3. List changed without a button press.
    await expect.poll(() => cardNames(page)).not.toEqual(baseline)
    const typedResult = await settledNames(page)
    expect(typedResult.length).toBeLessThan(baseline.length)
    // 4. Click Search.
    await page.getByRole('button', { name: 'Search', exact: true }).click()
    // 5. Same result.
    const buttonResult = await settledNames(page)
    expect(buttonResult).toEqual(typedResult)
  })

  test('FD-02.4 · Cuisine chips show only that cuisine; All shows every restaurant', async ({ page }) => {
    // spec: "The cuisine chips (**All**, **Pizza**, **Burgers**, **Sushi**, **Italian**, **Mediterranean**) show only restaurants serving that cuisine. **All** shows every restaurant. Not every cuisine has a chip; **All** is the only view guaranteed to show every restaurant."
    // 1. Baseline.
    await page.goto('/')
    await expect(restaurantCards(page)).toHaveCount(5)
    const baselineCards = await shownCards(page)
    const baseline = baselineCards.map((c) => c.name)

    // 2. Chips visible.
    for (const name of ['All', 'Pizza', 'Burgers', 'Sushi', 'Italian', 'Mediterranean']) {
      await expect(chip(page, name)).toBeVisible()
    }

    // 3. Each cuisine chip.
    for (const cuisine of ['Pizza', 'Burgers', 'Sushi', 'Italian', 'Mediterranean']) {
      await chip(page, cuisine).click()
      await expect(restaurantCards(page).first()).toBeVisible()
      await settledNames(page)
      const shown = await shownCards(page)
      expect(shown.length, `${cuisine}: at least one card`).toBeGreaterThan(0)
      for (const c of shown) {
        expect(c.cuisines.split(', '), `${cuisine}: ${c.name} lists ${cuisine}`).toContain(cuisine)
      }
      const excluded = baselineCards.filter((c) => !c.cuisines.split(', ').includes(cuisine)).map((c) => c.name)
      for (const name of excluded) {
        await expect(card(page, name), `${cuisine}: ${name} is not shown`).toHaveCount(0)
      }
    }

    // 4. All.
    await chip(page, 'All').click()
    // 5. All 5 restaurants, including Koliba u Jána (no chip for Slovak).
    await expect(restaurantCards(page)).toHaveCount(baseline.length)
    expect(await settledNames(page)).toEqual(baseline)
    await expect(card(page, 'Koliba u Jána')).toBeVisible()
  })

  test('FD-02.5 · Search and cuisine chip apply together', async ({ page }) => {
    // spec: "A search and a selected cuisine chip apply **together**: with **Pizza** selected, searching *burger* shows only restaurants that match both."
    // Every shown card lists Pizza and its page (name or menu) contains "burger". Empty state is acceptable.
    async function checkBoth(label: string) {
      await settledNames(page)
      const shown = await shownCards(page)
      for (const c of shown) {
        expect(c.cuisines.split(', '), `${label}: ${c.name} lists Pizza`).toContain('Pizza')
        const detail = await page.context().newPage()
        await detail.goto(c.href)
        await expect(detail.getByRole('heading', { level: 1 })).toBeVisible()
        expect(await detail.locator('body').innerText(), `${label}: ${c.name} matches burger`).toMatch(/burger/i)
        await detail.close()
      }
      await expect(card(page, 'Burger Palace'), `${label}: Burger Palace is not shown`).toHaveCount(0)
    }

    // 1-3. Chip first, then search.
    await openHome(page)
    await chip(page, 'Pizza').click()
    await searchBox(page).fill('burger')
    // 4-6.
    await checkBoth('Pizza then burger')

    // 8. Reverse order: search first, then chip.
    await openHome(page)
    await searchBox(page).fill('burger')
    await settledNames(page)
    await chip(page, 'Pizza').click()
    await checkBoth('burger then Pizza')
  })

  test('FD-02.6 · No match shows No restaurants found with a hint', async ({ page }) => {
    // spec: "When nothing matches, the page says so — *No restaurants found* — with a hint to try another search or filter."
    // 1. Go to `/`.
    await openHome(page)
    // 2. Term with no match.
    await searchBox(page).fill('zzzqqq')
    // 3. No restaurant card.
    await expect(restaurantCards(page)).toHaveCount(0)
    // 4. No restaurants found.
    await expect(popularSection(page).getByText('No restaurants found')).toBeVisible()
    // 5. Hint mentions search and filter.
    await expect(popularSection(page).getByText(/(?=.*search)(?=.*filter)/i)).toBeVisible()
  })
})
