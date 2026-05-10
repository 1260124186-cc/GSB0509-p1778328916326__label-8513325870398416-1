# 数据准备模块

基于 Vue 3 + TypeScript + Vite 的数据准备模块，提供 Excel 数据导入、展示、统计和编辑功能。

## 功能特性

- ✅ Excel 文件导入（支持 .xlsx, .xls）
- ✅ 数据表格展示（基于 VXETable）
- ✅ 数据统计信息（表头、行数、列数）
- ✅ 数据在线编辑
- ✅ 数据导出

## 技术栈

- **核心框架**: Vue 3 + TypeScript + Vite
- **UI 组件**: Element Plus + VXETable
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **Excel 处理**: SheetJS (xlsx)

## 快速开始

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

## 项目结构

```
src/
├── views/              # 页面组件
│   └── DataPreparation/  # 数据准备模块
│       ├── index.vue           # 主页面
│       ├── components/         # 子组件
│       │   ├── ExcelImporter.vue    # Excel导入组件
│       │   ├── DataTable.vue        # 数据表格组件
│       │   └── DataStatistics.vue   # 数据统计组件
│       └── composables/        # 组合式函数
│           └── useTableEdit.ts      # 表格编辑逻辑
├── stores/             # Pinia 状态管理
│   └── dataPreparation.ts  # 数据准备模块状态
├── types/              # TypeScript 类型定义
│   └── dataPreparation.ts  # 数据准备模块类型
├── utils/              # 工具函数
│   └── excelUtils.ts       # Excel 处理工具
├── router/             # 路由配置
│   └── index.ts
├── App.vue             # 根组件
└── main.ts             # 应用入口
```

## 使用说明

1. **导入 Excel 文件**: 点击"导入 Excel"按钮，选择 Excel 文件进行导入
2. **查看数据**: 导入后数据会在表格中展示，支持排序、筛选
3. **统计信息**: 页面顶部显示数据的统计信息（行数、列数、表头）
4. **编辑数据**: 双击单元格可以直接编辑数据
5. **导出数据**: 点击"导出 Excel"按钮可以将编辑后的数据导出

