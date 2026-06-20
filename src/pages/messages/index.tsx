import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import { mockOrders } from '@/data/orders'
import { MessageItem } from '@/types/order'
import styles from './index.module.scss'

type MsgFilter = 'all' | 'arrival' | 'alert' | 'system'

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  alert: { icon: '⚠️', label: '预警', color: 'alert' },
  arrival: { icon: '🚚', label: '到货', color: 'arrival' },
  system: { icon: '📋', label: '系统', color: 'system' }
}

interface OrderGroup {
  groupKey: string
  orderId: string | null
  orderNo: string
  productName: string
  messages: MessageItem[]
  latestTime: string
  unreadCount: number
}

const MessagesPage = () => {
  const [filter, setFilter] = useState<MsgFilter>('all')
  const [expandedKey, setExpandedKey] = useState<string | null>(null)
  const messages = useAppStore(state => state.messages)
  const markMessageAsRead = useAppStore(state => state.markMessageAsRead)

  const orderMap = useMemo(() => {
    const map: Record<string, { orderNo: string; productName: string }> = {}
    mockOrders.forEach(o => {
      map[o.id] = { orderNo: o.orderNo, productName: o.productName }
    })
    return map
  }, [])

  const groups = useMemo<OrderGroup[]>(() => {
    const groupMap = new Map<string, MessageItem[]>()

    messages.forEach(msg => {
      const key = msg.orderId || '__system__'
      if (!groupMap.has(key)) groupMap.set(key, [])
      groupMap.get(key)!.push(msg)
    })

    const result: OrderGroup[] = []

    groupMap.forEach((msgs, key) => {
      const sorted = [...msgs].sort((a, b) => a.time.localeCompare(b.time))

      const orderId = key === '__system__' ? null : key
      const orderInfo = orderId ? orderMap[orderId] : null

      result.push({
        groupKey: key,
        orderId,
        orderNo: orderInfo?.orderNo ?? '系统通知',
        productName: orderInfo?.productName ?? '',
        messages: sorted,
        latestTime: msgs.reduce((latest, m) => (m.time > latest ? m.time : latest), msgs[0].time),
        unreadCount: msgs.filter(m => !m.isRead).length
      })
    })

    result.sort((a, b) => b.latestTime.localeCompare(a.latestTime))
    return result
  }, [messages, orderMap])

  const filteredGroups = useMemo(() => {
    if (filter === 'all') return groups
    return groups.filter(g => g.messages.some(m => m.type === filter))
  }, [filter, groups])

  const filters: { key: MsgFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'arrival', label: '到货' },
    { key: 'alert', label: '预警' },
    { key: 'system', label: '系统' }
  ]

  const handleGroupClick = (group: OrderGroup) => {
    if (expandedKey === group.groupKey) {
      setExpandedKey(null)
      return
    }
    setExpandedKey(group.groupKey)
    if (group.orderId) {
      group.messages.forEach(m => {
        if (!m.isRead) markMessageAsRead(m.id)
      })
    }
  }

  const handleMessageClick = (msg: MessageItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!msg.isRead) markMessageAsRead(msg.id)

    if (msg.type === 'alert' && msg.alertId) {
      Taro.navigateTo({ url: `/pages/alertDetail/index?id=${msg.alertId}` })
      return
    }
    if (msg.type === 'arrival' && msg.orderId) {
      Taro.navigateTo({ url: `/pages/inspection/index?id=${msg.orderId}` })
      return
    }
    if (msg.type === 'system' && msg.title === '检查单已提交' && msg.orderId) {
      Taro.navigateTo({ url: `/pages/inspection/index?id=${msg.orderId}` })
      return
    }
    if (msg.type === 'system' && msg.title === '客服处理更新' && msg.orderId) {
      Taro.navigateTo({ url: `/pages/inspection/index?id=${msg.orderId}` })
      return
    }
    if (msg.orderId) {
      Taro.navigateTo({ url: `/pages/transport/index?id=${msg.orderId}` })
    }
  }

  const handleGroupNavigate = (group: OrderGroup, e: React.MouseEvent) => {
    e.stopPropagation()
    if (group.orderId) {
      Taro.navigateTo({ url: `/pages/transport/index?id=${group.orderId}` })
    }
  }

  const getActionText = (msg: MessageItem) => {
    if (msg.type === 'arrival') return '打开检查单'
    if (msg.type === 'alert') return '查看预警'
    if (msg.type === 'system' && msg.title === '检查单已提交') return '查看详情'
    if (msg.type === 'system' && msg.title === '客服处理更新') return '查看处理'
    return '查看详情'
  }

  const unreadCount = useMemo(() => messages.filter(m => !m.isRead).length, [messages])

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>消息中心</Text>
        <Text className={styles.subtitle}>
          {unreadCount > 0 ? `${unreadCount} 条未读消息 · 收货提醒与预警通知` : '收货提醒与预警通知'}
        </Text>
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

      <ScrollView scrollY className={styles.listContainer} style={{ height: 'calc(100vh - 320rpx)' }}>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => {
            const isExpanded = expandedKey === group.groupKey
            return (
              <View key={group.groupKey} className={styles.orderGroup}>
                <View className={styles.orderGroupHeader} onClick={() => handleGroupClick(group)}>
                  <View className={styles.orderInfo}>
                    <Text className={styles.orderNo}>{group.orderNo}</Text>
                    {group.productName ? (
                      <Text className={styles.orderProduct}>{group.productName}</Text>
                    ) : null}
                  </View>
                  <View className={styles.orderMeta}>
                    <Text className={styles.orderTime}>{group.latestTime.split(' ')[1]}</Text>
                    {group.unreadCount > 0 ? (
                      <Text className={styles.orderBadge}>
                        {group.unreadCount > 99 ? '99+' : group.unreadCount}
                      </Text>
                    ) : null}
                    <Text className={classnames(styles.expandArrow, isExpanded && styles.expandArrowOpen)}>
                      ▸
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <View className={styles.orderTimeline}>
                    {group.messages.map(msg => {
                      const cfg = typeConfig[msg.type]
                      return (
                        <View key={msg.id} className={styles.timelineItem}>
                          <View className={classnames(styles.timelineDot, styles[`dot${cfg.color}`])} />
                          <View className={styles.timelineContent}>
                            <View className={styles.timelineTop}>
                              <Text className={classnames(styles.timelineType, styles[`tag${cfg.color}`])}>
                                {cfg.icon} {cfg.label}
                              </Text>
                              <Text className={styles.timelineTime}>{msg.time.split(' ')[1]}</Text>
                            </View>
                            <Text className={styles.timelineTitle}>{msg.title}</Text>
                            <Text className={styles.timelineText}>{msg.content}</Text>
                            <Text
                              className={styles.timelineAction}
                              onClick={(e) => handleMessageClick(msg, e)}
                            >
                              {getActionText(msg)} →
                            </Text>
                          </View>
                        </View>
                      )
                    })}
                    {group.orderId && (
                      <Text
                        className={styles.timelineAction}
                        onClick={(e) => handleGroupNavigate(group, e)}
                      >
                        查看运输详情 →
                      </Text>
                    )}
                  </View>
                )}
              </View>
            )
          })
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无消息</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

export default MessagesPage
