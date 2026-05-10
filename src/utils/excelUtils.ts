/**
 * Excel 处理工具函数
 */
import * as XLSX from 'xlsx'
import type { TableColumn, TableRow, ExcelImportConfig } from '@/types/dataPreparation'

/**
 * 读取 Excel 文件
 * @param file - Excel 文件对象
 * @param config - 导入配置
 * @returns Promise，包含解析后的数据和列配置
 */
export const readExcelFile = (
  file: File,
  config: ExcelImportConfig = {}
): Promise<{ data: TableRow[]; columns: TableColumn[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })

        // 获取第一个工作表
        const sheetIndex = config.sheetIndex || 0
        const sheetName = workbook.SheetNames[sheetIndex]
        const worksheet = workbook.Sheets[sheetName]

        // 将工作表转换为 JSON 数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: !config.skipEmptyRows
        }) as any[][]

        if (jsonData.length === 0) {
          reject(new Error('Excel 文件为空'))
          return
        }

        // 获取表头
        const headerRow = config.headerRow || 0
        const headers = jsonData[headerRow] as string[]

        // 生成列配置
        const columns: TableColumn[] = headers.map((header, index) => ({
          field: `col_${index}`,
          title: header || `列${index + 1}`,
          minWidth: 120,
          editRender: {
            name: 'input'
          }
        }))

        // 转换数据行
        const rows: TableRow[] = []
        for (let i = headerRow + 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (config.skipEmptyRows && (!row || row.length === 0)) {
            continue
          }

          const rowData: TableRow = { id: i }
          headers.forEach((_, index) => {
            rowData[`col_${index}`] = row[index] !== undefined ? row[index] : ''
          })
          rows.push(rowData)
        }

        resolve({ data: rows, columns })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsBinaryString(file)
  })
}

/**
 * 导出数据为 Excel 文件
 * @param data - 表格数据
 * @param columns - 列配置
 * @param fileName - 导出文件名
 */
export const exportToExcel = (
  data: TableRow[],
  columns: TableColumn[],
  fileName: string = '导出数据.xlsx'
) => {
  try {
    // 准备导出数据
    const exportData = [
      // 表头
      columns.map(col => col.title),
      // 数据行
      ...data.map(row => columns.map(col => row[col.field] || ''))
    ]

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(exportData)

    // 设置列宽
    worksheet['!cols'] = columns.map(col => ({
      wch: Math.max(col.minWidth || 120, col.title.length * 2) / 10
    }))

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

    // 导出文件
    XLSX.writeFile(workbook, fileName)
  } catch (error) {
    console.error('导出失败:', error)
    throw new Error('导出 Excel 失败')
  }
}

/**
 * 分析数据类型
 * @param data - 表格数据
 * @param columns - 列配置
 * @returns 各列的数据类型
 */
export const analyzeDataTypes = (
  data: TableRow[],
  columns: TableColumn[]
): Record<string, string> => {
  const types: Record<string, string> = {}

  columns.forEach(col => {
    const values = data.map(row => row[col.field]).filter(v => v !== null && v !== '')

    if (values.length === 0) {
      types[col.title] = '空'
      return
    }

    // 检查是否全是数字
    const allNumbers = values.every(v => !isNaN(Number(v)))
    if (allNumbers) {
      types[col.title] = '数字'
      return
    }

    // 检查是否全是日期
    const allDates = values.every(v => !isNaN(Date.parse(v)))
    if (allDates) {
      types[col.title] = '日期'
      return
    }

    // 默认为文本
    types[col.title] = '文本'
  })

  return types
}

