import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import { AlertLevel } from '@/types/order'
import { useAppStore } from '@/store'
import AlertCard from '@/components/AlertCard'
import styles from './index.module.scss'

type AlertFilter = 'all' | AlertLevel

const AlertsPage = () => {
  const [filter, setFilter] = useState<AlertFilter>('all')
  const alerts = useAppStore(state => state.alerts)

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts
    return alerts.filter(a => a.level === filter)
  }, [filter, alerts])

  const stats = useMemo(() => {
    const severe = alerts.filter(a => a.level === 'severe').length
    const warning = alerts.filter(a => a.level === 'warning').length
    const normal = alerts.filter(a => a.level === 'normal').length
    return { severe, warning, normal }
  }, [alerts])

  const filters: { key: AlertFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'severe', label: '严重' },
    { key: 'warning', label: '注意' },
    { key: 'normal', label: '已恢复' }
  ]

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>回温预警</Text>
        <Text className={styles.subtitle}>实时监控运输温控异常</Text>
      </View>

      <View className={styles.summaryRow}>
        <View className={styles.summaryCard}>
          <Text className={`${styles.summaryNumber} ${styles.severeNum}`}>{stats.severe}</Text>
          <Text className={styles.summaryLabel}>严重预警</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={`${styles.summaryNumber} ${styles.warningNum}`}>{stats.warning}</Text>
          <Text className={styles.summaryLabel}>注意预警</Text>
        </View>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryNumber}>{stats.normal}</Text>
          <Text className={styles.summaryLabel}>已恢复</Text>
        </View>
      </View>

      <View className={styles.filterBar}>
        {filters.map(f => (
          <Text
            key={f.key}
            className={classnames(styles.filterBtn, filter === f.key && styles.filterBtnActive)}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Text>
        ))}
      </View>

      <ScrollView scrollY className={styles.listContainer} style={{ height: 'calc(100vh - 400rpx)' }}>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无预警信息</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default AlertsPage
