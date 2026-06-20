import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { mockAlerts } from '@/data/orders'
import { AlertLevel } from '@/types/order'
import classnames from 'classnames'
import styles from './index.module.scss'

const levelHeaderMap: Record<AlertLevel, { label: string; styleKey: string }> = {
  severe: { label: '严重回温预警', styleKey: 'severeBg' },
  warning: { label: '回温注意预警', styleKey: 'warningBg' },
  normal: { label: '温度已恢复', styleKey: 'normalBg' }
}

const AlertDetailPage = () => {
  const router = useRouter()
  const [alert, setAlert] = useState(mockAlerts[0])

  useEffect(() => {
    const id = router.params.id
    if (id) {
      const found = mockAlerts.find(a => a.id === id)
      if (found) {
        setAlert(found)
      } else {
        console.error('[AlertDetailPage] alert not found:', id)
      }
    }
  }, [router.params.id])

  const headerConfig = levelHeaderMap[alert.level]

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
        <View className={classnames(styles.alertHeader, styles[headerConfig.styleKey])}>
          <Text className={styles.levelLabel}>{headerConfig.label}</Text>
          <Text className={styles.levelDesc}>{alert.description}</Text>
        </View>

        <View className={styles.contentArea}>
          <View className={styles.infoCard}>
            <Text className={styles.cardTitle}>预警信息</Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>订单号</Text>
              <Text className={styles.infoValue}>{alert.orderNo}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>品名</Text>
              <Text className={styles.infoValue}>{alert.productName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>要求温度</Text>
              <Text className={styles.infoValue}>≤{alert.tempRequireMax}℃</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>当前温度</Text>
              <Text className={styles.infoValue}>{alert.currentTemp}℃</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>持续时间</Text>
              <Text className={styles.infoValue}>{alert.durationMinutes}分钟</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>发生时间</Text>
              <Text className={styles.infoValue}>{alert.time}</Text>
            </View>
          </View>

          <View className={styles.impactCard}>
            <Text className={styles.cardTitle}>影响评估</Text>
            <Text className={styles.impactContent}>{alert.impactAssessment}</Text>
          </View>

          <View className={styles.suggestionCard}>
            <Text className={styles.cardTitle}>操作建议</Text>
            <Text className={styles.suggestionContent}>{alert.suggestion}</Text>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Text
          className={styles.btnPrimary}
          onClick={() => Taro.navigateTo({ url: `/pages/transport/index?id=${alert.orderId}` })}
        >
          查看运输详情
        </Text>
        <Text
          className={styles.btnSecondary}
          onClick={() => Taro.navigateTo({ url: `/pages/inspection/index?id=${alert.orderId}` })}
        >
          填写检查单
        </Text>
      </View>
    </View>
  )
}

export default AlertDetailPage
