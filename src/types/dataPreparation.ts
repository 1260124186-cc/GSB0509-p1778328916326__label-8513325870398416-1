/**
 * 数据准备模块类型定义
 */

/**
 * 表格列定义
 */
export interface TableColumn {
  field: string         // 字段名
  title: string         // 列标题
  width?: number        // 列宽度
  minWidth?: number     // 最小宽度
  type?: string         // 列类型
  editRender?: any      // 编辑配置
}

/**
 * 表格数据行
 */
export interface TableRow {
  [key: string]: any
}

/**
 * 数据统计信息
 */
export interface DataStatistics {
  totalRows: number           // 总行数
  totalColumns: number        // 总列数
  columns: string[]           // 列名数组
  fileName: string            // 文件名
  importTime: string          // 导入时间
  dataTypes: Record<string, string>  // 各列数据类型
}

/**
 * Excel 导入配置
 */
export interface ExcelImportConfig {
  sheetIndex?: number         // 工作表索引，默认0
  headerRow?: number          // 表头行号，默认1
  skipEmptyRows?: boolean     // 是否跳过空行，默认true
}

/**
 * 导入历史记录项
 */
export interface ImportHistoryItem {
  fileName: string          // 文件名
  importTime: string        // 导入时间
}

/**
 * 数据准备模块状态
 */
export interface DataPreparationState {
  tableData: TableRow[]           // 表格数据
  tableColumns: TableColumn[]     // 表格列配置
  statistics: DataStatistics | null  // 统计信息
  loading: boolean                // 加载状态
  fileName: string                // 当前文件名
}
