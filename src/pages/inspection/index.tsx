import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { mockOrders } from '@/data/orders'
import { useAppStore } from '@/store'
import { InspectionRecord, InspectionItem } from '@/types/order'
import classnames from 'classnames'
import dayjs from 'dayjs'
import styles from './index.module.scss'

interface CheckItem {
  id: string
  label: string
  description: string
  result: 'pass' | 'fail' | null
  remark: string
  isKeyCheck: boolean
}

const defaultCheckItems: CheckItem[] = [
  { id: '1', label: '封签完好性', description: '检查车厢封签是否完整、编号是否与出库单一致', result: null, remark: '', isKeyCheck: false },
  { id: '2', label: '温度打印条', description: '查看温度记录仪打印条，确认全程温度曲线在安全区间内', result: null, remark: '', isKeyCheck: true },
  { id: '3', label: '包装结露情况', description: '检查外包装是否出现结露、水珠或水渍，尤其关注箱底', result: null, remark: '', isKeyCheck: true },
  { id: '4', label: '到货测温', description: '使用探针温度计抽测货品中心温度，确认在要求温区内', result: null, remark: '', isKeyCheck: true },
  { id: '5', label: '外包装完整性', description: '检查包装有无破损、挤压变形或污染痕迹', result: null, remark: '', isKeyCheck: false },
  { id: '6', label: '感官品质抽检', description: '根据预警提示重点抽检对应品类外观、气味、触感', result: null, remark: '', isKeyCheck: true }
]

const severeAlertKeyItems: Record<string, string[]> = {
  chilled: ['2', '3', '4', '6'],
  frozen: ['2', '3', '4', '6'],
  ambient: ['2', '4', '6']
}

const warningAlertKeyItems: Record<string, string[]> = {
  chilled: ['2', '4', '6'],
  frozen: ['2', '4', '6'],
  ambient: ['2', '4', '6']
}

const InspectionPage = () => {
  const router = useRouter()
  const [orderId, setOrderId] = useState('')
  const [orderNo, setOrderNo] = useState('')
  const [productName, setProductName] = useState('')
  const [tempZone, setTempZone] = useState<'frozen' | 'chilled' | 'ambient'>('chilled')
  const [hasSevereAlert, setHasSevereAlert] = useState(false)
  const [hasWarningAlert, setHasWarningAlert] = useState(false)
  const [checkItems, setCheckItems] = useState<CheckItem[]>([...defaultCheckItems])
  const [overallRemark, setOverallRemark] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [existingRecord, setExistingRecord] = useState<InspectionRecord | null>(null)

  const alerts = useAppStore(state => state.alerts)
  const getInspectionRecord = useAppStore(state => state.getInspectionRecord)
  const addInspectionRecord = useAppStore(state => state.addInspectionRecord)
  const addMessage = useAppStore(state => state.addMessage)

  useEffect(() => {
    const id = router.params.id
    if (id) {
      setOrderId(id)
      const foundOrder = mockOrders.find(o => o.id === id)
      if (foundOrder) {
        setOrderNo(foundOrder.orderNo)
        setProductName(foundOrder.productName)
        setTempZone(foundOrder.tempZone)
      } else {
        console.error('[InspectionPage] order not found:', id)
      }

      const record = getInspectionRecord(id)
      if (record) {
        setExistingRecord(record)
        console.info('[InspectionPage] found existing record:', record.orderNo)
      }

      const orderAlerts = alerts.filter(a => a.orderId === id)
      setHasSevereAlert(orderAlerts.some(a => a.level === 'severe'))
      setHasWarningAlert(orderAlerts.some(a => a.level === 'warning'))

      if (!record) {
        setTimeout(() => applyKeyCheckItems(foundOrder?.tempZone || 'chilled', orderAlerts), 0)
      }
    }
  }, [router.params.id, alerts, getInspectionRecord])

  const applyKeyCheckItems = (zone: 'frozen' | 'chilled' | 'ambient', orderAlerts: any[]) => {
    const hasSevere = orderAlerts.some(a => a.level === 'severe')
    const hasWarning = orderAlerts.some(a => a.level === 'warning')

    let keyItemIds: string[] = []
    if (hasSevere) {
      keyItemIds = severeAlertKeyItems[zone] || []
    } else if (hasWarning) {
      keyItemIds = warningAlertKeyItems[zone] || []
    }

    if (keyItemIds.length > 0) {
      setCheckItems(prev =>
        prev.map(item => ({
          ...item,
          isKeyCheck: keyItemIds.includes(item.id)
        }))
      )
    }
  }

  const handleCheckResult = (itemId: string, result: 'pass' | 'fail') => {
    setCheckItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, result: item.result === result ? null : result } : item
      )
    )
  }

  const handleItemRemark = (itemId: string, remark: string) => {
    setCheckItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, remark } : item
      )
    )
  }

  const handleSubmit = () => {
    const allChecked = checkItems.every(item => item.result !== null)
    if (!allChecked) {
      Taro.showToast({ title: '请完成所有检查项', icon: 'none' })
      return
    }

    const passCount = checkItems.filter(i => i.result === 'pass').length
    const failCount = checkItems.filter(i => i.result === 'fail').length

    const record: InspectionRecord = {
      orderId,
      orderNo,
      productName,
      items: checkItems.map(item => ({
        id: item.id,
        label: item.label,
        description: item.description,
        checked: true,
        result: item.result!,
        remark: item.remark,
        isKeyCheck: item.isKeyCheck
      })),
      overallRemark,
      submitTime: dayjs().format('YYYY-MM-DD HH:mm'),
      submitter: '收货员',
      failCount,
      passCount
    }

    addInspectionRecord(record)
    console.info('[InspectionPage] submitted:', record)

    const messageContent = failCount > 0
      ? `订单${orderNo}的到货检查单已提交，${failCount}项不合格，请客服跟进异常处理`
      : `订单${orderNo}的到货检查单已提交，全部合格，客服将在24小时内确认`

    addMessage({
      id: `msg_${Date.now()}`,
      type: 'system',
      title: '检查单已提交',
      content: messageContent,
      time: dayjs().format('YYYY-MM-DD HH:mm'),
      isRead: false,
      orderId
    })

    setShowSuccess(true)
  }

  const handleConfirm = () => {
    setShowSuccess(false)
    Taro.navigateBack()
  }

  const getHeaderClass = () => {
    if (existingRecord) return ''
    if (hasSevereAlert) return styles.orderInfoSevere
    if (hasWarningAlert) return styles.orderInfoWarning
    return ''
  }

  const getKeyCheckTip = () => {
    if (hasSevereAlert) {
      const zoneText = tempZone === 'chilled' ? '冷鲜肉/果蔬' : tempZone === 'frozen' ? '冷冻品' : '果品'
      return `该订单存在严重回温预警，请重点检查${zoneText}品质，已为您标记【温度打印条、包装结露、到货测温、感官抽检】为重点检查项`
    }
    if (hasWarningAlert) {
      return `该订单存在回温注意预警，请重点关注温度打印条、到货测温及感官抽检情况`
    }
    return ''
  }

  if (existingRecord) {
    return (
      <View className={styles.page}>
        <ScrollView scrollY style={{ height: 'calc(100vh - 20rpx)' }}>
          <View className={classnames(styles.orderInfo, existingRecord.failCount > 0 ? styles.orderInfoSevere : '')}>
            <Text className={styles.orderNoText}>订单 {existingRecord.orderNo}</Text>
            <Text className={styles.orderProductText}>{existingRecord.productName}</Text>
            <View className={styles.submitInfo}>
              <Text className={styles.submitTime}>提交时间 {existingRecord.submitTime}</Text>
              <Text className={styles.submitResult}>
                {existingRecord.failCount > 0
                  ? `${existingRecord.failCount}项不合格`
                  : '全部合格'}
              </Text>
            </View>
          </View>

          <View className={styles.historyRecord}>
            <Text className={styles.historyTitle}>检查结果</Text>
            <View className={styles.historySummary}>
              <View className={styles.summaryItem}>
                <Text className={classnames(styles.summaryNumber, styles.passNum)}>
                  {existingRecord.passCount}
                </Text>
                <Text className={styles.summaryLabel}>合格</Text>
              </View>
              <View className={styles.summaryItem}>
                <Text className={classnames(styles.summaryNumber, styles.failNum)}>
                  {existingRecord.failCount}
                </Text>
                <Text className={styles.summaryLabel}>不合格</Text>
              </View>
            </View>
            {existingRecord.items.map((item: InspectionItem) => (
              <View key={item.id} className={styles.historyItem}>
                <View className={styles.historyItemHeader}>
                  <Text className={styles.historyItemLabel}>
                    {item.label}
                    {item.isKeyCheck && (
                      <Text className={styles.keyCheckBadge}>重点检查</Text>
                    )}
                  </Text>
                  <Text
                    className={classnames(
                      styles.historyItemResult,
                      item.result === 'pass' ? styles.resultPass : styles.resultFail
                    )}
                  >
                    {item.result === 'pass' ? '合格' : '不合格'}
                  </Text>
                </View>
                <Text className={styles.historyItemDesc}>{item.description}</Text>
                {item.remark && (
                  <Text className={styles.historyItemRemark}>
                    备注：{item.remark}
                  </Text>
                )}
              </View>
            ))}
            {existingRecord.overallRemark && (
              <View className={styles.historyOverall}>
                <Text className={styles.historyOverallLabel}>整体备注</Text>
                <Text className={styles.historyOverallContent}>
                  {existingRecord.overallRemark}
                </Text>
              </View>
            )}
            <View className={styles.historySubmitInfo}>
              <Text>提交人：{existingRecord.submitter}</Text>
              <Text>客服跟进中</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: 'calc(100vh - 140rpx)' }}>
        <View className={classnames(styles.orderInfo, getHeaderClass())}>
          <Text className={styles.orderNoText}>订单 {orderNo}</Text>
          <Text className={styles.orderProductText}>{productName}</Text>
        </View>

        {(hasSevereAlert || hasWarningAlert) && (
          <View className={styles.keyCheckTip}>
            <Text className={styles.keyCheckIcon}>⚠️</Text>
            <View className={styles.keyCheckContent}>
              <Text className={styles.keyCheckTitle}>
                {hasSevereAlert ? '严重回温预警' : '回温注意预警'}
              </Text>
              <Text className={styles.keyCheckDesc}>{getKeyCheckTip()}</Text>
            </View>
          </View>
        )}

        <View className={styles.contentArea}>
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>检查项目</Text>
            {checkItems.map(item => (
              <View key={item.id} className={styles.checkItem}>
                <View className={styles.checkLeft}>
                  <Text className={styles.checkLabel}>
                    {item.label}
                    {item.isKeyCheck && (
                      <Text className={styles.keyCheckBadge}>重点</Text>
                    )}
                  </Text>
                  <Text className={styles.checkDesc}>{item.description}</Text>
                  <View className={styles.checkActions}>
                    <Text
                      className={classnames(styles.btnPass, item.result === 'pass' && styles.btnPassActive)}
                      onClick={() => handleCheckResult(item.id, 'pass')}
                    >
                      合格
                    </Text>
                    <Text
                      className={classnames(styles.btnFail, item.result === 'fail' && styles.btnFailActive)}
                      onClick={() => handleCheckResult(item.id, 'fail')}
                    >
                      不合格
                    </Text>
                  </View>
                  {item.result === 'fail' && (
                    <Input
                      className={styles.remarkInput}
                      placeholder='请备注不合格详情'
                      value={item.remark}
                      onInput={e => handleItemRemark(item.id, e.detail.value)}
                    />
                  )}
                </View>
              </View>
            ))}
          </View>

          <View className={styles.overallRemarkCard}>
            <Text className={styles.overallRemarkTitle}>整体备注</Text>
            <Textarea
              className={styles.overallRemarkInput}
              placeholder='填写整体收货情况备注（选填）'
              value={overallRemark}
              onInput={e => setOverallRemark(e.detail.value)}
            />
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <Text className={styles.btnSubmit} onClick={handleSubmit}>
          提交检查结果
        </Text>
      </View>

      {showSuccess && (
        <View className={styles.successOverlay}>
          <View className={styles.successBox}>
            <Text className={styles.successIcon}>✅</Text>
            <Text className={styles.successTitle}>检查单已提交</Text>
            <Text className={styles.successDesc}>
              结果已同步至客服，消息中心可查看记录。如有异常，客服将在30分钟内联系您。
            </Text>
            <Text className={styles.btnConfirm} onClick={handleConfirm}>
              <Text>返回</Text>
            </Text>
          </View>
        </View>
      )}
    </View>
  )
}

export default InspectionPage
