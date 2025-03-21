import { ref } from 'vue'

export function useNotification() {
  const notification = ref({
    show: false,
    message: '',
    type: 'success'
  })

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    notification.value = {
      show: true,
      message,
      type
    }

    setTimeout(() => {
      notification.value.show = false
    }, 3000)
  }

  return {
    notification,
    showNotification
  }
} 