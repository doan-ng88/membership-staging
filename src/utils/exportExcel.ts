import * as XLSX from 'xlsx'
import type { Member } from '@/types/profile'

export const exportMembershipToExcel = (members: Member[], tab: string) => {
  // Prepare data for export
  const exportData = members.map(member => ({
    'Customer Name': member.fullName,
    'Phone Number': member.mainPhoneNumber,
    [tab === 'date-join-member' ? 'Date Join Member' : 'Birthday']: 
      new Date(tab === 'date-join-member' ? member.registeredTime : member.birthday).toLocaleDateString('vi-VN'),
    'Platform Website': member.websiteName || '',
    ...(tab === 'date-join-member' ? { 'Member Level': member.levelName } : {}),
  }))

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(exportData)

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Membership Data')

  // Generate Excel file
  const fileName = `membership_data_${new Date().toISOString().split('T')[0]}.xlsx`
  XLSX.writeFile(wb, fileName)
} 