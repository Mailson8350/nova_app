import type { Product, Customer } from "./types"

export const seedProducts: Product[] = [
  {
    id: "1",
    storeId: "", // Will be set during initialization
    name: "Notebook Dell Inspiron",
    description: "Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD",
    sku: "NB-DELL-001",
    price: 3499.9,
    cost: 2800.0,
    stock: 15,
    category: "Eletrônicos",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    storeId: "", // Will be set during initialization
    name: "Mouse Logitech MX Master",
    description: "Mouse sem fio Logitech MX Master 3, ergonômico",
    sku: "MS-LOG-001",
    price: 449.9,
    cost: 320.0,
    stock: 45,
    category: "Periféricos",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    storeId: "", // Will be set during initialization
    name: "Teclado Mecânico Keychron",
    description: "Teclado mecânico Keychron K2, switches brown",
    sku: "KB-KEY-001",
    price: 599.9,
    cost: 420.0,
    stock: 8,
    category: "Periféricos",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    storeId: "", // Will be set during initialization
    name: 'Monitor LG UltraWide 29"',
    description: 'Monitor LG 29" UltraWide Full HD IPS',
    sku: "MN-LG-001",
    price: 1299.9,
    cost: 950.0,
    stock: 3,
    category: "Monitores",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    storeId: "", // Will be set during initialization
    name: "Webcam Logitech C920",
    description: "Webcam Full HD 1080p com microfone",
    sku: "WC-LOG-001",
    price: 399.9,
    cost: 280.0,
    stock: 22,
    category: "Periféricos",
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const seedCustomers: Customer[] = [
  {
    id: "1",
    storeId: "", // Will be set during initialization
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    address: "Rua das Flores, 123",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    storeId: "", // Will be set during initialization
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(11) 91234-5678",
    cpf: "987.654.321-00",
    address: "Av. Paulista, 1000",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    storeId: "", // Will be set during initialization
    name: "Pedro Oliveira",
    email: "pedro.oliveira@email.com",
    phone: "(21) 99876-5432",
    city: "Rio de Janeiro",
    state: "RJ",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
