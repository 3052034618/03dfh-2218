import React from 'react'
import { View, Text } from '@tarojs/components'
import { OrderStatus, AlertLevel } from '@/types/order'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatusTagProps {
  status?: OrderStatus
  level?: AlertLevel
  type: 'order' | 'alert'
}

const orderStatusMap: Record<OrderStatus, { label: string; styleKey: string }> = {
  transporting: { label: '运输中', styleKey: 'transporting' },
  completed: { label: '已完成', styleKey: 'completed' },
  abnormal: { label: '异常', styleKey: 'abnormal' }
}

const alertLevelMap: Record<AlertLevel, { label: string; styleKey: string }> = {
  normal: { label: '已恢复', styleKey: 'normal' },
  warning: { label: '注意', styleKey: 'warning' },
  severe: { label: '严重', styleKey: 'severe' }
}

const StatusTag: React.FC<StatusTagProps> = ({ status, level, type }) => {
  if (type === 'order' && status) {
    const config = orderStatusMap[status]
    return (
      <View className={`${styles.tag} ${styles[config.styleKey]}`}>
        <Text className={styles.tagText}>{config.label}</Text>
      </View>
    )
  }
  if (type === 'alert' && level) {
    const config = alertLevelMap[level]
    return (
      <View className={classnames(styles.tag, styles[config.styleKey])}>
        <Text className={styles.tagText}>{config.label}</Text>
      </View>
    )
  }
  return null
}

export default StatusTag
