export type TabType = 'date-join-member' | 'date-of-birth';
export type PlatformWebsite = 'hince' | 'BBIA' | 'mixsoon' | 'sky007';
export type ModalType = 'details' | 'history' | null;

export interface Member {
  membershipWebsiteId: number;
  membershipId: number;
  email: string;
  birthday: string;
  fullName: string;
  mainPhoneNumber: string;
  points: number;
  level: number;
  isJoinSky007: boolean;
  registeredTime: string;
  levelUpdateTime: string;
  websiteId: number;
  levelId: number;
  totalOrder: number;
  amountNextLevel: number;
  defaultAddress: string;
}

export interface FilterParams {
  registeredTimeFrom?: string
  registeredTimeTo?: string
  websiteId?: string | number
  levelId?: string | number
  memberDowngradeMonth?: number
  searchParams?: Array<{
    key: string
    value: string | number
  }>
}

export interface PaginationParams {
  pageIndex: number
  pageSize: number
  searchParams: Array<{
    key: string
    value: string | number
  }>
}

// interface PurchaseProduct {
//   id: string
//   name: string
//   quantity: number
//   price: number
// }

// interface Purchase {
//   orderId: string
//   date: string
//   products: PurchaseProduct[]
//   totalAmount: number
//   status: 'Completed' | 'Pending' | 'Cancelled'
// }

// interface PointTransaction {
//   id: string
//   date: string
//   type: 'Earned' | 'Redeemed' | 'Expired'
//   points: number
//   description: string
//   balance: number
// }

// export interface Member {
//   // ... existing fields ...
//   purchaseHistory: Purchase[]
//   pointHistory: PointTransaction[]
// }

export interface PurchaseOrder {
  orderId: string
  memberId: string
  orderDate: string
  product: string
  amount: number
  status: 'Shipped' | 'Pending' | 'Not Shipped'
}

export interface PurchaseHistory {
  orderIdWebsite: number
  createTime: string
  orderStatus: string
  ProductList: any[]
}
