import React from 'react'
import { View, Text } from '@tarojs/components'
import { TempZone } from '@/types/order'
import styles from './index.module.scss'

interface TemperatureBadgeProps {
  zone: TempZone
  min: number
  max: number
  currentTemp?: number
  showCurrent?: boolean
}

const zoneConfig: Record<TempZone, { label: string; styleKey: string }> = {
  frozen: { label: '冷冻', styleKey: 'frozen' },
  chilled: { label: '冷藏', styleKey: 'chilled' },
  ambient: { label: '常温', styleKey: 'ambient' }
}

const TemperatureBadge: React.FC<TemperatureBadgeProps> = ({ zone, min, max, currentTemp, showCurrent }) => {
  const config = zoneConfig[zone]
  const isOverTemp = showCurrent && currentTemp !== undefined && currentTemp > max

  return (
    <View className={styles.container}>
      <View className={`${styles.zoneTag} ${styles[config.styleKey]}`}>
        <Text className={styles.zoneLabel}>{config.label}</Text>
      </View>
      <Text className={styles.rangeText}>{min}℃ ~ {max}℃</Text>
      {showCurrent && currentTemp !== undefined && (
        <Text className={`${styles.currentTemp} ${isOverTemp ? styles.overTemp : ''}`}>
          当前 {currentTemp}℃
        </Text>
      )}
    </View>
  )
}

export default TemperatureBadge
