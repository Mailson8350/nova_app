import { storage } from "./storage"

export interface StoreStats {
  storeId: string
  totalRevenue: number
  totalSales: number
  totalProducts: number
  totalCustomers: number
  lastActivity: string | null
}

export function calculateStoreStats(storeId: string): StoreStats {
  const sales = storage.getSales().filter((s) => s.storeId === storeId && s.status === "completed")
  const products = storage.getProducts().filter((p) => p.storeId === storeId && p.active)
  const customers = storage.getCustomers().filter((c) => c.storeId === storeId)

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = sales.length

  // Find last activity (most recent sale)
  const lastActivity =
    sales.length > 0 ? sales.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].createdAt : null

  return {
    storeId,
    totalRevenue,
    totalSales,
    totalProducts: products.length,
    totalCustomers: customers.length,
    lastActivity,
  }
}

export function getAllStoresStats(): Record<string, StoreStats> {
  const stores = storage.getStores()
  const stats: Record<string, StoreStats> = {}

  stores.forEach((store) => {
    stats[store.id] = calculateStoreStats(store.id)
  })

  return stats
}
