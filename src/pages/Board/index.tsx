import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Tabs } from 'antd'
import BoardLastWeek from './LastWeek'
import BoardKA from './KA'
import { isH5 } from '@/utils'
import './index.less'

const Board: React.FC = () => {
  const isMobile = isH5()
  const location = useLocation()
  const navigate = useNavigate()
  
  // 根据路由确定默认tab
  const getDefaultTab = () => {
    if (location.pathname.includes('/ka')) return 'ka'
    return 'last-week'
  }
  
  const [activeTab, setActiveTab] = useState(getDefaultTab())
  
  useEffect(() => {
    const tab = getDefaultTab()
    setActiveTab(tab)
  }, [location.pathname])
  
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    if (key === 'ka') {
      navigate('/board/ka')
    } else {
      navigate('/board/last-week')
    }
  }

  const tabItems = [
    {
      key: 'last-week',
      label: '上周新增商机',
      children: <BoardLastWeek />,
    },
    {
      key: 'ka',
      label: 'KA客户事项',
      children: <BoardKA />,
    },
  ]

  // Web端直接显示对应页面，不使用tab
  if (!isMobile) {
    if (location.pathname.includes('/ka')) {
      return <BoardKA />
    }
    return <BoardLastWeek />
  }

  // 移动端使用tab切换
  return (
    <div className="board-page">
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={tabItems}
        className="mobile-tabs"
      />
    </div>
  )
}

export default Board

