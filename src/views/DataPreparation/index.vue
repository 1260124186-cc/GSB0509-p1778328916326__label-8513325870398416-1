<template>
  <div class="data-preparation-page">
    <div class="page-header">
      <el-page-header @back="handleBack">
        <template #icon>
          <el-icon><data-board /></el-icon>
        </template>
        <template #content>
          <span class="page-title">数据准备模块</span>
        </template>
        <template #extra>
          <el-space>
            <el-button
              v-if="hasData"
              type="danger"
              :icon="Delete"
              @click="handleClearData"
            >
              清空数据
            </el-button>
          </el-space>
        </template>
      </el-page-header>
    </div>

    <div class="page-content">
      <el-row :gutter="20">
        <!-- 左侧：Excel 导入 -->
        <el-col :xs="24" :sm="24" :md="8" :lg="6">
          <el-card shadow="hover" class="import-card">
            <template #header>
              <div class="card-header">
                <el-icon><upload-filled /></el-icon>
                <span>Excel 导入</span>
              </div>
            </template>
            <excel-importer />
          </el-card>
        </el-col>

        <!-- 右侧：数据展示和统计 -->
        <el-col :xs="24" :sm="24" :md="16" :lg="18">
          <!-- 数据统计信息 -->
          <div v-if="hasData" class="statistics-section">
            <data-statistics :statistics="statistics" />
          </div>

          <!-- 数据表格 -->
          <div v-if="hasData" class="table-section">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <el-icon><grid /></el-icon>
                  <span>数据表格</span>
                </div>
              </template>
              <data-table
                :table-data="tableData"
                :table-columns="tableColumns"
                :loading="loading"
                @update="handleCellUpdate"
                @add-row="handleAddRow"
                @delete-row="handleDeleteRow"
                @refresh="handleRefresh"
              />
            </el-card>
          </div>

          <!-- 空状态 -->
          <div v-else class="empty-state">
            <el-empty
              description="请先导入 Excel 文件"
              :image-size="200"
            >
              <template #image>
                <el-icon :size="200" color="#909399">
                  <data-board />
                </el-icon>
              </template>
            </el-empty>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { DataBoard, UploadFilled, Delete, Grid } from '@element-plus/icons-vue'
import { useDataPreparationStore } from '@/stores/dataPreparation'
import { useTableEdit } from './composables/useTableEdit'
import ExcelImporter from './components/ExcelImporter.vue'
import DataStatistics from './components/DataStatistics.vue'
import DataTable from './components/DataTable.vue'

const store = useDataPreparationStore()
const { updateCell, addRow, deleteRow, refresh } = useTableEdit()

// 从 store 获取数据
const tableData = computed(() => store.tableData)
const tableColumns = computed(() => store.tableColumns)
const statistics = computed(() => store.statistics)
const loading = computed(() => store.loading)
const hasData = computed(() => store.hasData)

/**
 * 返回上一页
 */
const handleBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    ElMessage.info('当前页面没有可返回的历史记录')
  }
}

/**
 * 单元格更新
 */
const handleCellUpdate = (rowIndex: number, field: string, value: any) => {
  updateCell(rowIndex, field, value)
}

/**
 * 添加行
 */
const handleAddRow = () => {
  addRow()
  ElMessage.success('添加行成功')
}

/**
 * 删除行
 */
const handleDeleteRow = (rowIndex: number) => {
  deleteRow(rowIndex)
}

/**
 * 刷新
 */
const handleRefresh = () => {
  refresh()
}

/**
 * 清空数据
 */
const handleClearData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有数据吗？此操作不可恢复。',
      '警告',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    store.clearData()
    ElMessage.success('数据已清空')
  } catch {
    // 取消操作
  }
}
</script>

<style scoped lang="scss">
.data-preparation-page {
  padding: 20px;
  min-height: 100vh;
  background-color: #f0f2f5;

  .page-header {
    margin-bottom: 20px;
    padding: 16px 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .page-title {
      font-size: 20px;
      font-weight: 600;
    }
  }

  .page-content {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 16px;
    }

    .import-card {
      margin-bottom: 20px;
      
      @media (min-width: 768px) {
        position: sticky;
        top: 20px;
        margin-bottom: 0;
      }
    }

    .statistics-section {
      margin-bottom: 20px;
    }

    .table-section {
      margin-bottom: 20px;
    }

    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>

