import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import { OrderItem, OrderStatus } from '@/types/order'
import { mockOrders } from '@/data/orders'
import OrderCard from '@/components/OrderCard'
import styles from './index.module.scss'

type FilterKey = 'all' | OrderStatus

const OrdersPage = () => {
  const [filter, setFilter] = useState<FilterKey>('all')

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return mockOrders
    return mockOrders.filter(o => o.status === filter)
  }, [filter])

  const stats = useMemo(() => {
    const transporting = mockOrders.filter(o => o.status === 'transporting').length
    const alertCount = mockOrders.filter(o => o.hasAlert).length
    const completed = mockOrders.filter(o => o.status === 'completed').length
    return { transporting, alertCount, completed }
  }, [])

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'transporting', label: '运输中' },
    { key: 'abnormal', label: '异常' },
    { key: 'completed', label: '已完成' }
  ]

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.greeting}>鲜链管家</Text>
        <Text className={styles.subGreeting}>实时掌控冷链运输温控安全</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{stats.transporting}</Text>
          <Text className={styles.statLabel}>运输中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={`${styles.statNumber} ${styles.statNumberWarning}`}>{stats.alertCount}</Text>
          <Text className={styles.statLabel}>有预警</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{stats.completed}</Text>
          <Text className={styles.statLabel}>已完成</Text>
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
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => <OrderCard key={order.id} order={order} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无相关订单</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default OrdersPage
