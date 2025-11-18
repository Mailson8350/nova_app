"use client"

import { storage } from "./storage"
import { seedProducts, seedCustomers } from "./seed-data"
import { generateReceiptCode } from "./receipt-utils"
import type { User } from "./types"

export function initializeData() {
  if (typeof window === "undefined") return

  const users = storage.getUsers()
  if (users.length === 0) {
    const superAdmin: User = {
      id: "super_admin",
      email: "admin@nova.com",
      password: "admin123",
      name: "Super Admin",
      role: "super_admin",
      createdAt: new Date().toISOString(),
    }
    storage.setUsers([superAdmin])
  }

  const activeStore = storage.getActiveStore()
  const storeId = activeStore?.id || "demo"

  // Initialize products if empty
  const products = storage.getProducts()
  if (products.length === 0 && activeStore) {
    const productsWithStore = seedProducts.map((p) => ({ ...p, storeId }))
    storage.setProducts(productsWithStore)
  }

  // Initialize customers if empty
  const customers = storage.getCustomers()
  if (customers.length === 0 && activeStore) {
    const customersWithStore = seedCustomers.map((c) => ({ ...c, storeId }))
    storage.setCustomers(customersWithStore)
  }

  const sales = storage.getSales()
  let updated = false
  const updatedSales = sales.map((sale) => {
    const needsUpdate = !sale.receiptCode || !sale.storeId
    if (needsUpdate) {
      updated = true
      return {
        ...sale,
        receiptCode: sale.receiptCode || generateReceiptCode(),
        storeId: sale.storeId || storeId,
      }
    }
    return sale
  })

  if (updated) {
    storage.setSales(updatedSales)
  }

  const productsNeedUpdate = products.some((p) => !p.storeId)
  if (productsNeedUpdate) {
    const updatedProducts = products.map((p) => ({
      ...p,
      storeId: p.storeId || storeId,
    }))
    storage.setProducts(updatedProducts)
  }

  const customersNeedUpdate = customers.some((c) => !c.storeId)
  if (customersNeedUpdate) {
    const updatedCustomers = customers.map((c) => ({
      ...c,
      storeId: c.storeId || storeId,
    }))
    storage.setCustomers(updatedCustomers)
  }
}
