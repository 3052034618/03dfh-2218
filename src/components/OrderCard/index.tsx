import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { OrderItem } from '@/types/order'
import TemperatureBadge from '@/components/TemperatureBadge'
import StatusTag from '@/components/StatusTag'
import styles from './index.module.scss'

interface OrderCardProps {
  order: OrderItem
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const handleClick = () => {
    Taro.navigateTo({ url: `/pages/transport/index?id=${order.id}` })
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <Text className={styles.orderNo}>{order.orderNo}</Text>
        <StatusTag status={order.status} type='order' />
      </View>
      <View className={styles.cardBody}>
        <Image
          className={styles.thumbnail}
          src={order.thumbnail}
          mode='aspectFill'
        />
        <View className={styles.info}>
          <Text className={styles.productName}>{order.productName}</Text>
          <TemperatureBadge
            zone={order.tempZone}
            min={order.tempRequireMin}
            max={order.tempRequireMax}
            currentTemp={order.currentTemp}
            showCurrent
          />
          <View className={styles.routeInfo}>
            <Text className={styles.routeText}>{order.origin}</Text>
            <Text className={styles.arrow}>→</Text>
            <Text className={styles.routeText}>{order.destination}</Text>
          </View>
        </View>
      </View>
      <View className={styles.cardFooter}>
        <View className={styles.footerLeft}>
          <Text className={styles.vehicleText}>{order.vehicleNo}</Text>
          <Text className={styles.timeText}>预计 {order.estimatedArrival.split(' ')[1]} 到达</Text>
        </View>
        {order.hasAlert && (
          <View className={styles.alertBadge}>
            <Text className={styles.alertText}>{order.alertCount}条预警</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default OrderCard
