// Access control utilities for store data isolation

import type { User, Store } from "./types"

export interface AccessControlContext {
  user: User | null
  activeStore: Store | null
}

// Check if user has access to a specific store
export function canAccessStore(user: User | null, storeId: string): boolean {
  if (!user) return false

  // Super admin can access all stores
  if (user.role === "super_admin") return true

  // Store owners can only access their own store
  return user.storeId === storeId
}

// Check if user can perform admin operations
export function isAdmin(user: User | null): boolean {
  if (!user) return false
  return user.role === "super_admin"
}

// Validate that a storeId matches the active store
export function validateStoreAccess(
  storeId: string,
  context: AccessControlContext,
): { valid: boolean; error?: string } {
  const { user, activeStore } = context

  if (!user) {
    return { valid: false, error: "Usuário não autenticado" }
  }

  if (!activeStore) {
    return { valid: false, error: "Nenhuma loja ativa selecionada" }
  }

  // Super admin can access any store
  if (user.role === "super_admin") {
    return { valid: true }
  }

  // Store owners must match their store
  if (storeId !== activeStore.id) {
    return { valid: false, error: "Acesso negado: você não tem permissão para acessar dados desta loja" }
  }

  return { valid: true }
}

// Ensure data being created/updated has correct storeId
export function enforceStoreId<T extends { storeId: string }>(
  data: T,
  context: AccessControlContext,
): { valid: boolean; error?: string; data?: T } {
  const { user, activeStore } = context

  if (!user || !activeStore) {
    return { valid: false, error: "Contexto de autenticação inválido" }
  }

  // Super admin can set any storeId
  if (user.role === "super_admin") {
    return { valid: true, data }
  }

  // For store owners, enforce their storeId
  if (data.storeId !== activeStore.id) {
    return {
      valid: false,
      error: "Acesso negado: você só pode criar/modificar dados da sua loja",
    }
  }

  return { valid: true, data }
}

// Check if user can modify a specific record
export function canModifyRecord(recordStoreId: string, context: AccessControlContext): boolean {
  const { user, activeStore } = context

  if (!user) return false

  // Super admin can modify anything
  if (user.role === "super_admin") return true

  // Store owners can only modify their own store's records
  return activeStore?.id === recordStoreId
}

// Check if user can delete a specific record
export function canDeleteRecord(recordStoreId: string, context: AccessControlContext): boolean {
  // Same rules as modify for now
  return canModifyRecord(recordStoreId, context)
}

// Validate that user has required role
export function hasRole(user: User | null, roles: User["role"][]): boolean {
  if (!user) return false
  return roles.includes(user.role)
}
