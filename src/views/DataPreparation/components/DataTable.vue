<template>
  <div class="data-table">
    <div class="table-toolbar">
      <div class="toolbar-left">
        <el-button
          type="primary"
          :icon="Plus"
          @click="handleAddRow"
        >
          添加行
        </el-button>
        <el-button
          type="danger"
          :icon="Delete"
          :disabled="!hasSelection"
          @click="handleDeleteSelected"
        >
          删除选中
        </el-button>
      </div>
      
      <div class="toolbar-right">
        <el-button
          type="success"
          :icon="Download"
          :disabled="!hasData"
          @click="handleExport"
        >
          导出 Excel
        </el-button>
        <el-button
          :icon="Refresh"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </div>
    </div>

    <vxe-table
      ref="tableRef"
      :data="tableData"
      :columns="tableColumns"
      :loading="loading"
      border
      stripe
      resizable
      show-overflow
      highlight-hover-row
      :edit-config="{ trigger: 'dblclick', mode: 'cell' }"
      :checkbox-config="{ checkField: 'checked' }"
      height="600"
      @edit-closed="handleEditClosed"
    >
      <vxe-column type="checkbox" width="60" fixed="left" />
      <vxe-column type="seq" title="序号" width="80" fixed="left" />
      
      <vxe-column
        v-for="col in tableColumns"
        :key="col.field"
        :field="col.field"
        :title="col.title"
        :min-width="col.minWidth"
        :edit-render="col.editRender"
      />
      
      <vxe-column title="操作" width="100" fixed="right">
        <template #default="{ rowIndex }">
          <el-button
            link
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleDeleteRow(rowIndex)"
          >
            删除
          </el-button>
        </template>
      </vxe-column>
    </vxe-table>

    <div class="table-footer">
      <el-text type="info">
        共 {{ tableData.length }} 行数据，{{ tableColumns.length }} 列
      </el-text>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download, Refresh } from '@element-plus/icons-vue'
import type { VxeTableInstance } from 'vxe-table'
import type { TableRow, TableColumn } from '@/types/dataPreparation'
import { exportToExcel } from '@/utils/excelUtils'

interface Props {
  tableData: TableRow[]
  tableColumns: TableColumn[]
  loading?: boolean
}

interface Emits {
  (e: 'update', rowIndex: number, field: string, value: any): void
  (e: 'add-row'): void
  (e: 'delete-row', rowIndex: number): void
  (e: 'refresh'): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const tableRef = ref<VxeTableInstance>()

/**
 * 是否有数据
 */
const hasData = computed(() => props.tableData.length > 0)

/**
 * 是否有选中行
 */
const hasSelection = computed(() => {
  return props.tableData.some(row => row.checked)
})

/**
 * 编辑完成回调
 */
const handleEditClosed = ({ row, column }: any) => {
  const rowIndex = props.tableData.findIndex(r => r === row)
  if (rowIndex !== -1) {
    emit('update', rowIndex, column.field, row[column.field])
  }
}

/**
 * 添加行
 */
const handleAddRow = () => {
  emit('add-row')
}

/**
 * 删除行
 */
const handleDeleteRow = async (rowIndex: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这行数据吗？', '提示', {
      type: 'warning'
    })
    emit('delete-row', rowIndex)
    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

/**
 * 删除选中行
 */
const handleDeleteSelected = async () => {
  const selectedRows = props.tableData.filter(row => row.checked)
  if (selectedRows.length === 0) {
    ElMessage.warning('请先选择要删除的行')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.length} 行数据吗？`,
      '提示',
      { type: 'warning' }
    )

    // 从后往前删除，避免索引变化
    for (let i = props.tableData.length - 1; i >= 0; i--) {
      if (props.tableData[i].checked) {
        emit('delete-row', i)
      }
    }

    ElMessage.success('删除成功')
  } catch {
    // 取消删除
  }
}

/**
 * 导出 Excel
 */
const handleExport = () => {
  try {
    const fileName = `导出数据_${new Date().getTime()}.xlsx`
    exportToExcel(props.tableData, props.tableColumns, fileName)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

/**
 * 刷新
 */
const handleRefresh = () => {
  emit('refresh')
  ElMessage.success('刷新成功')
}
</script>

<style scoped lang="scss">
.data-table {
  width: 100%;
  
  .table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    
    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 10px;
    }
  }
  
  .table-footer {
    margin-top: 16px;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-radius: 4px;
    text-align: right;
  }
}
</style>

