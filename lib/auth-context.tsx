"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, Store } from "./types"
import { storage } from "./storage"
import { isStoreAccessible } from "./store-utils"

interface AuthContextType {
  user: User | null
  activeStore: Store | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setActiveStore: (store: Store | null) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [activeStore, setActiveStoreState] = useState<Store | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = storage.getUser()
    const savedStore = storage.getActiveStore()

    if (savedUser) {
      setUser(savedUser)

      if (savedUser.role !== "super_admin" && savedStore) {
        if (isStoreAccessible(savedStore)) {
          setActiveStoreState(savedStore)
        } else {
          storage.clearActiveStore()
        }
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: "Email e senha são obrigatórios" }
    }

    if (email === "admin@nova.com" && password === "admin123") {
      const superAdmin: User = {
        id: "super_admin",
        email,
        password: "admin123",
        name: "Super Admin",
        role: "super_admin",
        createdAt: new Date().toISOString(),
      }
      setUser(superAdmin)
      storage.setUser(superAdmin)
      return { success: true }
    }

    const users = storage.getUsers()
    const foundUser = users.find((u: User) => u.email === email && u.password === password)

    if (!foundUser) {
      return { success: false, error: "Email ou senha inválidos" }
    }

    if (foundUser.role === "store_owner" && foundUser.storeId) {
      const stores = storage.getStores()
      const store = stores.find((s) => s.id === foundUser.storeId)

      if (!store) {
        return { success: false, error: "Loja não encontrada" }
      }

      if (!isStoreAccessible(store)) {
        if (!store.isActive) {
          return { success: false, error: "Esta loja está bloqueada. Entre em contato com o administrador." }
        }
        return { success: false, error: "O acesso desta loja expirou. Entre em contato com o administrador." }
      }

      setUser(foundUser)
      setActiveStoreState(store)
      storage.setUser(foundUser)
      storage.setActiveStore(store)

      return { success: true }
    }

    setUser(foundUser)
    storage.setUser(foundUser)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setActiveStoreState(null)
    storage.clearUser()
    storage.clearActiveStore()
  }

  const setActiveStore = (store: Store | null) => {
    setActiveStoreState(store)
    if (store) {
      storage.setActiveStore(store)
    } else {
      storage.clearActiveStore()
    }
  }

  return (
    <AuthContext.Provider value={{ user, activeStore, login, logout, setActiveStore, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
