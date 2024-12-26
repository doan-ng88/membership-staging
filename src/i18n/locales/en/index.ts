import common from './common.json'
import membership from './membership-en.json'
import benefit from './benefit.json' // Tạo file mới này

export default {
  ...common,
  ...membership,
  ...benefit
} 