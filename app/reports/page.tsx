"use client"

import { useState, useEffect, useMemo } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { storage } from "@/lib/storage"
import { formatCurrency, formatDate } from "@/lib/dashboard-utils"
import type { Sale, Product } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Calendar, TrendingUp, Package, DollarSign, Printer } from "lucide-react"
import Image from "next/image"

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    setSales(storage.getSales())
    setProducts(storage.getProducts())

    // Set default dates (last 30 days)
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)

    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }, [])

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      if (sale.status !== "completed") return false

      const saleDate = new Date(sale.createdAt)
      const start = startDate ? new Date(startDate) : null
      const end = endDate ? new Date(endDate) : null

      if (start && saleDate < start) return false
      if (end) {
        const endOfDay = new Date(end)
        endOfDay.setHours(23, 59, 59, 999)
        if (saleDate > endOfDay) return false
      }

      return true
    })
  }, [sales, startDate, endDate])

  // Calculate metrics
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalSales = filteredSales.length
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0

  const totalProfit = filteredSales.reduce((sum, sale) => {
    const profit = sale.items.reduce((itemSum, item) => {
      const product = products.find((p) => p.id === item.productId)
      const cost = product ? product.cost * item.quantity : 0
      return itemSum + (item.total - cost)
    }, 0)
    return sum + profit
  }, 0)

  // Sales by day
  const salesByDay = useMemo(() => {
    const dayMap = new Map<string, { revenue: number; count: number; profit: number }>()

    filteredSales.forEach((sale) => {
      const date = sale.createdAt.split("T")[0]
      const existing = dayMap.get(date)

      const saleProfit = sale.items.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId)
        const cost = product ? product.cost * item.quantity : 0
        return sum + (item.total - cost)
      }, 0)

      if (existing) {
        existing.revenue += sale.total
        existing.count += 1
        existing.profit += saleProfit
      } else {
        dayMap.set(date, { revenue: sale.total, count: 1, profit: saleProfit })
      }
    })

    return Array.from(dayMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        count: data.count,
        profit: data.profit,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredSales, products])

  // Top products
  const topProducts = useMemo(() => {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>()

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = productMap.get(item.productId)
        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += item.total
        } else {
          productMap.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.total,
          })
        }
      })
    })

    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
  }, [filteredSales])

  // Sales by payment method
  const salesByPayment = useMemo(() => {
    const paymentMap = new Map<string, { count: number; revenue: number }>()

    filteredSales.forEach((sale) => {
      const existing = paymentMap.get(sale.paymentMethod)
      if (existing) {
        existing.count += 1
        existing.revenue += sale.total
      } else {
        paymentMap.set(sale.paymentMethod, { count: 1, revenue: sale.total })
      }
    })

    const methodNames: Record<string, string> = {
      cash: "Dinheiro",
      credit: "Crédito",
      debit: "Débito",
      pix: "PIX",
    }

    return Array.from(paymentMap.entries()).map(([method, data]) => ({
      method: methodNames[method] || method,
      count: data.count,
      revenue: data.revenue,
    }))
  }, [filteredSales])

  const handlePrint = () => {
    window.print()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between print:block">
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Análise detalhada de vendas e desempenho</p>
          </div>
          <Button onClick={handlePrint} className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir Relatório
          </Button>
        </div>

        <div className="hidden print:block text-center mb-6">
          <Image src="/logo.png" alt="NOVA" width={60} height={60} className="mx-auto mb-2 rounded-lg" />
          <h1 className="text-2xl font-bold">NOVA - Relatório de Vendas</h1>
          <p className="text-sm text-muted-foreground">
            Período: {startDate ? new Date(startDate).toLocaleDateString("pt-BR") : "Início"} até{" "}
            {endDate ? new Date(endDate).toLocaleDateString("pt-BR") : "Hoje"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Gerado em: {new Date().toLocaleDateString("pt-BR")} às {new Date().toLocaleTimeString("pt-BR")}
          </p>
        </div>

        {/* Date Filter */}
        <Card className="print:hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="startDate">Data Inicial</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="endDate">Data Final</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  const end = new Date()
                  const start = new Date()
                  start.setDate(start.getDate() - 30)
                  setStartDate(start.toISOString().split("T")[0])
                  setEndDate(end.toISOString().split("T")[0])
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Últimos 30 dias
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 print:break-inside-avoid">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center print:hidden">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lucro Total</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(totalProfit)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center print:hidden">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Vendas</p>
                  <p className="text-2xl font-bold mt-2">{totalSales}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center print:hidden">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(averageTicket)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center print:hidden">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2 print:break-inside-avoid">
          {/* Revenue Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Receita ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(date) => formatDate(date)}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Profit Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Lucro ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString("pt-BR")} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(date) => formatDate(date)}
                  />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Payment Method */}
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Vendas por Forma de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Forma de Pagamento</th>
                    <th className="text-right py-3 px-4 font-medium">Quantidade</th>
                    <th className="text-right py-3 px-4 font-medium">Receita</th>
                    <th className="text-right py-3 px-4 font-medium">% do Total</th>
                  </tr>
                </thead>
                <tbody>
                  {salesByPayment.map((payment) => (
                    <tr key={payment.method} className="border-b border-border last:border-0">
                      <td className="py-3 px-4">{payment.method}</td>
                      <td className="py-3 px-4 text-right">{payment.count}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(payment.revenue)}</td>
                      <td className="py-3 px-4 text-right">
                        {((payment.revenue / totalRevenue) * 100 || 0).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Sales Table */}
        <Card className="print:break-inside-avoid">
          <CardHeader>
            <CardTitle>Vendas Detalhadas ({filteredSales.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium">Data</th>
                    <th className="text-left py-3 px-4 font-medium">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium">Pagamento</th>
                    <th className="text-right py-3 px-4 font-medium">Itens</th>
                    <th className="text-right py-3 px-4 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => (
                      <tr key={sale.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">{formatDate(sale.createdAt)}</td>
                        <td className="py-3 px-4">{sale.customerName || "Cliente avulso"}</td>
                        <td className="py-3 px-4 capitalize">
                          {sale.paymentMethod === "cash"
                            ? "Dinheiro"
                            : sale.paymentMethod === "credit"
                              ? "Crédito"
                              : sale.paymentMethod === "debit"
                                ? "Débito"
                                : sale.paymentMethod === "pix"
                                  ? "PIX"
                                  : sale.paymentMethod}
                        </td>
                        <td className="py-3 px-4 text-right">{sale.items.length}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(sale.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        Nenhuma venda no período selecionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
