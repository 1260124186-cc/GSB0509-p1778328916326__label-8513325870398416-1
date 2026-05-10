<template>
  <div class="excel-importer">
    <el-upload
      ref="uploadRef"
      class="upload-box"
      drag
      :auto-upload="false"
      :show-file-list="false"
      accept=".xlsx,.xls"
      :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload">
        <upload-filled />
      </el-icon>
      <div class="el-upload__text">
        将 Excel 文件拖到此处，或<em>点击选择文件</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 .xlsx 和 .xls 格式，文件大小不超过 10MB
        </div>
      </template>
    </el-upload>

    <div class="import-actions">
      <el-button
        type="primary"
        :icon="Upload"
        :loading="loading"
        :disabled="!currentFile"
        @click="handleImport"
      >
        {{ loading ? '导入中...' : '开始导入' }}
      </el-button>
      <el-button
        :icon="Delete"
        :disabled="!currentFile || loading"
        @click="handleClear"
      >
        清空
      </el-button>
    </div>

    <div v-if="currentFile" class="file-info">
      <el-tag type="success">
        <el-icon><document /></el-icon>
        {{ currentFile.name }}
      </el-tag>
      <span class="file-size">{{ formatFileSize(currentFile.size) }}</span>
    </div>

    <div v-if="store.importHistory.length > 0" class="history-section">
      <div class="history-header">
        <span class="history-title">
          <el-icon><Clock /></el-icon>
          最近导入记录
        </span>
        <el-button
          link
          type="danger"
          size="small"
          @click="handleClearHistory"
        >
          清空历史
        </el-button>
      </div>
      <div class="history-list">
        <div
          v-for="(item, index) in store.importHistory"
          :key="index"
          class="history-item"
          @click="$emit('select-history', item.fileName)"
        >
          <el-icon class="history-icon"><document /></el-icon>
          <div class="history-content">
            <span class="history-filename">{{ item.fileName }}</span>
            <span class="history-time">{{ item.importTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Upload, Delete, Document, Clock } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { readExcelFile } from '@/utils/excelUtils'
import { useDataPreparationStore } from '@/stores/dataPreparation'

const store = useDataPreparationStore()
const uploadRef = ref()
const currentFile = ref<File | null>(null)
const loading = ref(false)

onMounted(() => {
  store.initImportHistory()
})

/**
 * 文件选择变化
 */
const handleFileChange = (file: UploadFile) => {
  if (!file.raw) return

  // 验证文件大小（10MB）
  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 10MB')
    return
  }

  // 验证文件类型
  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
    ElMessage.error('只支持 .xlsx 和 .xls 格式的文件')
    return
  }

  currentFile.value = file.raw
}

/**
 * 导入 Excel 文件
 */
const handleImport = async () => {
  if (!currentFile.value) {
    ElMessage.warning('请先选择文件')
    return
  }

  loading.value = true
  store.setLoading(true)

  try {
    const { data, columns } = await readExcelFile(currentFile.value)

    if (data.length === 0) {
      ElMessage.warning('Excel 文件中没有数据')
      return
    }

    store.setTableData(data, columns, currentFile.value.name)
    ElMessage.success(`成功导入 ${data.length} 行数据`)
  } catch (error: any) {
    console.error('导入失败:', error)
    ElMessage.error(error.message || '导入失败，请检查文件格式')
  } finally {
    loading.value = false
    store.setLoading(false)
  }
}

/**
 * 清空文件
 */
const handleClear = () => {
  currentFile.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 清空导入历史记录
 */
const handleClearHistory = async () => {
  try {
    await ElMessageBox.confirm('确定要清空所有导入历史记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    store.clearImportHistoryList()
    ElMessage.success('历史记录已清空')
  } catch {
  }
}
</script>

<style scoped lang="scss">
.excel-importer {
  width: 100%;
  
  .upload-box {
    width: 100%;
    
    :deep(.el-upload) {
      width: 100%;
    }
    
    :deep(.el-upload-dragger) {
      width: 100%;
    }
  }
  
  .el-icon--upload {
    font-size: 67px;
    color: #409eff;
    margin-bottom: 16px;
  }
  
  .import-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    justify-content: center;
  }
  
  .file-info {
    margin-top: 16px;
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .el-tag {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .file-size {
      color: #909399;
      font-size: 14px;
    }
  }

  .history-section {
    margin-top: 24px;
    border-top: 1px solid #ebeef5;
    padding-top: 16px;

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .history-title {
        font-weight: 600;
        font-size: 14px;
        color: #303133;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;

      .history-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background-color: #f5f7fa;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;

        &:hover {
          background-color: #ecf5ff;
        }

        .history-icon {
          color: #409eff;
          font-size: 18px;
          flex-shrink: 0;
        }

        .history-content {
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .history-filename {
            font-size: 14px;
            color: #303133;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .history-time {
            font-size: 12px;
            color: #909399;
            margin-top: 2px;
          }
        }
      }
    }
  }
}
</style>

