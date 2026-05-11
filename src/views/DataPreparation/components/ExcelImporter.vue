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

    <div v-if="history.length > 0" class="import-history">
      <div class="history-header">
        <span class="history-title">导入历史</span>
        <el-button link type="danger" size="small" @click="handleClearHistory">
          清除记录
        </el-button>
      </div>
      <div class="history-list">
        <div
          v-for="(item, index) in history"
          :key="index"
          class="history-item"
        >
          <el-icon size="14" color="#909399"><Document /></el-icon>
          <div class="history-info">
            <span class="history-filename" :title="item.fileName">{{ item.fileName }}</span>
            <span class="history-time">{{ item.importTime }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Upload, Delete, Document } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import { readExcelFile } from '@/utils/excelUtils'
import { useDataPreparationStore } from '@/stores/dataPreparation'
import { useImportHistory } from '../composables/useImportHistory'

const store = useDataPreparationStore()
const { history, addRecord, clearHistory } = useImportHistory()
const uploadRef = ref()
const currentFile = ref<File | null>(null)
const loading = ref(false)

const handleFileChange = (file: UploadFile) => {
  if (!file.raw) return

  if (file.raw.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 10MB')
    return
  }

  const fileName = file.name.toLowerCase()
  if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
    ElMessage.error('只支持 .xlsx 和 .xls 格式的文件')
    return
  }

  currentFile.value = file.raw
}

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
    addRecord(currentFile.value.name)
    ElMessage.success(`成功导入 ${data.length} 行数据`)
  } catch (error: any) {
    console.error('导入失败:', error)
    ElMessage.error(error.message || '导入失败，请检查文件格式')
  } finally {
    loading.value = false
    store.setLoading(false)
  }
}

const handleClear = () => {
  currentFile.value = null
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

const handleClearHistory = () => {
  clearHistory()
  ElMessage.success('导入历史已清除')
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
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

  .import-history {
    margin-top: 16px;
    border-top: 1px solid #ebeef5;
    padding-top: 12px;

    .history-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;

      .history-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }
    }

    .history-list {
      max-height: 240px;
      overflow-y: auto;

      .history-item {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid #f2f3f5;

        &:last-child {
          border-bottom: none;
        }

        .history-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
          flex: 1;

          .history-filename {
            font-size: 13px;
            color: #303133;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
