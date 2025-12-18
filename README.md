# BD商机管理系统

## 项目简介

BD商机管理系统用于管理公司BD重要事项（商机）的跟进，支持Web端和H5端（企微）访问。

## 技术栈

- React 18 + TypeScript
- Vite
- Ant Design 5
- React Router 6
- Zustand（状态管理）
- Axios（HTTP请求）
- Day.js（日期处理）

## 功能特性

### 核心功能
1. **商机列表管理**：支持筛选、排序、查看详情
2. **客户管理**：客户列表、详情、创建和关联
3. **看板视图**：上周新增商机看板、KA客户事项看板
4. **事项跟进**：新增、编辑、跟进记录
5. **权限管理**：角色配置、字段配置
6. **提醒功能**：跟进提醒规则设置

### 平台支持
- Web端：完整的后台管理功能
- H5端：适配企微聊天框，支持移动端操作

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 项目结构

```
src/
├── api/              # API接口定义
├── components/       # 公共组件
├── pages/           # 页面组件
├── stores/          # 状态管理
├── utils/           # 工具函数
├── types/           # TypeScript类型定义
├── hooks/           # 自定义Hooks
├── router/          # 路由配置
└── styles/          # 样式文件
```

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

