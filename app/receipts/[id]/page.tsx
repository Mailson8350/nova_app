"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { storage } from "@/lib/storage"
import { formatCurrency } from "@/lib/dashboard-utils"
import { formatReceiptCode } from "@/lib/receipt-utils"
import type { Sale } from "@/lib/types"
import { ArrowLeft, Printer } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { validateStoreAccess } from "@/lib/access-control"

export default function ReceiptDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [sale, setSale] = useState<Sale | null>(null)
  const { activeStore, user } = useAuth()

  useEffect(() => {
    if (activeStore && user) {
      const foundSale = storage.getSaleById(params.id as string, activeStore.id)

      if (foundSale) {
        const validation = validateStoreAccess(foundSale.storeId, { user, activeStore })
        if (validation.valid) {
          setSale(foundSale)
        } else {
          console.error("[v0] Access denied to receipt:", validation.error)
          router.push("/receipts")
        }
      }
    }
  }, [params.id, activeStore, user, router])

  const handlePrint = () => {
    window.print()
  }

  if (!sale) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Recibo não encontrado</p>
          <Button onClick={() => router.push("/receipts")} className="mt-4">
            Voltar para Recibos
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const getPaymentMethodLabel = (method: Sale["paymentMethod"]) => {
    const labels = {
      cash: "Dinheiro",
      credit: "Cartão de Crédito",
      debit: "Cartão de Débito",
      pix: "PIX",
    }
    return labels[method]
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Button variant="outline" onClick={() => router.push("/receipts")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md print:shadow-none print:border-0">
            <CardContent className="p-8" id="receipt-content">
              <div className="text-center border-b-2 border-dashed border-border pb-4 mb-4">
                <div className="flex justify-center mb-2">
                  <Image src="/logo.png" alt="NOVA" width={60} height={60} className="rounded-lg" />
                </div>
                <h1 className="text-2xl font-bold mb-1">NOVA</h1>
                <p className="text-sm text-muted-foreground">Recibo de Venda</p>
              </div>

              {/* Receipt Code */}
              <div className="bg-muted p-4 rounded-lg mb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">Código de Validação</p>
                <p className="font-mono font-bold text-lg tracking-wider">{formatReceiptCode(sale.receiptCode)}</p>
              </div>

              {/* Sale Info */}
              <div className="space-y-2 text-sm mb-4 pb-4 border-b border-dashed border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data/Hora:</span>
                  <span className="font-medium">
                    {new Date(sale.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium">{sale.customerName || "Cliente avulso"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vendedor:</span>
                  <span className="font-medium">{sale.sellerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pagamento:</span>
                  <span className="font-medium">{getPaymentMethodLabel(sale.paymentMethod)}</span>
                </div>
              </div>

              {/* Items */}
              <div className="mb-4 pb-4 border-b border-dashed border-border">
                <h3 className="font-semibold mb-3 text-sm">Itens da Venda</h3>
                <div className="space-y-2">
                  {sale.items.map((item, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{item.productName}</span>
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {item.quantity}x {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-4 pb-4 border-b-2 border-dashed border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>{formatCurrency(sale.subtotal)}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span className="text-red-600">-{formatCurrency(sale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(sale.total)}</span>
                </div>
              </div>

              {/* Notes */}
              {sale.notes && (
                <div className="mb-4 pb-4 border-b border-dashed border-border">
                  <p className="text-xs text-muted-foreground mb-1">Observações:</p>
                  <p className="text-sm">{sale.notes}</p>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground space-y-1">
                <p>Obrigado pela preferência!</p>
                <p className="font-mono">ID: {sale.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 80mm;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}
