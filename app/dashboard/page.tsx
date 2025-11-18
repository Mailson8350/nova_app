"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storage } from "@/lib/storage"
import { useAuth } from "@/lib/auth-context"
import { calculateDashboardStats, formatCurrency, formatShortDate } from "@/lib/dashboard-utils"
import type { DashboardStats } from "@/lib/types"
import { DollarSign, TrendingUp, ShoppingCart, Users, Package, AlertTriangle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

const PAYMENT_COLORS = {
  cash: "#10b981",
  credit: "#3b82f6",
  debit: "#8b5cf6",
  pix: "#06b6d4",
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const { activeStore } = useAuth()

  useEffect(() => {
    if (activeStore) {
      const storeSales = storage.getSalesByStore(activeStore.id)
      const storeProducts = storage.getProductsByStore(activeStore.id)
      const storeCustomers = storage.getCustomersByStore(activeStore.id)

      const dashboardStats = calculateDashboardStats(storeSales, storeProducts, storeCustomers)
      setStats(dashboardStats)
    }
  }, [activeStore])

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Receita Total" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} />
          <StatCard title="Lucro Total" value={formatCurrency(stats.totalProfit)} icon={TrendingUp} />
          <StatCard title="Total de Vendas" value={stats.totalSales} icon={ShoppingCart} />
          <StatCard title="Clientes" value={stats.totalCustomers} icon={Users} />
          <StatCard title="Produtos Ativos" value={stats.totalProducts} icon={Package} />
          <StatCard
            title="Estoque Baixo"
            value={stats.lowStockProducts}
            icon={AlertTriangle}
            className={stats.lowStockProducts > 0 ? "border-orange-500" : ""}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Sales by Day Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas dos Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={formatShortDate} />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.salesByPaymentMethod}
                    dataKey="total"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => {
                      const methodNames: Record<string, string> = {
                        cash: "Dinheiro",
                        credit: "Crédito",
                        debit: "Débito",
                        pix: "PIX",
                      }
                      return methodNames[entry.method] || entry.method
                    }}
                  >
                    {stats.salesByPaymentMethod.map((entry) => (
                      <Cell key={entry.method} fill={PAYMENT_COLORS[entry.method as keyof typeof PAYMENT_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend
                    formatter={(value) => {
                      const methodNames: Record<string, string> = {
                        cash: "Dinheiro",
                        credit: "Crédito",
                        debit: "Débito",
                        pix: "PIX",
                      }
                      return methodNames[value] || value
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-sm">Produto</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Quantidade</th>
                    <th className="text-right py-3 px-4 font-medium text-sm">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.length > 0 ? (
                    stats.topProducts.map((product) => (
                      <tr key={product.productId} className="border-b border-border last:border-0">
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4 text-right">{product.quantity}</td>
                        <td className="py-3 px-4 text-right font-medium">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-muted-foreground">
                        Nenhuma venda registrada ainda
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
