"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StoreFormDialog } from "@/components/store-form-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { storage } from "@/lib/storage"
import { isStoreAccessible, getExpirationStatus } from "@/lib/store-utils"
import { getAllStoresStats, type StoreStats } from "@/lib/store-stats"
import { formatCurrency, formatDate } from "@/lib/dashboard-utils"
import type { Store, User } from "@/lib/types"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  StoreIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserIcon,
  Eye,
  EyeOff,
  TrendingUp,
  ShoppingCart,
  Package,
  UsersIcon,
  Clock,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState<Store | undefined>()
  const [deleteStore, setDeleteStore] = useState<Store | null>(null)
  const [showCredentials, setShowCredentials] = useState<string | null>(null)
  const [storeOwners, setStoreOwners] = useState<Record<string, User>>({})
  const [storeStats, setStoreStats] = useState<Record<string, StoreStats>>({})

  useEffect(() => {
    loadStores()
    loadStoreOwners()
    loadStoreStats()
  }, [])

  const loadStores = () => {
    const loadedStores = storage.getStores()
    setStores(loadedStores)
  }

  const loadStoreOwners = () => {
    const users = storage.getUsers()
    const owners: Record<string, User> = {}
    users.forEach((user: User) => {
      if (user.role === "store_owner" && user.storeId) {
        owners[user.storeId] = user
      }
    })
    setStoreOwners(owners)
  }

  const loadStoreStats = () => {
    const stats = getAllStoresStats()
    setStoreStats(stats)
  }

  const handleCreateStore = (
    storeData: Omit<Store, "id" | "createdAt" | "updatedAt">,
    ownerData?: { name: string; email: string; password: string },
  ) => {
    const newStore: Store = {
      ...storeData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedStores = [...stores, newStore]
    storage.setStores(updatedStores)
    setStores(updatedStores)

    if (ownerData) {
      const users = storage.getUsers()
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: ownerData.email,
        password: ownerData.password,
        name: ownerData.name,
        role: "store_owner",
        storeId: newStore.id,
        createdAt: new Date().toISOString(),
      }
      storage.setUsers([...users, newUser])
      loadStoreOwners()
    }

    loadStoreStats()
    setShowForm(false)
  }

  const handleUpdateStore = (storeData: Omit<Store, "id" | "createdAt" | "updatedAt">) => {
    if (!editingStore) return

    const updatedStore: Store = {
      ...editingStore,
      ...storeData,
      updatedAt: new Date().toISOString(),
    }

    const updatedStores = stores.map((s) => (s.id === editingStore.id ? updatedStore : s))
    storage.setStores(updatedStores)
    setStores(updatedStores)
    setEditingStore(undefined)
  }

  const handleDeleteStore = () => {
    if (!deleteStore) return

    const updatedStores = stores.filter((s) => s.id !== deleteStore.id)
    storage.setStores(updatedStores)
    setStores(updatedStores)

    const users = storage.getUsers()
    const updatedUsers = users.filter((u: User) => u.storeId !== deleteStore.id)
    storage.setUsers(updatedUsers)

    setDeleteStore(null)
    loadStoreOwners()
    loadStoreStats()
  }

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeStores = stores.filter((s) => isStoreAccessible(s)).length
  const blockedStores = stores.filter((s) => !s.isActive).length
  const expiredStores = stores.filter((s) => {
    const status = getExpirationStatus(s)
    return status.status === "expired"
  }).length

  const totalRevenue = Object.values(storeStats).reduce((sum, stats) => sum + stats.totalRevenue, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Gestão de Lojas
        </h1>
        <p className="text-muted-foreground">Gerencie todas as lojas do sistema</p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Lojas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-background to-green-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lojas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeStores}</div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-background to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Receita Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-gradient-to-br from-background to-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lojas Bloqueadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{blockedStores}</div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-gradient-to-br from-background to-red-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lojas Expiradas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{expiredStores}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Loja
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map((store) => {
          const accessible = isStoreAccessible(store)
          const expirationStatus = getExpirationStatus(store)
          const owner = storeOwners[store.id]
          const stats = storeStats[store.id]

          return (
            <Card key={store.id} className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <StoreIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {store.email}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingStore(store)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteStore(store)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Receita
                      </div>
                      <div className="text-sm font-bold text-accent">{formatCurrency(stats.totalRevenue)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Vendas
                      </div>
                      <div className="text-sm font-bold">{stats.totalSales}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Package className="h-3.5 w-3.5" />
                        Produtos
                      </div>
                      <div className="text-sm font-bold">{stats.totalProducts}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UsersIcon className="h-3.5 w-3.5" />
                        Clientes
                      </div>
                      <div className="text-sm font-bold">{stats.totalCustomers}</div>
                    </div>
                  </div>
                )}

                {stats?.lastActivity && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded bg-muted/30">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Última atividade: {formatDate(stats.lastActivity)}</span>
                  </div>
                )}

                {store.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {store.phone}
                  </div>
                )}
                {store.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {store.address}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {expirationStatus.message}
                </div>

                {owner && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <UserIcon className="h-4 w-4" />
                        Credenciais de Acesso
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCredentials(showCredentials === store.id ? null : store.id)}
                      >
                        {showCredentials === store.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {showCredentials === store.id && (
                      <Alert className="mt-2">
                        <AlertDescription className="space-y-1 text-xs">
                          <div>
                            <strong>Nome:</strong> {owner.name}
                          </div>
                          <div>
                            <strong>Email:</strong> {owner.email}
                          </div>
                          <div>
                            <strong>Senha:</strong> {owner.password}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Badge variant={accessible ? "default" : "destructive"}>
                    {accessible ? "Acessível" : "Bloqueado"}
                  </Badge>
                  {expirationStatus.status === "expiring_soon" && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      Expirando
                    </Badge>
                  )}
                  {expirationStatus.status === "expired" && (
                    <Badge variant="outline" className="border-red-500 text-red-600">
                      Expirado
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredStores.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <StoreIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhuma loja encontrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Tente ajustar sua busca" : "Comece criando sua primeira loja"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Loja
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <StoreFormDialog
        open={showForm || !!editingStore}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingStore(undefined)
          }
        }}
        onSubmit={editingStore ? handleUpdateStore : handleCreateStore}
        store={editingStore}
      />

      <DeleteConfirmDialog
        open={!!deleteStore}
        onOpenChange={(open) => !open && setDeleteStore(null)}
        onConfirm={handleDeleteStore}
        title="Excluir Loja"
        description={`Tem certeza que deseja excluir a loja "${deleteStore?.name}"? Esta ação não pode ser desfeita e todos os dados da loja serão perdidos.`}
      />
    </div>
  )
}
