import type { Store } from "./types"

// Check if a store is accessible (active and not expired)
export function isStoreAccessible(store: Store): boolean {
  if (!store.isActive) {
    return false
  }

  if (store.expiresAt) {
    const expirationDate = new Date(store.expiresAt)
    const now = new Date()
    if (now > expirationDate) {
      return false
    }
  }

  return true
}

// Get days until expiration
export function getDaysUntilExpiration(store: Store): number | null {
  if (!store.expiresAt) {
    return null
  }

  const expirationDate = new Date(store.expiresAt)
  const now = new Date()
  const diffTime = expirationDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

// Format expiration status
export function getExpirationStatus(store: Store): {
  status: "active" | "expiring_soon" | "expired" | "unlimited"
  message: string
} {
  if (!store.expiresAt) {
    return { status: "unlimited", message: "Sem data de expiração" }
  }

  const days = getDaysUntilExpiration(store)

  if (days === null) {
    return { status: "unlimited", message: "Sem data de expiração" }
  }

  if (days < 0) {
    return { status: "expired", message: "Expirado" }
  }

  if (days <= 7) {
    return { status: "expiring_soon", message: `Expira em ${days} dia${days !== 1 ? "s" : ""}` }
  }

  return { status: "active", message: `Expira em ${days} dias` }
}
