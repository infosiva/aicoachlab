const ANON_LIMIT  = 3
const FREE_LIMIT  = 10
const STORAGE_KEY = 'acl_topic_count'
const USER_KEY    = 'acl_user_id'

export interface GateStatus {
  allowed: boolean
  used: number
  limit: number
  needsSignup: boolean
  needsUpgrade: boolean
}

export function checkGate(): GateStatus {
  if (typeof window === 'undefined') {
    return { allowed: true, used: 0, limit: ANON_LIMIT, needsSignup: false, needsUpgrade: false }
  }
  const userId = localStorage.getItem(USER_KEY)
  const used = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)
  const isSignedIn = Boolean(userId)
  const limit = isSignedIn ? FREE_LIMIT : ANON_LIMIT
  return {
    allowed: used < limit,
    used,
    limit,
    needsSignup: !isSignedIn && used >= ANON_LIMIT,
    needsUpgrade: isSignedIn && used >= FREE_LIMIT,
  }
}

export function recordTopicUse(): void {
  if (typeof window === 'undefined') return
  const used = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)
  localStorage.setItem(STORAGE_KEY, String(used + 1))
}

export function onSignupComplete(userId: string): void {
  localStorage.setItem(USER_KEY, userId)
  localStorage.setItem(STORAGE_KEY, '0')
}
