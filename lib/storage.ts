// Local storage management for data persistence

const STORAGE_KEYS = {
  USER: "sales_app_user",
  PRODUCTS: "sales_app_products",
  CUSTOMERS: "sales_app_customers",
  SALES: "sales_app_sales",
  STORES: "sales_app_stores",
  ACTIVE_STORE: "sales_app_active_store",
  USERS: "sales_app_users",
}

export const storage = {
  // User authentication
  getUser: () => {
    if (typeof window === "undefined") return null
    const user = localStorage.getItem(STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  },

  setUser: (user: any) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  },

  clearUser: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.USER)
  },

  // Products
  getProducts: () => {
    if (typeof window === "undefined") return []
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    return products ? JSON.parse(products) : []
  },

  setProducts: (products: any[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products))
  },

  // Products with store filtering
  getProductsByStore: (storeId: string) => {
    if (typeof window === "undefined") return []
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    const allProducts = products ? JSON.parse(products) : []
    return allProducts.filter((p: any) => p.storeId === storeId)
  },

  // Get single product with store validation
  getProductById: (productId: string, storeId: string) => {
    if (typeof window === "undefined") return null
    const products = localStorage.getItem(STORAGE_KEYS.PRODUCTS)
    const allProducts = products ? JSON.parse(products) : []
    return allProducts.find((p: any) => p.id === productId && p.storeId === storeId) || null
  },

  // Customers
  getCustomers: () => {
    if (typeof window === "undefined") return []
    const customers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
    return customers ? JSON.parse(customers) : []
  },

  setCustomers: (customers: any[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
  },

  // Customers with store filtering
  getCustomersByStore: (storeId: string) => {
    if (typeof window === "undefined") return []
    const customers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
    const allCustomers = customers ? JSON.parse(customers) : []
    return allCustomers.filter((c: any) => c.storeId === storeId)
  },

  // Get single customer with store validation
  getCustomerById: (customerId: string, storeId: string) => {
    if (typeof window === "undefined") return null
    const customers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
    const allCustomers = customers ? JSON.parse(customers) : []
    return allCustomers.find((c: any) => c.id === customerId && c.storeId === storeId) || null
  },

  // Sales
  getSales: () => {
    if (typeof window === "undefined") return []
    const sales = localStorage.getItem(STORAGE_KEYS.SALES)
    return sales ? JSON.parse(sales) : []
  },

  setSales: (sales: any[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales))
  },

  // Sales with store filtering
  getSalesByStore: (storeId: string) => {
    if (typeof window === "undefined") return []
    const sales = localStorage.getItem(STORAGE_KEYS.SALES)
    const allSales = sales ? JSON.parse(sales) : []
    return allSales.filter((s: any) => s.storeId === storeId)
  },

  // Get single sale with store validation
  getSaleById: (saleId: string, storeId: string) => {
    if (typeof window === "undefined") return null
    const sales = localStorage.getItem(STORAGE_KEYS.SALES)
    const allSales = sales ? JSON.parse(sales) : []
    return allSales.find((s: any) => s.id === saleId && s.storeId === storeId) || null
  },

  // Stores management
  getStores: () => {
    if (typeof window === "undefined") return []
    const stores = localStorage.getItem(STORAGE_KEYS.STORES)
    return stores ? JSON.parse(stores) : []
  },

  setStores: (stores: any[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores))
  },

  // Active store management
  getActiveStore: () => {
    if (typeof window === "undefined") return null
    const store = localStorage.getItem(STORAGE_KEYS.ACTIVE_STORE)
    return store ? JSON.parse(store) : null
  },

  setActiveStore: (store: any) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.ACTIVE_STORE, JSON.stringify(store))
  },

  clearActiveStore: () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_STORE)
  },

  // Users management functions
  getUsers: () => {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  },

  setUsers: (users: any[]) => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  },

  getUserByEmail: (email: string) => {
    if (typeof window === "undefined") return null
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    const allUsers = users ? JSON.parse(users) : []
    return allUsers.find((u: any) => u.email === email) || null
  },

  getUsersByStore: (storeId: string) => {
    if (typeof window === "undefined") return []
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    const allUsers = users ? JSON.parse(users) : []
    return allUsers.filter((u: any) => u.storeId === storeId)
  },
}
