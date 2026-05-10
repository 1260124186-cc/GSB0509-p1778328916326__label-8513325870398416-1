/**
 * 表格编辑逻辑组合式函数
 */
import { ref, computed } from 'vue'
import { useDataPreparationStore } from '@/stores/dataPreparation'

export const useTableEdit = () => {
  const store = useDataPreparationStore()
  const editingCell = ref<{ rowIndex: number; field: string } | null>(null)

  /**
   * 是否正在编辑
   */
  const isEditing = computed(() => editingCell.value !== null)

  /**
   * 开始编辑
   */
  const startEdit = (rowIndex: number, field: string) => {
    editingCell.value = { rowIndex, field }
  }

  /**
   * 结束编辑
   */
  const endEdit = () => {
    editingCell.value = null
  }

  /**
   * 更新单元格
   */
  const updateCell = (rowIndex: number, field: string, value: any) => {
    store.updateCell(rowIndex, field, value)
  }

  /**
   * 添加行
   */
  const addRow = () => {
    store.addRow()
  }

  /**
   * 删除行
   */
  const deleteRow = (rowIndex: number) => {
    store.deleteRow(rowIndex)
  }

  /**
   * 刷新数据
   */
  const refresh = () => {
    store.updateStatistics()
  }

  return {
    isEditing,
    editingCell,
    startEdit,
    endEdit,
    updateCell,
    addRow,
    deleteRow,
    refresh
  }
}

