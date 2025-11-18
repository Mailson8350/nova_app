// Utility functions for receipt generation and validation

export function generateReceiptCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${timestamp}-${random}`
}

export function formatReceiptCode(code: string | undefined): string {
  if (!code) return "N/A"
  return code.replace(/-/g, " ")
}

export function validateReceiptCode(code: string, sales: any[]): boolean {
  return sales.some((sale) => sale.receiptCode === code)
}
