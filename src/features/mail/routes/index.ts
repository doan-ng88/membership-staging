import type { RouteRecordRaw } from 'vue-router';

export const mailCampaignRoutes: RouteRecordRaw[] = [
  {
    path: '/mail',
    name: 'Mail',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/mail/template-mail',
        name: 'TemplateMailManagement',
        component: () => import('../views/TemplateMailView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Template Mail Management'
        }
      },
      {
        path: '/create-mail-campaign',
        name: 'CreateMailCampaign',
        component: () => import('../views/CreateMailCampaignView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Create Campaign',
        }
      },
      {
        path: 'editor/:id?',
        name: 'MailEditor',
        component: () => import('../views/TemplateEditorView.vue'),
        meta: { 
          requiresAuth: true,
          title: 'Soạn Template Email'
        }
      },
      {
        path: '/mail/mail-campaign',
        name: 'MailCampaign',
        component: () => import('../views/MailCampaignView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Mail Campaign Management'
        }
      },
      {
        path: '/mail/mail-campaign/:id',
        name: 'MailCampaignDetail',
        component: () => import('@/features/mail/views/MailCampaignDetailView.vue'),
        meta: {
          requiresAuth: true,
          title: 'Mail Campaign Detail'
        }
      },
      {
        path: 'send/:id',
        name: 'SendMail',
        component: () => import('@/features/mail/views/SendPreviewView.vue'),
        meta: { 
          requiresAuth: true,
          title: 'Gửi Email'
        }
      }
    ]
  }
]; 