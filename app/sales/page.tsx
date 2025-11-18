"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency, formatDate } from "@/lib/dashboard-utils"
import type { Sale } from "@/lib/types"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filter, setFilter] = useState<"all" | "completed" | "cancelled">("all")
  const { activeStore } = useAuth()

  useEffect(() => {
    loadSales()
  }, [activeStore])

  const loadSales = () => {
    if (activeStore) {
      const storeSales = storage.getSalesByStore(activeStore.id)
      const sortedSales = storeSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setSales(sortedSales)
    }
  }

  const filteredSales = sales.filter((sale) => {
    if (filter === "all") return true
    return sale.status === filter
  })

  const getStatusColor = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 border-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-700 border-red-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20"
      default:
        return ""
    }
  }

  const getStatusLabel = (status: Sale["status"]) => {
    switch (status) {
      case "completed":
        return "Concluída"
      case "cancelled":
        return "Cancelada"
      case "pending":
        return "Pendente"
      default:
        return status
    }
  }

  const getPaymentMethodLabel = (method: Sale["paymentMethod"]) => {
    switch (method) {
      case "cash":
        return "Dinheiro"
      case "credit":
        return "Crédito"
      case "debit":
        return "Débito"
      case "pix":
        return "PIX"
      default:
        return method
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vendas</h1>
            <p className="text-muted-foreground mt-1">Histórico e gerenciamento de vendas</p>
          </div>
          <Link href="/sales/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Venda
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className="whitespace-nowrap"
              >
                Todas
              </Button>
              <Button
                variant={filter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("completed")}
                className="whitespace-nowrap"
              >
                Concluídas
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("cancelled")}
                className="whitespace-nowrap"
              >
                Canceladas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales List */}
        {filteredSales.length > 0 ? (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card key={sale.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-mono text-sm text-muted-foreground">#{sale.id}</span>
                        <Badge className={getStatusColor(sale.status)}>{getStatusLabel(sale.status)}</Badge>
                        <Badge variant="outline">{getPaymentMethodLabel(sale.paymentMethod)}</Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Cliente</p>
                          <p className="font-medium">{sale.customerName || "Cliente avulso"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Vendedor</p>
                          <p className="font-medium">{sale.sellerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Data</p>
                          <p className="font-medium">{formatDate(sale.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-bold text-lg">{formatCurrency(sale.total)}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Itens ({sale.items.length})</p>
                        <div className="space-y-1">
                          {sale.items.map((item, index) => (
                            <p key={index} className="text-sm">
                              {item.quantity}x {item.productName} - {formatCurrency(item.total)}
                            </p>
                          ))}
                        </div>
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
              <h3 className="font-semibold text-lg mb-2">Nenhuma venda encontrada</h3>
              <p className="text-muted-foreground text-center mb-4">
                {filter !== "all" ? "Tente ajustar os filtros" : "Comece criando sua primeira venda"}
              </p>
              {filter === "all" && (
                <Link href="/sales/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Venda
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
