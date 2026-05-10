/**
 * 数据准备模块 Store
 */
import { defineStore } from 'pinia'
import type { DataPreparationState, TableRow, TableColumn, DataStatistics, ImportHistory } from '@/types/dataPreparation'
import { analyzeDataTypes } from '@/utils/excelUtils'
import { getImportHistory, addImportHistory, clearImportHistory } from '@/utils/storageUtils'

export const useDataPreparationStore = defineStore('dataPreparation', {
  state: (): DataPreparationState => ({
    tableData: [],
    tableColumns: [],
    statistics: null,
    loading: false,
    fileName: '',
    importHistory: []
  }),

  getters: {
    /**
     * 是否有数据
     */
    hasData: (state) => state.tableData.length > 0,

    /**
     * 数据行数
     */
    rowCount: (state) => state.tableData.length,

    /**
     * 数据列数
     */
    columnCount: (state) => state.tableColumns.length,

    /**
     * 列名数组
     */
    columnNames: (state) => state.tableColumns.map(col => col.title)
  },

  actions: {
    /**
     * 初始化导入历史记录
     */
    initImportHistory() {
      this.importHistory = getImportHistory()
    },

    /**
     * 设置表格数据和列配置
     */
    setTableData(data: TableRow[], columns: TableColumn[], fileName: string) {
      this.tableData = data
      this.tableColumns = columns
      this.fileName = fileName
      this.importHistory = addImportHistory(fileName)
      this.updateStatistics()
    },

    /**
     * 更新统计信息
     */
    updateStatistics() {
      if (this.tableData.length === 0 || this.tableColumns.length === 0) {
        this.statistics = null
        return
      }

      const dataTypes = analyzeDataTypes(this.tableData, this.tableColumns)

      this.statistics = {
        totalRows: this.tableData.length,
        totalColumns: this.tableColumns.length,
        columns: this.tableColumns.map(col => col.title),
        fileName: this.fileName,
        importTime: new Date().toLocaleString('zh-CN'),
        dataTypes
      }
    },

    /**
     * 更新单个单元格数据
     */
    updateCell(rowIndex: number, field: string, value: any) {
      if (rowIndex >= 0 && rowIndex < this.tableData.length) {
        this.tableData[rowIndex][field] = value
        this.updateStatistics()
      }
    },

    /**
     * 添加行
     */
    addRow(row?: TableRow) {
      const newRow: TableRow = row || { id: Date.now() }
      
      // 如果没有提供行数据，创建空行
      if (!row) {
        this.tableColumns.forEach(col => {
          newRow[col.field] = ''
        })
      }

      this.tableData.push(newRow)
      this.updateStatistics()
    },

    /**
     * 删除行
     */
    deleteRow(rowIndex: number) {
      if (rowIndex >= 0 && rowIndex < this.tableData.length) {
        this.tableData.splice(rowIndex, 1)
        this.updateStatistics()
      }
    },

    /**
     * 清空数据
     */
    clearData() {
      this.tableData = []
      this.tableColumns = []
      this.statistics = null
      this.fileName = ''
    },

    /**
     * 设置加载状态
     */
    setLoading(loading: boolean) {
      this.loading = loading
    },

    /**
     * 清空导入历史记录
     */
    clearImportHistoryList() {
      clearImportHistory()
      this.importHistory = []
    }
  }
})

