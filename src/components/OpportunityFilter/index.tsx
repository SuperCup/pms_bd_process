import { useState, useEffect } from 'react'
import { Form, Input, DatePicker, Select, Button, Row, Col, Space } from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import type { OpportunityFilter } from '@/types'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import { formatDate } from '@/utils'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface OpportunityFilterProps {
  filter: OpportunityFilter
  onFilterChange: (filter: Partial<OpportunityFilter>) => void
  onReset: () => void
  customerOptions?: Array<{ label: string; value: string }>
  followerOptions?: Array<{ label: string; value: string }>
  yearOptions?: number[]
}

const OpportunityFilter: React.FC<OpportunityFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  customerOptions = [],
  followerOptions = [],
  yearOptions = [],
}) => {
  const [form] = Form.useForm()
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    form.setFieldsValue({
      keyword: filter.keyword,
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
    })
  }, [filter, form])

  const handleSubmit = (values: any) => {
    const newFilter: Partial<OpportunityFilter> = {
      keyword: values.keyword || undefined,
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
  }

  const handleReset = () => {
    form.resetFields()
    onReset()
  }

  return (
    <Form form={form} onFinish={handleSubmit} layout="vertical">
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="keyword" label="事项搜索">
            <Input placeholder="请输入事项关键词" allowClear />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="year" label="年度">
            <Select placeholder="请选择年度" allowClear>
              {yearOptions.map((year) => (
                <Option key={year} value={year}>
                  {year}年
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="createTimeRange" label="创建时间">
            <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Form.Item name="customerIds" label="客户">
            <Select mode="multiple" placeholder="请选择客户" allowClear>
              {customerOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        {expanded && (
          <>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="followerIds" label="跟进人">
                <Select mode="multiple" placeholder="请选择跟进人" allowClear>
                  {followerOptions.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择状态" allowClear>
                  {STATUS_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="importance" label="重要程度">
                <Select placeholder="请选择重要程度" allowClear>
                  {IMPORTANCE_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item name="type" label="类型">
                <Select placeholder="请选择类型" allowClear>
                  {TYPE_OPTIONS.map((opt) => (
                    <Option key={opt.value} value={opt.value}>
                      {opt.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </>
        )}
        <Col xs={24} sm={24} md={24} lg={24}>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                搜索
              </Button>
              <Button onClick={handleReset} icon={<ReloadOutlined />}>
                重置
              </Button>
              <Button type="link" onClick={() => setExpanded(!expanded)}>
                {expanded ? '收起' : '展开'}
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default OpportunityFilter

