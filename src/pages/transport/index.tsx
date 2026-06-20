import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { mockOrders } from '@/data/orders'
import { useAppStore } from '@/store'
import TemperatureBadge from '@/components/TemperatureBadge'
import StatusTag from '@/components/StatusTag'
import TempChart from '@/components/TempChart'
import { AlertLevel } from '@/types/order'
import styles from './index.module.scss'

const TransportPage = () => {
  const router = useRouter()
  const [order, setOrder] = useState(mockOrders[0])
  const [orderAlerts, setOrderAlerts] = useState<any[]>([])
  const alerts = useAppStore(state => state.alerts)
  const hasInspectionRecord = useAppStore(state => state.hasInspectionRecord)

  useEffect(() => {
    const id = router.params.id
    if (id) {
      const found = mockOrders.find(o => o.id === id)
      if (found) {
        setOrder(found)
        const orderAlertList = alerts.filter(a => a.orderId === id)
        setOrderAlerts(orderAlertList)
      } else {
        console.error('[TransportPage] order not found:', id)
      }
    }
  }, [router.params.id, alerts])

  const isOverTemp = order.currentTemp > order.tempRequireMax
  const hasSevereAlert = orderAlerts.some(a => a.level === 'severe')
  const inspectionSubmitted = hasInspectionRecord(order.id)

  const handleOpenInspection = () => {
    Taro.navigateTo({ url: `/pages/inspection/index?id=${order.id}` })
  }

  const handleOpenAlert = (alertId: string) => {
    Taro.navigateTo({ url: `/pages/alertDetail/index?id=${alertId}` })
  }

  const isArrivingSoon = () => {
    if (order.status === 'completed') return false
    const estTime = order.estimatedArrival.split(' ')[1]
    const now = new Date()
    const [h, m] = estTime.split(':').map(Number)
    const estMinutes = h * 60 + m
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const diff = estMinutes - nowMinutes
    return diff > 0 && diff <= 90
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
        <View className={styles.locationCard}>
          <Text className={styles.locationTitle}>车辆当前位置</Text>
          <Text className={styles.locationAddress}>{order.currentLocation}</Text>
          <View className={styles.routeProgress}>
            <Text className={styles.routeFrom}>{order.origin}</Text>
            <View className={styles.routeBar}>
              <View className={styles.routeBarFill} style={{ width: `${order.progress}%` }} />
            </View>
            <Text className={styles.routeTo}>{order.destination}</Text>
          </View>
          <Text className={styles.progressText}>运输进度 {order.progress}%</Text>
        </View>

        {isArrivingSoon() && (
          <View className={styles.arrivalReminder}>
            <Text className={styles.reminderIcon}>⏰</Text>
            <View className={styles.reminderContent}>
              <Text className={styles.reminderTitle}>即将到仓</Text>
              <Text className={styles.reminderDesc}>预计{order.estimatedArrival.split(' ')[1]}到达，请准备收货</Text>
            </View>
            <Text className={styles.reminderBtn} onClick={handleOpenInspection}>
              打开检查单
            </Text>
          </View>
        )}

        {hasSevereAlert && (
          <View className={styles.severeWarning}>
            <Text className={styles.warningIcon}>⚠️</Text>
            <View className={styles.warningContent}>
              <Text className={styles.warningTitle}>严重回温预警</Text>
              <Text className={styles.warningDesc}>
                该订单出现严重回温，请重点检查{order.tempZone === 'chilled' ? '冷鲜肉' : order.tempZone === 'frozen' ? '冷冻品' : '果品'}品质
              </Text>
            </View>
          </View>
        )}

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
            {inspectionSubmitted && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>检查单状态</Text>
                <Text className={styles.infoValue} style={{ color: '#00B42A' }}>已提交</Text>
              </View>
            )}
          </View>

          <View className={styles.chartSection}>
            <TempChart
              records={order.tempRecords}
              tempMin={order.tempRequireMin}
              tempMax={order.tempRequireMax}
            />
          </View>

          {orderAlerts.length > 0 && (
            <View className={styles.alertSection}>
              <Text className={styles.alertSectionTitle}>异常事件</Text>
              {orderAlerts.map(alert => (
                <View
                  key={alert.id}
                  className={styles.alertItem}
                  onClick={() => handleOpenAlert(alert.id)}
                >
                  <View className={styles.alertItemHeader}>
                    <StatusTag level={alert.level as AlertLevel} type='alert' />
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
          onClick={handleOpenInspection}
        >
          <Text>{inspectionSubmitted ? '查看检查单' : '到货检查单'}</Text>
        </View>
        {order.hasAlert && orderAlerts.length > 0 && (
          <View
            className={styles.btnAlert}
            onClick={() => handleOpenAlert(orderAlerts[0]?.id)}
          >
            <Text>查看预警</Text>
          </View>
        )}
      </View>
    </View>
  )
}

export default TransportPage
