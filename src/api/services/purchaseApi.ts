import axiosInstance from '../config/axios';

export interface OrderItem {
  order_item_name: string
  product_id: number
  product_price: number
  product_quantity: number
  line_total: number
  product_subtotal: number
  product_tax: number
  product_slug: string
}

export interface Order {
  order_id: number
  order_date: string
  order_status: string
  order_total: number
  items: {
    order_item_name: string
    product_id: number
    product_quantity: number
  }[]
  user_website: {
    fullName: string
    phoneNumber: string
    website: {
      websiteId: number
      name: string
    }
    userId: number
    birthday: string
    points: number
    level: {
      levelId: number
      Name: string
      thresholdAmount: number
      durationExpried: number
    }
  }
  payment_method: string
  payment_method_title: string
  shipping_fee: number
  shipping_type: string
  user: {
    user_id: number
  }
}

export interface OrdersResponse {
  data: Order[]
  pagination: {
    total: number
    pageIndex: number
    pageSize: number
    totalPages: number
  }
}

interface SearchParam {
  field: string;
  value: string | number;
  operator: string;
}

interface GetPageParam {
  pageIndex: number;
  pageSize: number;
  sortField?: string;
  sortType?: string;
  searchParams?: SearchParam[];
}

class PurchaseApi {
  async getPurchaseHistoryUnsorted(websiteId: number, page: number = 1, pageSize: number = 10) {
    try {
      const body: GetPageParam = {
        pageIndex: page,
        pageSize: pageSize,
        sortField: "order_date",
        sortType: "DESC",
        searchParams: []
      }

      const response = await axiosInstance.post(`/membership/get/orders/${websiteId}`, body)
      return response.data as OrdersResponse
    } catch (error) {
      console.error('Error fetching member orders:', error)
      throw error
    }
  }

  async getPurchaseHistory(websiteId: number, page: number = 1, pageSize: number = 10) {
    try {
      const response = await this.getPurchaseHistoryUnsorted(websiteId, page, pageSize)
      if (response?.data) {
        return {
          data: this.sortOrdersById(response.data),
          pagination: response.pagination
        }
      }
      return response
    } catch (error) {
      console.error('Error fetching member orders:', error)
      throw error
    }
  }

  sortOrdersById(orders: Order[]): Order[] {
    return orders.sort((a, b) => b.order_id - a.order_id)
  }
}

export const purchaseApi = new PurchaseApi() 