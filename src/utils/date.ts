import dayjs from 'dayjs';

export const formatDate = (dateString: string) => {
    console.log('dateString', dateString)
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  }; 

export const formatDateRange = (date?: string) => {
  return date ? dayjs(date).format('DD/MM/YYYY') : '';
};
