export const formatDate = (dateString: string) => {
    console.log('dateString', dateString)
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  }; 