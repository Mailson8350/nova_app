import type { Sale, Product, Customer, DashboardStats } from "./types"

export function calculateDashboardStats(sales: Sale[], products: Product[], customers: Customer[]): DashboardStats {
  // Filter completed sales
  const completedSales = sales.filter((s) => s.status === "completed")

  // Total sales count
  const totalSales = completedSales.length

  // Total revenue
  const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0)

  // Total profit (revenue - cost)
  const totalProfit = completedSales.reduce((sum, sale) => {
    const profit = sale.items.reduce((itemSum, item) => {
      const product = products.find((p) => p.id === item.productId)
      const cost = product ? product.cost * item.quantity : 0
      return itemSum + (item.total - cost)
    }, 0)
    return sum + profit
  }, 0)

  // Low stock products (stock < 10)
  const lowStockProducts = products.filter((p) => p.stock < 10 && p.active).length

  // Sales by day (last 7 days)
  const salesByDay = getLast7DaysSales(completedSales)

  // Top products
  const topProducts = getTopProducts(completedSales, products)

  // Sales by payment method
  const salesByPaymentMethod = getSalesByPaymentMethod(completedSales)

  return {
    totalSales,
    totalRevenue,
    totalProfit,
    totalCustomers: customers.length,
    totalProducts: products.filter((p) => p.active).length,
    lowStockProducts,
    salesByDay,
    topProducts,
    salesByPaymentMethod,
  }
}

function getLast7DaysSales(sales: Sale[]) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split("T")[0]
  })

  return last7Days.map((date) => {
    const daySales = sales.filter((s) => s.createdAt.startsWith(date))
    return {
      date,
      total: daySales.reduce((sum, s) => sum + s.total, 0),
      count: daySales.length,
    }
  })
}

function getTopProducts(sales: Sale[], products: Product[]) {
  const productStats = new Map<string, { name: string; quantity: number; revenue: number }>()

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const existing = productStats.get(item.productId)
      if (existing) {
        existing.quantity += item.quantity
        existing.revenue += item.total
      } else {
        productStats.set(item.productId, {
          name: item.productName,
          quantity: item.quantity,
          revenue: item.total,
        })
      }
    })
  })

  return Array.from(productStats.entries())
    .map(([productId, stats]) => ({
      productId,
      ...stats,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

function getSalesByPaymentMethod(sales: Sale[]) {
  const methods = new Map<string, { total: number; count: number }>()

  sales.forEach((sale) => {
    const existing = methods.get(sale.paymentMethod)
    if (existing) {
      existing.total += sale.total
      existing.count += 1
    } else {
      methods.set(sale.paymentMethod, { total: sale.total, count: 1 })
    }
  })

  return Array.from(methods.entries()).map(([method, stats]) => ({
    method,
    ...stats,
  }))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date))
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date))
}
