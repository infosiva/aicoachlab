export type PromoEntry = { code: string; daysUnlocked: number; feature: string }

export function getPromoCodes(): PromoEntry[] {
  try { return JSON.parse(process.env.PROMO_CODES ?? '[]') } catch { return [] }
}

export function validatePromoCode(input: string): PromoEntry | null {
  const codes = getPromoCodes()
  return codes.find(c => c.code.toLowerCase() === input.trim().toLowerCase()) ?? null
}

// Cross-project fallback: hub's centrally admin-managed access codes.
// Checked only when no local PROMO_CODES match — keeps aicoachlab working
// even if hub is unreachable.
export async function validateHubAccessCode(input: string): Promise<PromoEntry | null> {
  const hubUrl = process.env.HUB_URL ?? 'https://ai-products-hub.vercel.app'
  try {
    const res = await fetch(`${hubUrl}/api/access-codes/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: input.trim(), project: 'aicoachlab' }),
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.valid) return null
    return { code: input.trim(), daysUnlocked: data.daysUnlocked, feature: data.feature }
  } catch {
    return null
  }
}
