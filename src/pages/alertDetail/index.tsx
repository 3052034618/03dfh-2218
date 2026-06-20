import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useAppStore } from '@/store'
import { AlertLevel, RiskAction, RiskActionConfig, DispositionRecord } from '@/types/order'
import classnames from 'classnames'
import styles from './index.module.scss'

const levelHeaderMap: Record<AlertLevel, { label: string; styleKey: string }> = {
  severe: { label: '严重回温预警', styleKey: 'severeBg' },
  warning: { label: '回温注意预警', styleKey: 'warningBg' },
  normal: { label: '温度已恢复', styleKey: 'normalBg' }
}

const riskActionConfigs: RiskActionConfig[] = [
  {
    key: 'spotCheck',
    label: '重点抽检',
    desc: '按预警提示的品类和检查项，到仓后开箱抽检验证品质，留存抽检照片和测温记录',
    icon: '🔍',
    color: '#165DFF'
  },
  {
    key: 'exchange',
    label: '联系换货',
    desc: '如抽检发现明显品质问题，及时联系供应商或车队协调换货，避免影响销售计划',
    icon: '🔄',
    color: '#FF7D00'
  },
  {
    key: 'reject',
    label: '拒收沟通',
    desc: '如严重回温导致品质不可逆下降，依据合同条款拒收，并通知客服和采购跟进后续理赔',
    icon: '🚫',
    color: '#F53F3F'
  },
  {
    key: 'normal',
    label: '正常收货',
    desc: '品质无明显异常，按常规流程入库，在批次台账中记录本次预警情况，后续销售优先出库',
    icon: '✅',
    color: '#00B42A'
  }
]

const dispositionTypeIconMap: Record<DispositionRecord['type'], string> = {
  spotCheck: '🔍',
  remark: '📝',
  statusChange: '🔄',
  inspection: '📋'
}

const AlertDetailPage = () => {
  const router = useRouter()
  const alerts = useAppStore(state => state.alerts)
  const markAlertAsRead = useAppStore(state => state.markAlertAsRead)
  const addDispositionRecord = useAppStore(state => state.addDispositionRecord)
  const [alert, setAlert] = useState(alerts[0])

  useEffect(() => {
    const id = router.params.id
    if (id) {
      const found = alerts.find(a => a.id === id)
      if (found) {
        setAlert(found)
        if (!found.isRead) {
          markAlertAsRead(found.id)
        }
      } else {
        console.error('[AlertDetailPage] alert not found:', id)
      }
    }
  }, [router.params.id, alerts, markAlertAsRead])

  const headerConfig = levelHeaderMap[alert.level]

  const getZoneLabel = () => {
    switch (alert.tempZone) {
      case 'frozen': return '冷冻'
      case 'chilled': return '冷藏'
      case 'ambient': return '常温'
    }
  }

  const formatRecommendedActions = () => {
    return alert.recommendedActions.map(key =>
      riskActionConfigs.find(c => c.key === key)
    ).filter(Boolean) as RiskActionConfig[]
  }

  const recommendedActions = formatRecommendedActions()

  const handleOpenTransport = () => {
    Taro.navigateTo({ url: `/pages/transport/index?id=${alert.orderId}` })
  }

  const handleOpenInspection = () => {
    Taro.navigateTo({ url: `/pages/inspection/index?id=${alert.orderId}` })
  }

  const handleAddRemark = () => {
    Taro.showModal({
      title: '添加备注',
      editable: true,
      placeholderText: '请输入备注内容',
      success: (res) => {
        if (res.confirm && res.content) {
          addDispositionRecord(alert.id, {
            alertId: alert.id,
            orderId: alert.orderId,
            type: 'remark',
            content: res.content,
            operator: '当前用户',
            time: new Date().toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            }).replace(/\//g, '-')
          })
        }
      }
    })
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: 'calc(100vh - 120rpx)' }}>
        <View className={classnames(styles.alertHeader, styles[headerConfig.styleKey])}>
          <Text className={styles.levelLabel}>{headerConfig.label}</Text>
          <Text className={styles.levelDesc}>{alert.description}</Text>
          <Text className={styles.levelExplain}>
            <Text className={styles.highlightTag} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              {getZoneLabel()}温区
            </Text>
            {alert.riskLevelDesc}
          </Text>
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
              <Text className={styles.infoLabel}>要求温区</Text>
              <Text className={styles.infoValue}>
                {alert.tempRequireMin}℃ ~ {alert.tempRequireMax}℃
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>当前温度</Text>
              <Text className={styles.infoValue} style={{ color: '#F53F3F' }}>
                {alert.currentTemp}℃
              </Text>
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

          <View className={styles.thresholdCard}>
            <Text className={styles.cardTitle}>触发规则与偏移</Text>
            <View className={styles.thresholdItem}>
              <Text className={styles.thresholdLabel}>触发阈值</Text>
              <Text className={styles.thresholdValue}>
                <Text className={classnames(styles.highlightTag, styles.tagTemp)}>温度</Text>
                {alert.triggerThreshold}
              </Text>
            </View>
            <View className={styles.thresholdItem}>
              <Text className={styles.thresholdLabel}>温度偏移</Text>
              <Text className={styles.thresholdValue}>
                <Text className={classnames(styles.highlightTag, styles.tagRisk)}>偏移</Text>
                {alert.tempOffset}
              </Text>
            </View>
            <View className={styles.thresholdItem}>
              <Text className={styles.thresholdLabel}>持续时长</Text>
              <Text className={styles.thresholdValue}>
                <Text className={classnames(styles.highlightTag, styles.tagTime)}>时长</Text>
                已持续{alert.durationMinutes}分钟，按规则已触发{alert.level === 'severe' ? '严重' : '注意'}级别预警
              </Text>
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

          <View className={styles.actionSection}>
            <Text className={styles.actionTitle}>建议采取的动作</Text>
            {recommendedActions.map(action => (
              <View
                key={action.key}
                className={classnames(
                  styles.actionCard,
                  action.key === 'spotCheck' && styles.actionSpotCheck,
                  action.key === 'exchange' && styles.actionExchange,
                  action.key === 'reject' && styles.actionReject,
                  action.key === 'normal' && styles.actionNormal
                )}
              >
                <View
                  className={classnames(
                    styles.actionIcon,
                    action.key === 'spotCheck' && styles.iconSpotCheck,
                    action.key === 'exchange' && styles.iconExchange,
                    action.key === 'reject' && styles.iconReject,
                    action.key === 'normal' && styles.iconNormal
                  )}
                >
                  <Text>{action.icon}</Text>
                </View>
                <View className={styles.actionContent}>
                  <Text className={styles.actionName}>{action.label}</Text>
                  <Text className={styles.actionDesc}>{action.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View className={styles.dispositionSection}>
            <Text className={styles.dispositionTitle}>处置记录</Text>
            {alert.dispositionRecords && alert.dispositionRecords.length > 0 ? (
              <View className={styles.timeline}>
                {alert.dispositionRecords.map(record => (
                  <View key={record.id} className={styles.timelineItem}>
                    <View className={styles.timelineDot} />
                    <View className={styles.timelineContent}>
                      <View className={styles.timelineHeader}>
                        <Text className={styles.timelineTime}>{record.time}</Text>
                        <Text className={styles.timelineOperator}>{record.operator}</Text>
                      </View>
                      <Text className={styles.timelineBody}>
                        {dispositionTypeIconMap[record.type]} {record.content}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text className={styles.dispositionEmpty}>暂无处置记录，提交检查单或备注后将自动记录</Text>
            )}
            <Text className={styles.btnAddRemark} onClick={handleAddRemark}>添加备注</Text>
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Text
          className={styles.btnPrimary}
          onClick={handleOpenTransport}
        >
          查看运输详情
        </Text>
        <Text
          className={styles.btnSecondary}
          onClick={handleOpenInspection}
        >
          填写检查单{alert.dispositionRecords && alert.dispositionRecords.length > 0 ? `(${alert.dispositionRecords.length})` : ''}
        </Text>
      </View>
    </View>
  )
}

export default AlertDetailPage
