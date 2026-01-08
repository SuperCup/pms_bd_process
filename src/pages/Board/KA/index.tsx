import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Empty, Spin, Tag, Avatar, Button, Modal, Form, Checkbox, DatePicker, Select, message, Tooltip } from 'antd'
import { DownOutlined, RightOutlined, SettingOutlined } from '@ant-design/icons'
import { getKAOpportunities } from '@/api/opportunity'
import { getCustomerList } from '@/api/customer'
import { getKAFilterConfig, saveKAFilterConfig, type KAFilterConfig } from '@/api/kaFilter'
import type { Opportunity, Customer } from '@/types'
import { formatDate, isH5 } from '@/utils'
import { IMPORTANCE_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/utils/constants'
import { useUserStore } from '@/stores/userStore'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import BoardKAMobile from './mobile'
import './index.less'

const { RangePicker } = DatePicker
const { Option } = Select

// 筛选配置接口（与API接口保持一致）
type FilterConfig = KAFilterConfig

const BoardKA: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [groupedData, setGroupedData] = useState<Record<string, Opportunity[]>>({})
  const [allGroupedData, setAllGroupedData] = useState<Record<string, Opportunity[]>>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [filterConfig, setFilterConfig] = useState<FilterConfig | null>(null)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([])
  const [form] = Form.useForm()

  // 检查是否有权限编辑筛选配置（暂时对所有用户开放，后续可改为仅joyce和ken）
  const canEditFilter = true // 暂时对所有用户开放权限

  useEffect(() => {
    fetchData()
    fetchCustomers()
    loadFilterConfig()
  }, [])

  useEffect(() => {
    applyFilter()
  }, [filterConfig, allGroupedData])

  const fetchCustomers = async () => {
    try {
      const res = await getCustomerList({ pageSize: 1000, isKA: true })
      setCustomerOptions(res.list)
    } catch (error) {
      console.error('获取客户列表失败', error)
    }
  }

  // 加载筛选配置
  const loadFilterConfig = async () => {
    try {
      const config = await getKAFilterConfig()
      if (config) {
        setFilterConfig(config)
      }
    } catch (error) {
      console.error('加载筛选配置失败', error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getKAOpportunities()
      // 按客户分组
      const grouped: Record<string, Opportunity[]> = {}
      res.forEach((item) => {
        const customerName = item.customer.name
        if (!grouped[customerName]) {
          grouped[customerName] = []
        }
        grouped[customerName].push(item)
      })

      // 对每个分组按创建时间排序
      Object.keys(grouped).forEach((key) => {
        grouped[key].sort((a, b) => {
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        })
      })

      setAllGroupedData(grouped)
      setGroupedData(grouped)
      // 默认展开所有客户组
      setExpandedRows(new Set(Object.keys(grouped)))
    } catch (error) {
      console.error('获取KA客户商机失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 应用筛选条件
  const applyFilter = () => {
    if (!filterConfig) {
      setGroupedData(allGroupedData)
      return
    }

    const filtered: Record<string, Opportunity[]> = {}
    const customerIds = filterConfig.visibleCustomers || []

    Object.keys(allGroupedData).forEach((customerName) => {
      const customer = customerOptions.find(c => c.name === customerName)
      // 如果配置了visibleCustomers且该客户不在列表中，则隐藏该客户
      if (customer && customerIds.length > 0 && !customerIds.includes(customer.id)) {
        return // 隐藏该客户
      }

      let opportunities = [...allGroupedData[customerName]]

      // 按创建时间筛选
      if (filterConfig.createTimeRange && filterConfig.createTimeRange.length === 2) {
        const [start, end] = filterConfig.createTimeRange
        opportunities = opportunities.filter(opp => {
          const createTime = dayjs(opp.createTime)
          return (createTime.isAfter(dayjs(start).startOf('day')) || createTime.isSame(dayjs(start).startOf('day'))) 
            && (createTime.isBefore(dayjs(end).endOf('day')) || createTime.isSame(dayjs(end).endOf('day')))
        })
      }

      // 按状态筛选
      if (filterConfig.status && filterConfig.status.length > 0) {
        opportunities = opportunities.filter(opp => filterConfig.status!.includes(opp.status))
      }

      // 按计划完成时间筛选
      if (filterConfig.planCompleteTimeRange && filterConfig.planCompleteTimeRange.length === 2) {
        const [start, end] = filterConfig.planCompleteTimeRange
        opportunities = opportunities.filter(opp => {
          const planTime = dayjs(opp.planCompleteTime)
          return (planTime.isAfter(dayjs(start).startOf('day')) || planTime.isSame(dayjs(start).startOf('day'))) 
            && (planTime.isBefore(dayjs(end).endOf('day')) || planTime.isSame(dayjs(end).endOf('day')))
        })
      }

      if (opportunities.length > 0) {
        filtered[customerName] = opportunities
      }
    })

    setGroupedData(filtered)
  }

  // 计算客户统计信息
  const calculateCustomerStats = (_customerName: string, opportunities: Opportunity[]) => {
    const total = opportunities.length
    const won = opportunities.filter(opp => opp.status === 'won').length
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0'
    
    // 获取总负责人（取第一个商机的跟进人，或根据业务逻辑确定）
    const mainFollower = opportunities.length > 0 ? opportunities[0].follower : null

    return {
      total,
      conversionRate,
      mainFollower
    }
  }

  const toggleRow = (customerName: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(customerName)) {
      newExpanded.delete(customerName)
    } else {
      newExpanded.add(customerName)
    }
    setExpandedRows(newExpanded)
  }

  const handleFilterConfig = () => {
    if (!canEditFilter) {
      message.warning('您没有权限编辑筛选配置，仅joyce和ken可以编辑')
      return
    }
    
    // 初始化表单值
    const initialValues: any = {
      visibleCustomers: customerOptions.map(c => c.id),
      status: [],
      createTimeRange: undefined,
      planCompleteTimeRange: undefined,
    }
    
    if (filterConfig) {
      initialValues.visibleCustomers = filterConfig.visibleCustomers && filterConfig.visibleCustomers.length > 0
        ? filterConfig.visibleCustomers
        : customerOptions.map(c => c.id)
      initialValues.status = filterConfig.status || []
      if (filterConfig.createTimeRange && filterConfig.createTimeRange.length === 2) {
        initialValues.createTimeRange = [dayjs(filterConfig.createTimeRange[0]), dayjs(filterConfig.createTimeRange[1])]
      }
      if (filterConfig.planCompleteTimeRange && filterConfig.planCompleteTimeRange.length === 2) {
        initialValues.planCompleteTimeRange = [dayjs(filterConfig.planCompleteTimeRange[0]), dayjs(filterConfig.planCompleteTimeRange[1])]
      }
    }
    
    form.setFieldsValue(initialValues)
    setFilterModalVisible(true)
  }

  const handleFilterSubmit = async () => {
    try {
      const values = await form.validateFields()
      const config: FilterConfig = {
        visibleCustomers: values.visibleCustomers || [],
        status: values.status || [],
      }
      
      if (values.createTimeRange && values.createTimeRange.length === 2) {
        config.createTimeRange = [
          values.createTimeRange[0].format('YYYY-MM-DD'),
          values.createTimeRange[1].format('YYYY-MM-DD')
        ]
      }
      
      if (values.planCompleteTimeRange && values.planCompleteTimeRange.length === 2) {
        config.planCompleteTimeRange = [
          values.planCompleteTimeRange[0].format('YYYY-MM-DD'),
          values.planCompleteTimeRange[1].format('YYYY-MM-DD')
        ]
      }
      
      // 保存筛选配置
      await saveKAFilterConfig(config)
      setFilterConfig(config)
      setFilterModalVisible(false)
      message.success('筛选配置已保存')
    } catch (error) {
      console.error('保存筛选配置失败', error)
      message.error('保存筛选配置失败')
    }
  }

  const handleFilterReset = async () => {
    try {
      // 重置表单为默认值（显示所有客户）
      const defaultValues = {
        visibleCustomers: customerOptions.map(c => c.id),
        status: [],
        createTimeRange: undefined,
        planCompleteTimeRange: undefined,
      }
      form.setFieldsValue(defaultValues)
      
      // 清除保存的配置
      await saveKAFilterConfig({ visibleCustomers: [], status: [] })
      setFilterConfig(null)
      message.success('筛选配置已重置')
    } catch (error) {
      console.error('重置筛选配置失败', error)
      message.error('重置筛选配置失败')
    }
  }

  const getImportanceTag = (importance: Opportunity['importance']) => {
    const option = IMPORTANCE_OPTIONS.find((opt) => opt.value === importance)
    if (importance === 'very-important') {
      return <Tag color="red">{option?.label}</Tag>
    }
    return <Tag color="green">{option?.label}</Tag>
  }

  const getTypeTag = (type: Opportunity['type']) => {
    const option = TYPE_OPTIONS.find((opt) => opt.value === type)
    const colorMap: Record<string, string> = {
      invitation: 'green',
      lead: 'purple',
      purchase: 'blue',
      service: 'cyan',
    }
    return <Tag color={colorMap[type] || 'default'}>{option?.label}</Tag>
  }

  const getStatusTag = (status: Opportunity['status']) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status)
    const colorMap: Record<string, string> = {
      lost: 'red',
      won: 'gold',
      'not-participate': 'orange',
      'in-progress': 'blue',
      'completed-visit': 'default',
    }
    return <Tag color={colorMap[status]}>{option?.label}</Tag>
  }

  const getCustomerTagColor = (customerName: string) => {
    const colors: Record<string, string> = {
      '和路雪': 'purple',
      '雀巢': 'green',
    }
    return colors[customerName] || 'blue'
  }

  const getAvatarColor = (name: string) => {
    const colors: Record<string, string> = {
      '黄贤春': '#ffc53d',
      '赵露明': '#ff4d4f',
      '王雄军': '#9254de',
    }
    return colors[name] || '#1890ff'
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  const customerNames = Object.keys(groupedData).sort()

  if (customerNames.length === 0) {
    return <Empty description="暂无KA客户商机" />
  }

  // 计算全局行号
  const getGlobalRowNumber = (customerName: string, localIndex: number) => {
    const currentGroupIndex = customerNames.indexOf(customerName)
    let rowNum = localIndex + 1
    for (let i = 0; i < currentGroupIndex; i++) {
      const name = customerNames[i]
      if (expandedRows.has(name)) {
        rowNum += groupedData[name].length
      }
    }
    return rowNum
  }

  const createColumns = (customerName: string): ColumnsType<Opportunity> => [
    {
      title: '',
      key: 'index',
      width: 50,
      render: (_: any, __: any, index: number) => getGlobalRowNumber(customerName, index),
    },
    {
      title: '事项',
      dataIndex: 'item',
      key: 'item',
      width: 300,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 140,
      render: (time) => formatDate(time, 'YYYY年MM月DD日'),
    },
    {
      title: '客户',
      dataIndex: ['customer', 'name'],
      key: 'customer',
      width: 120,
      render: (name) => <Tag color={getCustomerTagColor(name)}>{name}</Tag>,
    },
    {
      title: '事项重要程度',
      dataIndex: 'importance',
      key: 'importance',
      width: 140,
      render: (importance) => getImportanceTag(importance),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => getTypeTag(type),
    },
    {
      title: '跟进人',
      dataIndex: ['follower', 'name'],
      key: 'follower',
      width: 120,
      render: (name) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size="small" style={{ backgroundColor: getAvatarColor(name) }}>
            {name.charAt(name.length - 1)}
          </Avatar>
          <span>{name}</span>
        </div>
      ),
    },
    {
      title: '计划完成日期',
      dataIndex: 'planCompleteTime',
      key: 'planCompleteTime',
      width: 140,
      render: (time) => formatDate(time, 'YYYY年MM月DD日'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '进展',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      ellipsis: true,
      render: (progress) => progress || '-',
    },
  ]

  const isMobile = isH5()

  if (isMobile) {
    return <BoardKAMobile />
  }

  return (
    <div className="board-ka-page">
      <div className="page-header">
        <h2 className="page-title">KA客户事项看板</h2>
        <Tooltip title="筛选配置">
          <Button
            type="default"
            icon={<SettingOutlined />}
            onClick={handleFilterConfig}
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}
          >
            筛选配置
          </Button>
        </Tooltip>
      </div>
      <div className="board-content">
        {customerNames.map((customerName) => {
          const isExpanded = expandedRows.has(customerName)
          const opportunities = groupedData[customerName]
          const stats = calculateCustomerStats(customerName, opportunities)

          return (
            <div key={customerName} className="customer-group">
              <div
                className="group-header"
                onClick={() => toggleRow(customerName)}
              >
                <div className="group-title">
                  {isExpanded ? <DownOutlined /> : <RightOutlined />}
                  <Tag color={getCustomerTagColor(customerName)}>{customerName}</Tag>
                  <span className="group-stats">
                    <span className="stat-item">商机数：{stats.total}</span>
                    <span className="stat-item">转化率：{stats.conversionRate}%</span>
                    {stats.mainFollower && (
                      <span className="stat-item">总负责人：{stats.mainFollower.name}</span>
                    )}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <>
                  <Table
                    columns={createColumns(customerName)}
                    dataSource={opportunities.map((item) => ({
                      ...item,
                      key: item.id,
                    }))}
                    pagination={false}
                    size="small"
                    className="ka-table"
                    onRow={(record) => ({
                      onClick: () => navigate(`/opportunity/detail/${record.id}`),
                      style: { cursor: 'pointer' },
                    })}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* 筛选配置弹窗 */}
      <Modal
        title="筛选配置"
        open={filterModalVisible}
        onOk={handleFilterSubmit}
        onCancel={() => setFilterModalVisible(false)}
        width={600}
        okText="保存"
        cancelText="取消"
        footer={[
          <Button key="reset" onClick={handleFilterReset}>
            重置
          </Button>,
          <Button key="cancel" onClick={() => setFilterModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleFilterSubmit}>
            保存
          </Button>,
        ]}
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
          <strong style={{ color: '#d46b08' }}>开发备注：</strong>
          <span style={{ color: '#d46b08' }}>权限仅对joyce&ken开放，其他人无权编辑</span>
        </div>
        <Form form={form} layout="vertical">
          <Form.Item
            name="visibleCustomers"
            label="显示/隐藏客户"
            rules={[{ required: true, message: '请选择要显示的客户' }]}
            tooltip="选择要显示的客户，未选中的客户将被隐藏"
          >
            <Checkbox.Group>
              {customerOptions.map(customer => (
                <Checkbox key={customer.id} value={customer.id}>
                  {customer.name}
                </Checkbox>
              ))}
            </Checkbox.Group>
          </Form.Item>

          <Form.Item 
            name="createTimeRange" 
            label="创建时间范围"
            tooltip="筛选商机的创建时间范围"
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="planCompleteTimeRange" 
            label="计划完成时间范围"
            tooltip="筛选商机的计划完成时间范围"
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item 
            name="status" 
            label="状态筛选"
            tooltip="筛选商机的状态"
          >
            <Select mode="multiple" placeholder="请选择状态（可多选）" allowClear>
              {STATUS_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BoardKA
