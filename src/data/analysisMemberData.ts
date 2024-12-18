// import type { MetricOption, MemberStats, ChartData } from '@/types/analysis'
import type { 
    MetricOption, 
    PurchaseCycleData, 
    ProductPreferenceData, 
    CustomerValueData 
} from '@/types/memberAnalysis'

export const BRAND_OPTIONS: MetricOption[] = [
  { value: 'sky007', label: 'Sky007, BBIA' },
  { value: 'hince', label: 'Hince' },
  { value: 'mixsoon', label: 'Mixsoon' }
]

export const TIME_RANGE_OPTIONS: MetricOption[] = [
  { value: '6', label: 'Last 6 Months' },
  { value: '12', label: 'Last 12 Months' },
  { value: '24', label: 'Last 24 Months' }
]

export const BEHAVIOR_METRICS: MetricOption[] = [
  { value: 'averagePurchase', label: 'Giá Trị Mua Trung Bình (USD)' },
  { value: 'purchaseFrequency', label: 'Tần Suất Mua Hàng' },
  { value: 'averageSession', label: 'Thời Gian Truy Cập Trung Bình (giờ/ngày)' }
]

export const PRODUCT_CATEGORIES: MetricOption[] = [
    { value: 'BestItems', label: 'Best Items' },
    { value: 'Mixsoon', label: 'Mixsoon' },
    { value: 'SkinToner', label: 'Skin Toner' },
    { value: 'Cream', label: 'Cream' },
    { value: 'EssenceSerum', label: 'Essence Serum' }
  ]

export const CUSTOMER_SEGMENTS: MetricOption[] = [
  { value: 'low', label: 'Low Value' },
  { value: 'medium', label: 'Medium Value' },
  { value: 'high', label: 'High Value' }
]

export const INITIAL_PURCHASE_CYCLE_DATA: PurchaseCycleData = {
  labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
  datasets: [
    {
      label: 'Average Purchase Frequency',
      data: [5, 7, 6, 8, 5, 9],
      backgroundColor: 'rgba(54, 162, 235, 0.6)'
    }
  ]
}

export const INITIAL_PRODUCT_PREFERENCE_DATA: ProductPreferenceData = {
  labels: ['Electronics', 'Fashion', 'Home', 'Health', 'Sports'],
  datasets: [
    {
      label: 'Purchase Quantity',
      data: [50, 80, 40, 30, 20],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ]
    }
  ]
}

  export const INITIAL_CUSTOMER_VALUE_DATA: CustomerValueData = {
    labels: ['Giá Trị Thấp', 'Giá Trị Trung Bình', 'Giá Trị Cao'],
    datasets: [
      {
        label: 'Doanh Thu',
        data: [5000, 15000, 30000],
        backgroundColor: 'rgba(255, 159, 64, 0.6)'
      }
    ]
  }
  
  export const getPurchaseCycleData = (months: number): PurchaseCycleData => ({
    labels: Array.from({ length: months }, (_, i) => `Month ${i + 1}`),
    datasets: [
      {
        label: 'Số Lần Mua Hàng Trung Bình',
        data: Array.from({ length: months }, () => Math.floor(Math.random() * 10) + 1),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }
    ]
  })
  
  export const getProductPreferenceData = (categories: ProductCategory[]): ProductPreferenceData => ({
    labels: categories.map(cat => {
      switch(cat) {
        case 'BestItems': return 'Best Items'
        case 'Mixsoon': return 'Mixsoon'
        case 'SkinToner': return 'Skin Toner'
        case 'Cream': return 'Cream'
        case 'EssenceSerum': return 'Essence Serum'
        default: return cat
      }
    }),
    datasets: [
      {
        label: 'Số Lượng Mua',
        data: categories.map(() => Math.floor(Math.random() * 100) + 10),
        backgroundColor: categories.map(cat => {
          switch(cat) {
            case 'electronics': return 'rgba(255, 99, 132, 0.6)'
            case 'fashion': return 'rgba(54, 162, 235, 0.6)'
            case 'home': return 'rgba(255, 206, 86, 0.6)'
            case 'health': return 'rgba(75, 192, 192, 0.6)'
            case 'sports': return 'rgba(153, 102, 255, 0.6)'
            default: return 'rgba(201, 203, 207, 0.6)'
          }
        })
      }
    ]
  })
  
  export const getCustomerValueData = (segment: CustomerSegment): CustomerValueData => ({
    labels: ['Giá Trị Thấp', 'Giá Trị Trung Bình', 'Giá Trị Cao'],
    datasets: [
      {
        label: 'Doanh Thu',
        data: segment === 'low' ? [5000, 15000, 30000] :
              segment === 'medium' ? [7000, 20000, 35000] :
              [10000, 25000, 40000],
        backgroundColor: 'rgba(255, 159, 64, 0.6)'
      }
    ]
  })
 
  
export const CHART_COLORS = {
  averagePurchase: {
    border: 'rgba(75, 192, 192, 1)',
    background: 'rgba(75, 192, 192, 0.6)'
  },
  purchaseFrequency: {
    border: 'rgba(153, 102, 255, 1)', 
    background: 'rgba(153, 102, 255, 0.6)'
  },
  averageSession: {
    border: 'rgba(255, 159, 64, 1)',
    background: 'rgba(255, 159, 64, 0.6)'
  },
  levelTransition: {
    silver: {
      border: 'rgba(54, 162, 235, 1)',
      background: 'rgba(54, 162, 235, 0.2)'
    },
    gold: {
      border: 'rgba(255, 206, 86, 1)', 
      background: 'rgba(255, 206, 86, 0.2)'
    }
  }
}

export const initialMemberStats: MemberStats = {
  'Bạc': 120,
  'Vàng': 80,
  'Kim Cương': 50
}

export const getInitialTransitionData = (months: number): ChartData => ({
  labels: Array.from({length: months}, (_, i) => `Tháng ${i + 1}`),
  datasets: [
    {
      label: 'Từ Bạc đến Vàng',
      data: Array(months).fill(0).map((_, i) => 10 + i * 5),
      borderColor: CHART_COLORS.levelTransition.silver.border,
      backgroundColor: CHART_COLORS.levelTransition.silver.background,
      fill: true,
      tension: 0.4
    },
    {
      label: 'Từ Vàng đến Kim Cương',
      data: Array(months).fill(0).map((_, i) => 5 + i * 5),
      borderColor: CHART_COLORS.levelTransition.gold.border,
      backgroundColor: CHART_COLORS.levelTransition.gold.background,
      fill: true,
      tension: 0.4
    }
  ]
})

