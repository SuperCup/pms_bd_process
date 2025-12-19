import { useState, useEffect } from 'react'
import { Drawer, Form, DatePicker, Select, Button, Space, Radio } from 'antd'
import { FilterOutlined, SearchOutlined, ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { OpportunityFilter } from '@/types'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import { formatDate } from '@/utils'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface OpportunityFilterMobileProps {
  filter: OpportunityFilter
  onFilterChange: (filter: Partial<OpportunityFilter>) => void
  onReset: () => void
  customerOptions?: Array<{ label: string; value: string }>
  followerOptions?: Array<{ label: string; value: string }>
  yearOptions?: number[]
  sortField?: 'planCompleteTime' | 'createTime' | 'lastUpdateTime'
  sortOrder?: 'asc' | 'desc'
  onSortChange?: (field: 'planCompleteTime' | 'lastUpdateTime', order: 'asc' | 'desc') => void
}

const OpportunityFilterMobile: React.FC<OpportunityFilterMobileProps> = ({
  filter,
  onFilterChange,
  onReset,
  customerOptions = [],
  followerOptions = [],
  yearOptions = [],
  sortField = 'planCompleteTime',
  sortOrder = 'asc',
  onSortChange,
}) => {
  const [form] = Form.useForm()
  const [drawerVisible, setDrawerVisible] = useState(false)

  useEffect(() => {
    form.setFieldsValue({
      year: filter.year,
      createTimeRange:
        filter.createTimeStart && filter.createTimeEnd
          ? [dayjs(filter.createTimeStart), dayjs(filter.createTimeEnd)]
          : undefined,
      customerIds: filter.customerIds,
      followerIds: filter.followerIds,
      status: filter.status,
      importance: filter.importance,
      type: filter.type,
      sortField,
      sortOrder,
    })
  }, [filter, form, sortField, sortOrder])

  const handleSubmit = (values: any) => {
    const newFilter: Partial<OpportunityFilter> = {
      year: values.year || undefined,
      createTimeStart: values.createTimeRange?.[0]
        ? formatDate(values.createTimeRange[0], 'YYYY-MM-DD')
        : undefined,
      createTimeEnd: values.createTimeRange?.[1]
        ? formatDate(values.createTimeRange[1], 'YYYY-MM-DD')
        : undefined,
      customerIds: values.customerIds || undefined,
      followerIds: values.followerIds || undefined,
      status: values.status || undefined,
      importance: values.importance || undefined,
      type: values.type || undefined,
    }
    onFilterChange(newFilter)
    setDrawerVisible(false)
  }

  const handleReset = () => {
    form.resetFields()
    onReset()
    setDrawerVisible(false)
  }

  // 计算筛选条件数量
  const filterCount = [
    filter.year,
    filter.createTimeStart,
    filter.customerIds?.length,
    filter.followerIds?.length,
    filter.status,
    filter.importance,
    filter.type,
  ].filter(Boolean).length

  return (
    <>
      <Button
        icon={<FilterOutlined />}
        onClick={() => setDrawerVisible(true)}
        type={filterCount > 0 ? 'primary' : 'default'}
        style={{ flexShrink: 0 }}
      >
        {filterCount > 0 && filterCount}
      </Button>

      <Drawer
        title="筛选条件"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width="85%"
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item label="排序方式">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <Radio
                  checked={sortField === 'planCompleteTime'}
                  onChange={() => {
                    if (onSortChange) {
                      onSortChange('planCompleteTime', sortOrder)
                    }
                  }}
                >
                  计划完成时间
                </Radio>
                {sortField === 'planCompleteTime' && (
                  <Button
                    type="text"
                    size="small"
                    icon={sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    onClick={() => {
                      if (onSortChange) {
                        onSortChange('planCompleteTime', sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                    }}
                  />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Radio
                  checked={sortField === 'lastUpdateTime'}
                  onChange={() => {
                    if (onSortChange) {
                      onSortChange('lastUpdateTime', sortOrder)
                    }
                  }}
                >
                  最近更新时间
                </Radio>
                {sortField === 'lastUpdateTime' && (
                  <Button
                    type="text"
                    size="small"
                    icon={sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    onClick={() => {
                      if (onSortChange) {
                        onSortChange('lastUpdateTime', sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                    }}
                  />
                )}
              </div>
            </Space>
          </Form.Item>

          <Form.Item name="year" label="年度">
            <Select placeholder="请选择年度" allowClear>
              {yearOptions.map((year) => (
                <Option key={year} value={year}>
                  {year}年
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="createTimeRange" label="创建时间">
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Form.Item>

          <Form.Item name="customerIds" label="客户">
            <Select mode="multiple" placeholder="请选择客户" allowClear>
              {customerOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="followerIds" label="跟进人">
            <Select mode="multiple" placeholder="请选择跟进人" allowClear>
              {followerOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态" allowClear>
              {STATUS_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="importance" label="重要程度">
            <Select placeholder="请选择重要程度" allowClear>
              {IMPORTANCE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="type" label="类型">
            <Select placeholder="请选择类型" allowClear>
              {TYPE_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%' }} direction="vertical">
              <Button type="primary" htmlType="submit" block icon={<SearchOutlined />}>
                确定
              </Button>
              <Button onClick={handleReset} block icon={<ReloadOutlined />}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  )
}

export default OpportunityFilterMobile

