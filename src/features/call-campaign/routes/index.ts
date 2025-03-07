import type { RouteRecordRaw } from 'vue-router'

export const callCampaignRoutes: RouteRecordRaw[] = [
  {
    path: '/call-campaigns',
    name: 'CallCampaign',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/call-campaign',
        name: 'CallCampaignList',
        component: () => import('../views/CallCampaignView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Quản lý chiến dịch gọi'
        }
      },
      {
        path: 'create-call-campaign',
        name: 'CreateCallCampaign',
        component: () => import('../views/CreateCallCampaignView.vue'),
        meta: { 
          requiresAuth: true,
          title: 'Create Call Campaign'
        }
      },
       // Call Campaign Detail
      {
        path: '/call-campaign/:id',
        name: 'CallCampaignDetail',
        component: () => import('../views/CallCampaignDetailView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Call Campaign Detail',
          permissions: ['view_campaign']
        }
      }
    ]
  }
] 