import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { mockOrders } from '@/data/orders'
import classnames from 'classnames'
import styles from './index.module.scss'

interface CheckItem {
  id: string
  label: string
  desc: string
  result: 'pass' | 'fail' | null
  remark: string
}

const defaultCheckItems: CheckItem[] = [
  { id: '1', label: '封签完好性', desc: '检查车厢封签是否完整、编号是否与出库单一致', result: null, remark: '' },
  { id: '2', label: '温度打印条', desc: '查看温度记录仪打印条，确认全程温度曲线在安全区间内', result: null, remark: '' },
  { id: '3', label: '包装结露情况', desc: '检查外包装是否出现结露、水珠或水渍，尤其关注箱底', result: null, remark: '' },
  { id: '4', label: '到货测温', desc: '使用探针温度计抽测货品中心温度，确认在要求温区内', result: null, remark: '' },
  { id: '5', label: '外包装完整性', desc: '检查包装有无破损、挤压变形或污染痕迹', result: null, remark: '' },
  { id: '6', label: '感官品质抽检', desc: '根据预警提示重点抽检对应品类外观、气味、触感', result: null, remark: '' }
]

const InspectionPage = () => {
  const router = useRouter()
  const [orderNo, setOrderNo] = useState('')
  const [productName, setProductName] = useState('')
  const [checkItems, setCheckItems] = useState<CheckItem[]>(defaultCheckItems)
  const [overallRemark, setOverallRemark] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const id = router.params.id
    if (id) {
      const found = mockOrders.find(o => o.id === id)
      if (found) {
        setOrderNo(found.orderNo)
        setProductName(found.productName)
      } else {
        console.error('[InspectionPage] order not found:', id)
      }
    }
  }, [router.params.id])

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
    console.info('[InspectionPage] submit:', { orderNo, checkItems, overallRemark })
    setShowSuccess(true)
  }

  const handleConfirm = () => {
    setShowSuccess(false)
    Taro.navigateBack()
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: 'calc(100vh - 140rpx)' }}>
        <View className={styles.orderInfo}>
          <Text className={styles.orderNoText}>订单 {orderNo}</Text>
          <Text className={styles.orderProductText}>{productName}</Text>
        </View>

        <View className={styles.contentArea}>
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>检查项目</Text>
            {checkItems.map(item => (
              <View key={item.id} className={styles.checkItem}>
                <View className={styles.checkLeft}>
                  <Text className={styles.checkLabel}>{item.label}</Text>
                  <Text className={styles.checkDesc}>{item.desc}</Text>
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
              结果已同步至客服，如有异常情况，客服将在30分钟内联系您
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
