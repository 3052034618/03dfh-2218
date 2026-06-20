import React, { useEffect, useRef } from 'react'
import { View, Text, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { TempRecord } from '@/types/order'
import styles from './index.module.scss'

interface TempChartProps {
  records: TempRecord[]
  tempMin: number
  tempMax: number
  height?: number
}

const TempChart: React.FC<TempChartProps> = ({ records, tempMin, tempMax, height = 300 }) => {
  const canvasId = 'tempChart'

  useEffect(() => {
    if (records.length === 0) return
    const drawChart = async () => {
      try {
        const query = Taro.createSelectorQuery()
        query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
          if (!res || !res[0]) return
          const canvas = res[0].node
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          const dpr = Taro.getSystemInfoSync().pixelRatio
          const w = res[0].width
          const h = res[0].height
          canvas.width = w * dpr
          canvas.height = h * dpr
          ctx.scale(dpr, dpr)

          const padLeft = 40
          const padRight = 16
          const padTop = 16
          const padBottom = 32
          const chartW = w - padLeft - padRight
          const chartH = h - padTop - padBottom

          const allTemps = records.map(r => r.temp)
          const minT = Math.min(tempMin, Math.min(...allTemps)) - 2
          const maxT = Math.max(tempMax, Math.max(...allTemps)) + 2
          const range = maxT - minT || 1

          const toX = (i: number) => padLeft + (i / (records.length - 1)) * chartW
          const toY = (t: number) => padTop + (1 - (t - minT) / range) * chartH

          ctx.clearRect(0, 0, w, h)

          const limitY1 = toY(tempMax)
          ctx.fillStyle = 'rgba(245, 63, 63, 0.06)'
          ctx.fillRect(padLeft, padTop, chartW, limitY1 - padTop)
          const limitY2 = toY(tempMin)
          ctx.fillStyle = 'rgba(0, 180, 42, 0.04)'
          ctx.fillRect(padLeft, limitY1, chartW, limitY2 - limitY1)

          ctx.strokeStyle = 'rgba(245, 63, 63, 0.5)'
          ctx.lineWidth = 1
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(padLeft, limitY1)
          ctx.lineTo(padLeft + chartW, limitY1)
          ctx.stroke()
          ctx.setLineDash([])

          ctx.strokeStyle = 'rgba(0, 180, 42, 0.5)'
          ctx.lineWidth = 1
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(padLeft, limitY2)
          ctx.lineTo(padLeft + chartW, limitY2)
          ctx.stroke()
          ctx.setLineDash([])

          ctx.fillStyle = '#F53F3F'
          ctx.font = '10px sans-serif'
          ctx.textAlign = 'right'
          ctx.fillText(`${tempMax}℃`, padLeft - 4, limitY1 + 4)
          ctx.fillStyle = '#00B42A'
          ctx.fillText(`${tempMin}℃`, padLeft - 4, limitY2 + 4)

          ctx.strokeStyle = '#0FC6C2'
          ctx.lineWidth = 2
          ctx.lineJoin = 'round'
          ctx.beginPath()
          records.forEach((r, i) => {
            const x = toX(i)
            const y = toY(r.temp)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(toX(0), toY(records[0].temp))
          records.forEach((r, i) => {
            ctx.lineTo(toX(i), toY(r.temp))
          })
          ctx.lineTo(toX(records.length - 1), padTop + chartH)
          ctx.lineTo(toX(0), padTop + chartH)
          ctx.closePath()
          const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH)
          gradient.addColorStop(0, 'rgba(15, 198, 194, 0.3)')
          gradient.addColorStop(1, 'rgba(15, 198, 194, 0.02)')
          ctx.fillStyle = gradient
          ctx.fill()

          records.forEach((r, i) => {
            const x = toX(i)
            const y = toY(r.temp)
            const isOver = r.temp > tempMax
            ctx.beginPath()
            ctx.arc(x, y, 3, 0, 2 * Math.PI)
            ctx.fillStyle = isOver ? '#F53F3F' : '#0FC6C2'
            ctx.fill()
          })

          ctx.fillStyle = '#86909C'
          ctx.font = '9px sans-serif'
          ctx.textAlign = 'center'
          const step = Math.max(1, Math.floor(records.length / 5))
          for (let i = 0; i < records.length; i += step) {
            ctx.fillText(records[i].time, toX(i), padTop + chartH + 16)
          }
        })
      } catch (err) {
        console.error('[TempChart] draw error:', err)
      }
    }
    setTimeout(drawChart, 300)
  }, [records, tempMin, tempMax])

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>温控轨迹</Text>
        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#00B42A' }} />
            <Text className={styles.legendText}>安全区</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={styles.legendDot} style={{ backgroundColor: '#F53F3F' }} />
            <Text className={styles.legendText}>超温区</Text>
          </View>
        </View>
      </View>
      <Canvas id={canvasId} type='2d' className={styles.canvas} style={{ height: `${height}rpx` }} />
    </View>
  )
}

export default TempChart
