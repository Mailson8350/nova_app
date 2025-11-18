"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency } from "@/lib/dashboard-utils"
import { generateReceiptCode } from "@/lib/receipt-utils"
import { enforceStoreId } from "@/lib/access-control"
import type { Product, Customer, Sale, SaleItem } from "@/lib/types"
import { Search, Trash2, ShoppingCart, X } from "lucide-react"

export default function NewSalePage() {
  const router = useRouter()
  const { user, activeStore } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<Sale["paymentMethod"]>("cash")
  const [notes, setNotes] = useState("")
  const [cart, setCart] = useState<SaleItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [globalDiscount, setGlobalDiscount] = useState(0)

  useEffect(() => {
    if (activeStore) {
      const storeProducts = storage.getProductsByStore(activeStore.id)
      setProducts(storeProducts.filter((p) => p.active))

      const storeCustomers = storage.getCustomersByStore(activeStore.id)
      setCustomers(storeCustomers)
    }
  }, [activeStore])

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearch.toLowerCase()),
    )
  }, [products, productSearch])

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id)

    if (existingItem) {
      // Check stock
      if (existingItem.quantity >= product.stock) {
        alert("Estoque insuficiente")
        return
      }

      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        ),
      )
    } else {
      if (product.stock < 1) {
        alert("Produto sem estoque")
        return
      }

      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.price,
          discount: 0,
          total: product.price,
        },
      ])
    }
    setProductSearch("")
  }

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (quantity > product.stock) {
      alert("Estoque insuficiente")
      return
    }

    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(
      cart.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.unitPrice - item.discount,
            }
          : item,
      ),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() - globalDiscount
  }

  const handleSubmit = () => {
    if (!activeStore || !user) return
    if (cart.length === 0) {
      alert("Adicione pelo menos um item à venda")
      return
    }

    const newSale: Sale = {
      id: Date.now().toString(),
      storeId: activeStore.id,
      receiptCode: generateReceiptCode(),
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      items: cart,
      subtotal: calculateSubtotal(),
      discount: globalDiscount,
      total: calculateTotal(),
      paymentMethod,
      status: "completed",
      sellerId: user.id,
      sellerName: user.name,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    }

    const accessCheck = enforceStoreId(newSale, { user, activeStore })
    if (!accessCheck.valid) {
      console.error("[v0] Access denied:", accessCheck.error)
      alert(accessCheck.error)
      return
    }

    // Save sale
    const sales = storage.getSales()
    storage.setSales([...sales, newSale])

    // Update product stock
    const allProducts = storage.getProducts()
    const updatedProducts = allProducts.map((product) => {
      const cartItem = cart.find((item) => item.productId === product.id)
      if (cartItem && product.storeId === activeStore.id) {
        return {
          ...product,
          stock: product.stock - cartItem.quantity,
          updatedAt: new Date().toISOString(),
        }
      }
      return product
    })
    storage.setProducts(updatedProducts)

    alert("Venda realizada com sucesso!")
    router.push(`/receipts/${newSale.id}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Nova Venda</h1>
            <p className="text-muted-foreground mt-1">Ponto de Venda (PDV)</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/sales")}>
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Product Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Search */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Produtos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produtos por nome ou SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {productSearch && (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => addToCart(product)}
                          className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.sku} • Estoque: {product.stock}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="font-semibold">{formatCurrency(product.price)}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">Nenhum produto encontrado</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cart */}
            <Card>
              <CardHeader>
                <CardTitle>Carrinho ({cart.length} itens)</CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length > 0 ? (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">{formatCurrency(item.unitPrice)} cada</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantity(item.productId, Number.parseInt(e.target.value))}
                            className="w-16 h-8 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right min-w-[80px]">
                          <p className="font-semibold">{formatCurrency(item.total)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.productId)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Carrinho vazio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sale Details */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes da Venda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Cliente (opcional)</Label>
                  <Select
                    value={selectedCustomer?.id || "none"}
                    onValueChange={(value) =>
                      setSelectedCustomer(value === "none" ? null : customers.find((c) => c.id === value) || null)
                    }
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Cliente avulso</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Forma de Pagamento</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as Sale["paymentMethod"])}
                  >
                    <SelectTrigger id="payment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount">Desconto Global (XOF)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="1"
                    min="0"
                    max={calculateSubtotal()}
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(Number.parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Observações sobre a venda..."
                  />
                </div>

                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  {globalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Desconto Global:</span>
                      <span className="text-red-600">-{formatCurrency(globalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full" size="lg" disabled={cart.length === 0}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Finalizar Venda
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
