"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductFormDialog } from "@/components/product-form-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import { formatCurrency } from "@/lib/dashboard-utils"
import { useAuth } from "@/lib/auth-context"
import { validateStoreAccess, enforceStoreId } from "@/lib/access-control"
import type { Product } from "@/lib/types"
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const { activeStore, user } = useAuth()

  useEffect(() => {
    loadProducts()
  }, [activeStore])

  const loadProducts = () => {
    if (activeStore) {
      const storeProducts = storage.getProductsByStore(activeStore.id)
      setProducts(storeProducts)
    }
  }

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category))
    return ["all", ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [products, searchTerm, selectedCategory])

  const handleSaveProduct = (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (!activeStore || !user) return

    const accessCheck = enforceStoreId({ ...productData, storeId: activeStore.id }, { user, activeStore })
    if (!accessCheck.valid) {
      console.error("[v0] Access denied:", accessCheck.error)
      return
    }

    const allProducts = storage.getProducts()

    if (editingProduct) {
      const validation = validateStoreAccess(editingProduct.storeId, { user, activeStore })
      if (!validation.valid) {
        console.error("[v0] Cannot modify product:", validation.error)
        return
      }

      const updatedProducts = allProducts.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              ...productData,
              storeId: activeStore.id, // Enforce correct storeId
              updatedAt: new Date().toISOString(),
            }
          : p,
      )
      storage.setProducts(updatedProducts)
      loadProducts()
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(),
        storeId: activeStore.id, // Enforce correct storeId
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const updatedProducts = [...allProducts, newProduct]
      storage.setProducts(updatedProducts)
      loadProducts()
    }
    setEditingProduct(null)
  }

  const handleDeleteProduct = () => {
    if (deletingProduct && activeStore && user) {
      const validation = validateStoreAccess(deletingProduct.storeId, { user, activeStore })
      if (!validation.valid) {
        console.error("[v0] Cannot delete product:", validation.error)
        return
      }

      const allProducts = storage.getProducts()
      const updatedProducts = allProducts.filter((p) => p.id !== deletingProduct.id)
      storage.setProducts(updatedProducts)
      loadProducts()
      setDeletingProduct(null)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingProduct(null)
    setDialogOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setDeletingProduct(product)
    setDeleteDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Produtos</h1>
            <p className="text-muted-foreground mt-1">Gerencie seu catálogo de produtos</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category === "all" ? "Todas" : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.sku}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(product)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      {!product.active && <Badge variant="outline">Inativo</Badge>}
                      {product.stock < 10 && product.active && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Estoque baixo
                        </Badge>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Preço:</span>
                        <span className="font-semibold">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Custo:</span>
                        <span>{formatCurrency(product.cost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Margem:</span>
                        <span className="text-green-600 font-medium">
                          {(((product.price - product.cost) / product.price) * 100 || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Estoque:</span>
                        <span className="font-medium">{product.stock} un.</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || selectedCategory !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando seu primeiro produto"}
              </p>
              {!searchTerm && selectedCategory === "all" && (
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Produto
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteProduct}
        title="Excluir Produto"
        description={`Tem certeza que deseja excluir o produto "${deletingProduct?.name}"? Esta ação não pode ser desfeita.`}
      />
    </DashboardLayout>
  )
}
