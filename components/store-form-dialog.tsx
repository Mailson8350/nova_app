"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { Store } from "@/lib/types"
import { Separator } from "@/components/ui/separator"

interface StoreFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    store: Omit<Store, "id" | "createdAt" | "updatedAt">,
    ownerData?: { name: string; email: string; password: string },
  ) => void
  store?: Store
}

export function StoreFormDialog({ open, onOpenChange, onSubmit, store }: StoreFormDialogProps) {
  const [formData, setFormData] = useState({
    name: store?.name || "",
    email: store?.email || "",
    phone: store?.phone || "",
    address: store?.address || "",
    isActive: store?.isActive ?? true,
    expiresAt: store?.expiresAt ? store.expiresAt.split("T")[0] : "",
  })

  const [ownerData, setOwnerData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(
      {
        ...formData,
        expiresAt: formData.expiresAt || undefined,
      },
      store ? undefined : ownerData,
    )
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{store ? "Editar Loja" : "Nova Loja"}</DialogTitle>
          <DialogDescription>
            {store ? "Atualize as informações da loja" : "Crie uma nova loja e configure o acesso do proprietário"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Loja *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email da Loja *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Data de Expiração</Label>
              <Input
                id="expiresAt"
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Deixe em branco para acesso ilimitado</p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Loja Ativa</Label>
                <p className="text-sm text-muted-foreground">Permitir acesso ao sistema</p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {!store && (
              <>
                <Separator className="my-2" />
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Credenciais do Proprietário</h3>
                    <p className="text-sm text-muted-foreground">Configure o acesso para o dono da loja</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ownerName">Nome do Proprietário *</Label>
                    <Input
                      id="ownerName"
                      value={ownerData.name}
                      onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ownerEmail">Email de Acesso *</Label>
                    <Input
                      id="ownerEmail"
                      type="email"
                      value={ownerData.email}
                      onChange={(e) => setOwnerData({ ...ownerData, email: e.target.value })}
                      required
                    />
                    <p className="text-sm text-muted-foreground">Este email será usado para fazer login no sistema</p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="ownerPassword">Senha *</Label>
                    <Input
                      id="ownerPassword"
                      type="password"
                      value={ownerData.password}
                      onChange={(e) => setOwnerData({ ...ownerData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                    <p className="text-sm text-muted-foreground">Mínimo de 6 caracteres</p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{store ? "Atualizar" : "Criar Loja"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
