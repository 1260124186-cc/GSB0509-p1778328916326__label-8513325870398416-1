import type { ImportHistory } from '@/types/dataPreparation'

const HISTORY_KEY = 'excel_import_history'
const MAX_HISTORY_COUNT = 10

export const saveImportHistory = (history: ImportHistory[]): void => {
  try {
    const data = JSON.stringify(history)
    if (data.length > 5 * 1024 * 1024) {
      console.warn('导入历史记录数据超过 5MB 限制，已自动截断')
      const truncatedHistory = history.slice(0, 5)
      localStorage.setItem(HISTORY_KEY, JSON.stringify(truncatedHistory))
      return
    }
    localStorage.setItem(HISTORY_KEY, data)
  } catch (error) {
    console.error('保存导入历史记录失败:', error)
  }
}

export const getImportHistory = (): ImportHistory[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    if (!data) return []
    return JSON.parse(data)
  } catch (error) {
    console.error('读取导入历史记录失败:', error)
    return []
  }
}

export const addImportHistory = (fileName: string): ImportHistory[] => {
  const history = getImportHistory()

  const newRecord: ImportHistory = {
    fileName,
    importTime: new Date().toLocaleString('zh-CN')
  }

  const filteredHistory = history.filter(item => item.fileName !== fileName)
  filteredHistory.unshift(newRecord)

  const trimmedHistory = filteredHistory.slice(0, MAX_HISTORY_COUNT)
  saveImportHistory(trimmedHistory)

  return trimmedHistory
}

export const clearImportHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error('清空导入历史记录失败:', error)
  }
}
