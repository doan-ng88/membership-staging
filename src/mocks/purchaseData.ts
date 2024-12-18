type PurchaseStatus = 'Shipped' | 'Pending' | 'Not Shipped'

interface Purchase {      
  orderId: string
  memberId: string
  orderDate: string
  product: string
  amount: number
  status: PurchaseStatus
}

export const mockPurchases: Purchase[] = [
  {
    orderId: "ORD001",
    memberId: "MEM001",
    orderDate: "2024-03-20",
    product: "BBIA Matte Lipstick",
    amount: 1500000,
    status: "Shipped"
  },
  {
    orderId: "ORD002",
    memberId: "MEM002",
    orderDate: "2024-03-15",
    product: "Hince Gloss",
    amount: 2300000,
    status: "Pending"
  },
  {
    orderId: "ORD003",
    memberId: "MEM001",
    orderDate: "2024-03-10",
    product: "BBIA Beige Gloss",
    amount: 890000,
    status: "Not Shipped"
  }
] 