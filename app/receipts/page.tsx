"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { storage } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"
import { formatCurrency } from "@/lib/dashboard-utils"
import { formatReceiptCode } from "@/lib/receipt-utils"
import type { Sale } from "@/lib/types"
import { Receipt, Search, Eye, Calendar, User, CreditCard } from "lucide-react"

export default function ReceiptsPage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { activeStore } = useAuth()

  useEffect(() => {
    if (activeStore) {
      const storeSales = storage.getSalesByStore(activeStore.id)
      setSales(storeSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    }
  }, [activeStore])

  const filteredSales = sales.filter(
    (sale) =>
      sale.receiptCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sellerName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPaymentMethodLabel = (method: Sale["paymentMethod"]) => {
    const labels = {
      cash: "Dinheiro",
      credit: "Crédito",
      debit: "Débito",
      pix: "PIX",
    }
    return labels[method]
  }

  const getStatusBadge = (status: Sale["status"]) => {
    const variants = {
      completed: "default",
      cancelled: "destructive",
      pending: "secondary",
    } as const

    const labels = {
      completed: "Concluída",
      cancelled: "Cancelada",
      pending: "Pendente",
    }

    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Recibos</h1>
            <p className="text-muted-foreground mt-1">Visualize e valide recibos de vendas</p>
          </div>
          <div className="flex items-center gap-2">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Buscar Recibo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código do recibo, cliente ou vendedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Receipt className="h-4 w-4 text-primary" />
                            <span className="font-mono font-semibold text-lg">
                              {formatReceiptCode(sale.receiptCode)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">Código de validação do recibo</p>
                        </div>
                        {getStatusBadge(sale.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(sale.createdAt).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{sale.customerName || "Cliente avulso"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Total da venda</p>
                          <p className="text-xl font-bold text-primary">{formatCurrency(sale.total)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Vendedor</p>
                          <p className="text-sm font-medium">{sale.sellerName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      <Button onClick={() => router.push(`/receipts/${sale.id}`)} className="flex-1 lg:flex-none">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Recibo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Nenhum recibo encontrado" : "Nenhum recibo disponível"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
