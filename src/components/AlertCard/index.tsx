import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AlertItem } from '@/types/order'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

interface AlertCardProps {
  alert: AlertItem
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/alertDetail/index?id=${alert.id}` })
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.headerLeft}>
          <StatusTag level={alert.level} type='alert' />
          <Text className={styles.timeText}>{alert.time.split(' ')[1]}</Text>
        </View>
        {!alert.isRead && <View className={styles.unreadDot} />}
      </View>
      <Text className={styles.productName}>{alert.productName}</Text>
      <Text className={styles.description}>{alert.description}</Text>
      <View className={styles.suggestionBox}>
        <Text className={styles.suggestionIcon}>💡</Text>
        <Text className={styles.suggestionText}>{alert.suggestion}</Text>
      </View>
      <View className={styles.cardFooter}>
        <Text className={styles.orderNo}>{alert.orderNo}</Text>
        <Text className={styles.viewDetail}>查看详情 →</Text>
      </View>
    </View>
  )
}

export default AlertCard
