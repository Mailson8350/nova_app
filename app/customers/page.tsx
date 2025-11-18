"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CustomerFormDialog } from "@/components/customer-form-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { storage } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"
import { validateStoreAccess, enforceStoreId } from "@/lib/access-control"
import type { Customer } from "@/lib/types"
import { Plus, Search, Edit, Trash2, Users, Mail, Phone, MapPin } from "lucide-react"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const { activeStore, user } = useAuth()

  useEffect(() => {
    loadCustomers()
  }, [activeStore])

  const loadCustomers = () => {
    if (activeStore) {
      const storeCustomers = storage.getCustomersByStore(activeStore.id)
      setCustomers(storeCustomers)
    }
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower) ||
        customer.cpf?.toLowerCase().includes(searchLower)
      )
    })
  }, [customers, searchTerm])

  const handleSaveCustomer = (customerData: Omit<Customer, "id" | "createdAt" | "updatedAt">) => {
    if (!activeStore || !user) return

    const accessCheck = enforceStoreId({ ...customerData, storeId: activeStore.id }, { user, activeStore })
    if (!accessCheck.valid) {
      console.error("[v0] Access denied:", accessCheck.error)
      return
    }

    const allCustomers = storage.getCustomers()

    if (editingCustomer) {
      const validation = validateStoreAccess(editingCustomer.storeId, { user, activeStore })
      if (!validation.valid) {
        console.error("[v0] Cannot modify customer:", validation.error)
        return
      }

      const updatedCustomers = allCustomers.map((c) =>
        c.id === editingCustomer.id
          ? {
              ...c,
              ...customerData,
              storeId: activeStore.id,
              updatedAt: new Date().toISOString(),
            }
          : c,
      )
      storage.setCustomers(updatedCustomers)
      loadCustomers()
    } else {
      const newCustomer: Customer = {
        ...customerData,
        id: Date.now().toString(),
        storeId: activeStore.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updatedCustomers = [...allCustomers, newCustomer]
      storage.setCustomers(updatedCustomers)
      loadCustomers()
    }
    setEditingCustomer(null)
  }

  const handleDeleteCustomer = () => {
    if (deletingCustomer && activeStore && user) {
      const validation = validateStoreAccess(deletingCustomer.storeId, { user, activeStore })
      if (!validation.valid) {
        console.error("[v0] Cannot delete customer:", validation.error)
        return
      }

      const allCustomers = storage.getCustomers()
      const updatedCustomers = allCustomers.filter((c) => c.id !== deletingCustomer.id)
      storage.setCustomers(updatedCustomers)
      loadCustomers()
      setDeletingCustomer(null)
    }
  }

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingCustomer(null)
    setDialogOpen(true)
  }

  const openDeleteDialog = (customer: Customer) => {
    setDeletingCustomer(customer)
    setDeleteDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground mt-1">Gerencie sua base de clientes</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes por nome, email, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        {filteredCustomers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{customer.name}</h3>
                      {customer.cpf && <p className="text-sm text-muted-foreground">{customer.cpf}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(customer)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    {(customer.city || customer.state) && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>
                          {customer.city}
                          {customer.city && customer.state && ", "}
                          {customer.state}
                        </span>
                      </div>
                    )}
                    {customer.notes && (
                      <p className="text-sm text-muted-foreground pt-2 border-t border-border line-clamp-2">
                        {customer.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Comece adicionando seu primeiro cliente"}
              </p>
              {!searchTerm && (
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editingCustomer}
        onSave={handleSaveCustomer}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteCustomer}
        title="Excluir Cliente"
        description={`Tem certeza que deseja excluir o cliente "${deletingCustomer?.name}"? Esta ação não pode ser desfeita.`}
      />
    </DashboardLayout>
  )
}
