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
  payment_method: string
  payment_method_title: string
  shipping_fee: number
  shipping_type: string
  items: OrderItem[]
  user: {
    user_id: number
  }
}

export interface OrderHistoryResponse {
  orders: Order[]
}

export class OrderHistoryApi {
  async getOrderHistory(userId: number): Promise<OrderHistoryResponse> {
    try {
      const response = await axiosInstance.get(`/membership/get/get-order-history/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching order history:', error)
      throw error
    }
  }
}

export const orderHistoryApi = new OrderHistoryApi() 