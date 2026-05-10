<template>
  <div v-if="statistics" class="data-statistics">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><data-analysis /></el-icon>
          <span>数据统计信息</span>
        </div>
      </template>

      <div class="statistics-content">
        <!-- 基础信息 -->
        <div class="info-section">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件名" label-class-name="label">
              <el-tag>{{ statistics.fileName }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="导入时间" label-class-name="label">
              {{ statistics.importTime }}
            </el-descriptions-item>
            <el-descriptions-item label="数据行数" label-class-name="label">
              <el-tag type="success">{{ statistics.totalRows }} 行</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="数据列数" label-class-name="label">
              <el-tag type="warning">{{ statistics.totalColumns }} 列</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 列信息 -->
        <div class="columns-section">
          <el-divider content-position="left">
            <el-icon><menu /></el-icon>
            列信息（表头）
          </el-divider>
          <div class="columns-list">
            <el-tag
              v-for="(column, index) in statistics.columns"
              :key="index"
              class="column-tag"
              type="info"
            >
              <span class="column-index">{{ index + 1 }}.</span>
              <span class="column-name">{{ column }}</span>
              <el-divider direction="vertical" />
              <span class="column-type">{{ statistics.dataTypes[column] }}</span>
            </el-tag>
          </div>
        </div>

        <!-- 数据类型分布 -->
        <div class="types-section">
          <el-divider content-position="left">
            <el-icon><pie-chart /></el-icon>
            数据类型分布
          </el-divider>
          <div class="types-distribution">
            <el-space wrap>
              <el-tag
                v-for="(type, count) in typeDistribution"
                :key="type"
                :type="getTypeColor(type)"
                size="large"
              >
                {{ type }}: {{ count }} 列
              </el-tag>
            </el-space>
          </div>
        </div>
      </div>
    </el-card>
  </div>
  <el-empty v-else description="暂无数据统计信息" :image-size="120" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DataAnalysis, Menu, PieChart } from '@element-plus/icons-vue'
import type { DataStatistics } from '@/types/dataPreparation'

interface Props {
  statistics: DataStatistics | null
}

const props = defineProps<Props>()

/**
 * 数据类型分布统计
 */
const typeDistribution = computed(() => {
  if (!props.statistics) return {}

  const distribution: Record<string, number> = {}
  Object.values(props.statistics.dataTypes).forEach(type => {
    distribution[type] = (distribution[type] || 0) + 1
  })
  return distribution
})

/**
 * 获取类型标签颜色
 */
const getTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    '数字': 'success',
    '文本': 'primary',
    '日期': 'warning',
    '空': 'info'
  }
  return colorMap[type] || 'default'
}
</script>

<style scoped lang="scss">
.data-statistics {
  width: 100%;
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
  }
  
  .statistics-content {
    .info-section {
      margin-bottom: 20px;
      
      :deep(.label) {
        font-weight: 600;
      }
    }
    
    .columns-section {
      margin-bottom: 20px;
      
      .el-divider {
        margin: 16px 0;
        
        :deep(.el-divider__text) {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
      }
      
      .columns-list {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        
        .column-tag {
          padding: 8px 12px;
          height: auto;
          
          .column-index {
            font-weight: 600;
            margin-right: 4px;
          }
          
          .column-name {
            font-weight: 500;
          }
          
          .column-type {
            color: #909399;
            font-size: 12px;
          }
        }
      }
    }
    
    .types-section {
      .el-divider {
        margin: 16px 0;
        
        :deep(.el-divider__text) {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
      }
      
      .types-distribution {
        padding: 10px;
        background-color: #f5f7fa;
        border-radius: 4px;
      }
    }
  }
}
</style>

