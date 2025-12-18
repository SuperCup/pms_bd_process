import { Select } from 'antd'
import type { PMSCustomer } from '@/types'
import { mockPMSCustomers } from '@/mock/data'
import { isH5 } from '@/utils'

const { Option } = Select

interface PMSCustomerSelectProps {
  value?: PMSCustomer
  onChange?: (value: PMSCustomer | undefined) => void
  placeholder?: string
  allowClear?: boolean
}

const PMSCustomerSelect: React.FC<PMSCustomerSelectProps> = ({
  value,
  onChange,
  placeholder = '请选择PMS客户',
  allowClear = true,
}) => {
  const handleChange = (customerId: string | undefined) => {
    if (!customerId) {
      onChange?.(undefined)
      return
    }
    const customer = mockPMSCustomers.find((c) => c.id === customerId)
    onChange?.(customer)
  }

  const isMobile = isH5()

  return (
    <Select
      value={value?.id}
      onChange={handleChange}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch
      size={isMobile ? 'large' : 'middle'}
      filterOption={(input, option) => {
        const customer = mockPMSCustomers.find((c) => c.id === option?.value)
        if (!customer) return false
        return (
          customer.shortName.toLowerCase().includes(input.toLowerCase()) ||
          customer.fullName.toLowerCase().includes(input.toLowerCase())
        )
      }}
    >
      {mockPMSCustomers.map((customer) => (
        <Option key={customer.id} value={customer.id}>
          {customer.shortName} {customer.fullName}
        </Option>
      ))}
    </Select>
  )
}

export default PMSCustomerSelect

