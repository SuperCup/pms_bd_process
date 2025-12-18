import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import OpportunityList from '@/pages/Opportunity/List'
import OpportunityDetail from '@/pages/Opportunity/Detail'
import OpportunityEdit from '@/pages/Opportunity/Edit'
import CustomerList from '@/pages/Customer/List'
import CustomerDetail from '@/pages/Customer/Detail'
import CustomerEdit from '@/pages/Customer/Edit'
import BoardLastWeek from '@/pages/Board/LastWeek'
import BoardKA from '@/pages/Board/KA'
import Permission from '@/pages/Permission'
import Reminder from '@/pages/Reminder'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/opportunity/list" replace />,
      },
      {
        path: 'opportunity/list',
        element: <OpportunityList />,
      },
      {
        path: 'opportunity/detail/:id',
        element: <OpportunityDetail />,
      },
      {
        path: 'opportunity/edit/:id?',
        element: <OpportunityEdit />,
      },
      {
        path: 'customer/list',
        element: <CustomerList />,
      },
      {
        path: 'customer/detail/:id',
        element: <CustomerDetail />,
      },
      {
        path: 'customer/edit/:id?',
        element: <CustomerEdit />,
      },
      {
        path: 'board/last-week',
        element: <BoardLastWeek />,
      },
      {
        path: 'board/ka',
        element: <BoardKA />,
      },
      {
        path: 'permission',
        element: <Permission />,
      },
      {
        path: 'reminder',
        element: <Reminder />,
      },
    ],
  },
])

export default router

