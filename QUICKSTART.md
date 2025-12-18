# 快速开始

## 安装依赖

```bash
npm install
```

## 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
PMS-BD-Process/
├── src/
│   ├── api/              # API接口定义
│   │   ├── opportunity.ts  # 商机相关接口
│   │   ├── customer.ts     # 客户相关接口
│   │   ├── user.ts         # 用户相关接口
│   │   ├── permission.ts   # 权限相关接口
│   │   ├── reminder.ts     # 提醒相关接口
│   │   └── index.ts        # 统一导出
│   ├── components/       # 公共组件
│   │   ├── Layout/        # 布局组件
│   │   └── OpportunityFilter/  # 商机筛选组件
│   ├── pages/           # 页面组件
│   │   ├── Opportunity/   # 商机相关页面
│   │   ├── Customer/      # 客户相关页面
│   │   ├── Board/         # 看板页面
│   │   ├── Permission/    # 权限管理页面
│   │   └── Reminder/      # 提醒设置页面
│   ├── stores/          # 状态管理
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript类型定义
│   ├── router/          # 路由配置
│   └── styles/          # 样式文件
├── public/              # 静态资源
└── docs/                # 文档

```

## 主要功能

### ✅ 已完成

1. **商机列表** - 筛选、排序、查看、编辑
2. **客户管理** - 列表、详情、新增、编辑、去重校验
3. **看板视图** - 上周新增商机看板、KA客户事项看板
4. **权限管理** - 角色配置、字段配置
5. **提醒设置** - 提醒规则配置
6. **响应式设计** - 支持Web端和H5端

### ⚠️ 待后端实现

以下功能需要后端配合实现：

1. **API接口** - 所有后端接口需要按照API文档实现
2. **权限验证** - 后端需要实现权限验证逻辑
3. **提醒推送** - 后端需要实现定时任务，每周一、三、五推送企微消息
4. **客户去重** - 后端需要实现客户名称重复检查
5. **文件上传** - 后端需要实现文件上传接口

## 开发注意事项

1. **API代理** - 开发环境已配置代理到 `http://localhost:8080`
2. **路由** - 使用React Router 6，支持嵌套路由
3. **状态管理** - 使用Zustand进行状态管理
4. **UI组件** - 使用Ant Design 5作为UI组件库
5. **类型检查** - 使用TypeScript，请确保类型正确

## 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录下。

## 预览生产版本

```bash
npm run preview
```

## 常见问题

### Q: 如何配置API地址？

A: 修改 `vite.config.ts` 中的 `server.proxy` 配置，或设置环境变量 `VITE_API_BASE_URL`。

### Q: 如何添加新的页面？

A: 
1. 在 `src/pages/` 下创建页面组件
2. 在 `src/router/index.tsx` 中添加路由配置
3. 在 `src/components/Layout/index.tsx` 中添加菜单项（如需要）

### Q: 如何处理权限？

A: 权限验证逻辑需要在后端实现，前端根据返回的用户角色和权限信息控制页面显示和操作。

## 技术支持

如有问题，请查看详细文档：`docs/USAGE.md`

