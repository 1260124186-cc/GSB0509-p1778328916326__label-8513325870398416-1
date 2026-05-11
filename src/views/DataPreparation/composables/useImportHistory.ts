import { ref } from 'vue'
import type { ImportHistoryItem } from '@/types/dataPreparation'

const STORAGE_KEY = 'excel_import_history'
const MAX_ITEMS = 10
const MAX_STORAGE_BYTES = 5 * 1024 * 1024

function loadFromStorage(): ImportHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX_ITEMS)
  } catch {
    return []
  }
}

function saveToStorage(items: ImportHistoryItem[]): boolean {
  try {
    const json = JSON.stringify(items)
    const bytes = new Blob([json]).size
    if (bytes > MAX_STORAGE_BYTES) {
      const trimmed = items.slice(0, Math.max(1, Math.floor(MAX_ITEMS / 2)))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
      return false
    }
    localStorage.setItem(STORAGE_KEY, json)
    return true
  } catch {
    return false
  }
}

const history = ref<ImportHistoryItem[]>(loadFromStorage())

export function useImportHistory() {
  const addRecord = (fileName: string) => {
    const record: ImportHistoryItem = {
      fileName,
      importTime: new Date().toLocaleString('zh-CN')
    }
    const updated = [record, ...history.value].slice(0, MAX_ITEMS)
    if (saveToStorage(updated)) {
      history.value = updated
    }
  }

  const clearHistory = () => {
    history.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    history,
    addRecord,
    clearHistory
  }
}
