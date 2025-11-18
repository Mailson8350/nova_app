// Core data types for the sales management system

export interface Store {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  isActive: boolean
  expiresAt?: string // ISO date string - null means no expiration
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "super_admin" | "store_owner" | "manager" | "seller"
  storeId?: string // null for super_admin, required for others
  createdAt: string
}

export interface Product {
  id: string
  storeId: string
  name: string
  description: string
  sku: string
  price: number
  cost: number
  stock: number
  category: string
  image?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  storeId: string
  name: string
  email?: string
  phone?: string
  cpf?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  total: number
}

export interface Sale {
  id: string
  storeId: string
  receiptCode: string
  customerId?: string
  customerName?: string
  items: SaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: "cash" | "credit" | "debit" | "pix"
  status: "completed" | "cancelled" | "pending"
  sellerId: string
  sellerName: string
  notes?: string
  createdAt: string
}

export interface DashboardStats {
  totalSales: number
  totalRevenue: number
  totalProfit: number
  totalCustomers: number
  totalProducts: number
  lowStockProducts: number
  salesByDay: { date: string; total: number; count: number }[]
  topProducts: { productId: string; name: string; quantity: number; revenue: number }[]
  salesByPaymentMethod: { method: string; total: number; count: number }[]
}
