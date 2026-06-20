import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { mockOrders, mockTempRecords, mockAlerts } from '@/data/orders'
import TemperatureBadge from '@/components/TemperatureBadge'
import StatusTag from '@/components/StatusTag'
import TempChart from '@/components/TempChart'
import styles from './index.module.scss'

const TransportPage = () => {
  const router = useRouter()
  const [order, setOrder] = useState(mockOrders[0])

  useEffect(() => {
    const id = router.params.id
    if (id) {
      const found = mockOrders.find(o => o.id === id)
      if (found) {
        setOrder(found)
      } else {
        console.error('[TransportPage] order not found:', id)
      }
    }
  }, [router.params.id])

  const orderAlerts = mockAlerts.filter(a => a.orderId === order.id)

  const isOverTemp = order.currentTemp > order.tempRequireMax

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
        <View className={styles.locationCard}>
          <Text className={styles.locationTitle}>车辆当前位置</Text>
          <Text className={styles.locationAddress}>{order.currentLocation || '京港澳高速 韶关服务区附近'}</Text>
          <View className={styles.routeProgress}>
            <Text className={styles.routeFrom}>{order.origin}</Text>
            <View className={styles.routeBar}>
              <View className={styles.routeBarFill} style={{ width: `${order.progress || 65}%` }} />
            </View>
            <Text className={styles.routeTo}>{order.destination}</Text>
          </View>
        </View>

        <View className={styles.contentArea}>
          <View className={styles.tempCard}>
            <View className={styles.tempHeader}>
              <Text className={styles.tempTitle}>温控状态</Text>
              <TemperatureBadge
                zone={order.tempZone}
                min={order.tempRequireMin}
                max={order.tempRequireMax}
              />
            </View>
            <View className={styles.tempValues}>
              <View className={styles.tempValueItem}>
                <Text className={styles.tempValueLabel}>要求温区</Text>
                <Text className={styles.tempValueNumber}>
                  {order.tempRequireMin}~{order.tempRequireMax}
                </Text>
                <Text className={styles.tempValueUnit}>℃</Text>
              </View>
              <View className={styles.tempValueItem}>
                <Text className={styles.tempValueLabel}>当前厢温</Text>
                <Text className={`${styles.tempValueNumber} ${isOverTemp ? styles.overTemp : ''}`}>
                  {order.currentTemp}
                </Text>
                <Text className={styles.tempValueUnit}>℃</Text>
              </View>
              <View className={styles.tempValueItem}>
                <Text className={styles.tempValueLabel}>预计到达</Text>
                <Text className={styles.tempValueNumber}>
                  {order.estimatedArrival.split(' ')[1]}
                </Text>
                <Text className={styles.tempValueUnit}>今日</Text>
              </View>
            </View>
          </View>

          <View className={styles.infoCard}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>订单号</Text>
              <Text className={styles.infoValue}>{order.orderNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>品名</Text>
              <Text className={styles.infoValue}>{order.productName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>车牌</Text>
              <Text className={styles.infoValue}>{order.vehicleNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>出发时间</Text>
              <Text className={styles.infoValue}>{order.departureTime}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>运输状态</Text>
              <StatusTag status={order.status} type='order' />
            </View>
          </View>

          <View className={styles.chartSection}>
            <TempChart
              records={mockTempRecords}
              tempMin={order.tempRequireMin}
              tempMax={order.tempRequireMax}
            />
          </View>

          {orderAlerts.length > 0 && (
            <View className={styles.alertSection}>
              <Text className={styles.alertSectionTitle}>异常事件</Text>
              {orderAlerts.map(alert => (
                <View key={alert.id} className={styles.alertItem}>
                  <View className={styles.alertItemHeader}>
                    <StatusTag level={alert.level} type='alert' />
                    <Text className={styles.alertTime}>{alert.time}</Text>
                  </View>
                  <Text className={styles.alertDesc}>{alert.description}</Text>
                  <View className={styles.alertSuggestion}>
                    <Text>💡 {alert.suggestion}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={styles.btnInspection}
          onClick={() => Taro.navigateTo({ url: `/pages/inspection/index?id=${order.id}` })}
        >
          <Text>到货检查单</Text>
        </View>
        {order.hasAlert && (
          <View
            className={styles.btnAlert}
            onClick={() => Taro.navigateTo({ url: `/pages/alertDetail/index?id=${orderAlerts[0]?.id}` })}
          >
            <Text>查看预警</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default TransportPage
