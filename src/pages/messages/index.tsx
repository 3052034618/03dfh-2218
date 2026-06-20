import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import styles from './index.module.scss'

type MsgFilter = 'all' | 'arrival' | 'alert' | 'system'

const iconMap: Record<string, { icon: string; styleKey: string }> = {
  alert: { icon: '⚠️', styleKey: 'iconAlert' },
  arrival: { icon: '🚚', styleKey: 'iconArrival' },
  system: { icon: '📋', styleKey: 'iconSystem' }
}

const MessagesPage = () => {
  const [filter, setFilter] = useState<MsgFilter>('all')
  const messages = useAppStore(state => state.messages)

  const filteredMessages = useMemo(() => {
    if (filter === 'all') return messages
    return messages.filter(m => m.type === filter)
  }, [filter, messages])

  const filters: { key: MsgFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'arrival', label: '到货' },
    { key: 'alert', label: '预警' },
    { key: 'system', label: '系统' }
  ]

  const handleMessageClick = (msg: any) => {
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

    if (msg.orderId) {
      Taro.navigateTo({ url: `/pages/transport/index?id=${msg.orderId}` })
    }
  }

  const getActionText = (msg: any) => {
    if (msg.type === 'arrival') {
      return '打开检查单'
    }
    if (msg.type === 'system' && msg.title === '检查单已提交') {
      return '查看详情'
    }
    if (msg.type === 'alert') {
      return '查看预警'
    }
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
        {filteredMessages.length > 0 ? (
          filteredMessages.map(msg => {
            const iconConfig = iconMap[msg.type]
            return (
              <View key={msg.id} className={styles.messageCard} onClick={() => handleMessageClick(msg)}>
                <View className={`${styles.messageIcon} ${styles[iconConfig.styleKey]}`}>
                  <Text>{iconConfig.icon}</Text>
                </View>
                <View className={styles.messageContent}>
                  <View className={styles.messageHeader}>
                    <Text className={styles.messageTitle}>{msg.title}</Text>
                    <Text className={styles.messageTime}>{msg.time.split(' ')[1]}</Text>
                  </View>
                  <Text className={styles.messageBody}>{msg.content}</Text>
                  <View className={styles.messageFooter}>
                    <Text className={styles.messageDate}>{msg.time.split(' ')[0]}</Text>
                    <Text className={styles.actionText}>{getActionText(msg)} →</Text>
                  </View>
                </View>
                {!msg.isRead && <View className={styles.unreadDot} />}
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
