import { create } from 'zustand'
import { InspectionRecord, MessageItem, AlertItem, DispositionRecord, ServiceStatus, ServiceTimelineEntry } from '@/types/order'
import { mockMessages, mockAlerts } from '@/data/orders'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'

const STORAGE_KEY_INSPECTION = 'freshlink_inspection_records'
const STORAGE_KEY_MESSAGES = 'freshlink_messages'
const STORAGE_KEY_ALERTS = 'freshlink_alerts'

interface AppState {
  inspectionRecords: Record<string, InspectionRecord>
  messages: MessageItem[]
  alerts: AlertItem[]
  addInspectionRecord: (record: InspectionRecord) => void
  getInspectionRecord: (orderId: string) => InspectionRecord | undefined
  addMessage: (message: MessageItem) => void
  markAlertAsRead: (alertId: string) => void
  markMessageAsRead: (messageId: string) => void
  hasInspectionRecord: (orderId: string) => boolean
  updateServiceStatus: (orderId: string, status: ServiceStatus, remark: string, expectedDate?: string) => void
  addDispositionRecord: (alertId: string, record: Omit<DispositionRecord, 'id'>) => void
  addDispositionRecordToOrder: (orderId: string, record: Omit<DispositionRecord, 'id' | 'alertId'>) => void
}

const loadInspectionRecords = (): Record<string, InspectionRecord> => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY_INSPECTION)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.warn('[AppStore] loadInspectionRecords failed:', e)
  }
  return {
    '6': {
      orderId: '6',
      orderNo: 'XL20260613006',
      productName: '大连鲍鱼海参礼盒',
      items: [
        { id: '1', label: '封签完好性', description: '检查车厢封签是否完整、编号是否与出库单一致', checked: true, result: 'pass', isKeyCheck: false },
        { id: '2', label: '温度打印条', description: '查看温度记录仪打印条，确认全程温度曲线在安全区间内', checked: true, result: 'pass', isKeyCheck: false },
        { id: '3', label: '包装结露情况', description: '检查外包装是否出现结露、水珠或水渍，尤其关注箱底', checked: true, result: 'pass', isKeyCheck: false },
        { id: '4', label: '到货测温', description: '使用探针温度计抽测货品中心温度，确认在要求温区内', checked: true, result: 'pass', isKeyCheck: false },
        { id: '5', label: '外包装完整性', description: '检查包装有无破损、挤压变形或污染痕迹', checked: true, result: 'pass', isKeyCheck: false },
        { id: '6', label: '感官品质抽检', description: '根据预警提示重点抽检对应品类外观、气味、触感', checked: true, result: 'pass', isKeyCheck: false }
      ],
      overallRemark: '收货正常，温控全程合格，货品状态良好',
      submitTime: '2026-06-20 19:20',
      submitter: '李收货员',
      failCount: 0,
      passCount: 6,
      serviceStatus: 'confirmed',
      serviceTimeline: [
        { status: 'pending', time: '2026-06-20 19:20', operator: '系统', remark: '检查单提交，等待客服确认' },
        { status: 'confirmed', time: '2026-06-20 20:05', operator: '客服王经理', remark: '检查结果已确认，全部合格，正常入库' }
      ]
    }
  }
}

const loadMessages = (): MessageItem[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY_MESSAGES)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.warn('[AppStore] loadMessages failed:', e)
  }
  return mockMessages
}

const loadAlerts = (): AlertItem[] => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY_ALERTS)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.warn('[AppStore] loadAlerts failed:', e)
  }
  return mockAlerts
}

const saveInspectionRecords = (records: Record<string, InspectionRecord>) => {
  try {
    Taro.setStorageSync(STORAGE_KEY_INSPECTION, JSON.stringify(records))
  } catch (e) {
    console.warn('[AppStore] saveInspectionRecords failed:', e)
  }
}

const saveMessages = (messages: MessageItem[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
  } catch (e) {
    console.warn('[AppStore] saveMessages failed:', e)
  }
}

const saveAlerts = (alerts: AlertItem[]) => {
  try {
    Taro.setStorageSync(STORAGE_KEY_ALERTS, JSON.stringify(alerts))
  } catch (e) {
    console.warn('[AppStore] saveAlerts failed:', e)
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  inspectionRecords: loadInspectionRecords(),
  messages: loadMessages(),
  alerts: loadAlerts(),

  addInspectionRecord: (record) => {
    console.info('[AppStore] addInspectionRecord:', record.orderNo)
    const newRecords = {
      ...get().inspectionRecords,
      [record.orderId]: record
    }
    set({ inspectionRecords: newRecords })
    saveInspectionRecords(newRecords)

    const now = dayjs().format('YYYY-MM-DD HH:mm')
    get().addDispositionRecordToOrder(record.orderId, {
      orderId: record.orderId,
      type: 'inspection',
      content: `检查单已提交：${record.passCount}项合格，${record.failCount}项不合格${record.overallRemark ? `，${record.overallRemark}` : ''}`,
      operator: record.submitter,
      time: now
    })

    record.items.forEach(item => {
      if (item.result === 'fail' && item.remark) {
        get().addDispositionRecordToOrder(record.orderId, {
          orderId: record.orderId,
          type: 'spotCheck',
          content: `【${item.label}】不合格：${item.remark}`,
          operator: record.submitter,
          time: now
        })
      }
    })
  },

  getInspectionRecord: (orderId) => {
    return get().inspectionRecords[orderId]
  },

  hasInspectionRecord: (orderId) => {
    return !!get().inspectionRecords[orderId]
  },

  addMessage: (message) => {
    console.info('[AppStore] addMessage:', message.title)
    const newMessages = [message, ...get().messages]
    set({ messages: newMessages })
    saveMessages(newMessages)
  },

  markAlertAsRead: (alertId) => {
    console.info('[AppStore] markAlertAsRead:', alertId)
    const newAlerts = get().alerts.map(a =>
      a.id === alertId ? { ...a, isRead: true } : a
    )
    set({ alerts: newAlerts })
    saveAlerts(newAlerts)
  },

  markMessageAsRead: (messageId) => {
    console.info('[AppStore] markMessageAsRead:', messageId)
    const newMessages = get().messages.map(m =>
      m.id === messageId ? { ...m, isRead: true } : m
    )
    set({ messages: newMessages })
    saveMessages(newMessages)
  },

  updateServiceStatus: (orderId, status, remark, expectedDate) => {
    const record = get().inspectionRecords[orderId]
    if (!record) return

    const now = dayjs().format('YYYY-MM-DD HH:mm')
    const operator = status === 'confirmed' ? '客服' : '收货员'

    const newEntry: ServiceTimelineEntry = {
      status,
      time: now,
      operator,
      remark,
      expectedDate
    }

    const updatedRecord: InspectionRecord = {
      ...record,
      serviceStatus: status,
      serviceTimeline: [...record.serviceTimeline, newEntry]
    }

    const newRecords = {
      ...get().inspectionRecords,
      [orderId]: updatedRecord
    }
    set({ inspectionRecords: newRecords })
    saveInspectionRecords(newRecords)

    const statusLabels: Record<ServiceStatus, string> = {
      pending: '待跟进',
      confirmed: '已确认',
      exchanged: '已换货',
      rejected: '已拒收'
    }

    const expectedText = expectedDate ? `，预计${expectedDate}补发` : ''
    const newMessage: MessageItem = {
      id: `msg_svc_${Date.now()}`,
      type: 'system',
      title: '客服处理更新',
      content: `订单${record.orderNo}处理状态更新为「${statusLabels[status]}」，${remark}${expectedText}`,
      time: now,
      isRead: false,
      orderId
    }
    const newMessages = [newMessage, ...get().messages]
    set({ messages: newMessages })
    saveMessages(newMessages)

    const statusChangeText = expectedDate
      ? `状态变更为${statusLabels[status]}：${remark}，预计${expectedDate}补发`
      : `状态变更为${statusLabels[status]}：${remark}`

    get().addDispositionRecordToOrder(orderId, {
      orderId,
      type: 'statusChange',
      content: statusChangeText,
      operator,
      time: now
    })
  },

  addDispositionRecord: (alertId, record) => {
    const newRecord: DispositionRecord = {
      ...record,
      id: `disp_${Date.now()}`
    }
    const newAlerts = get().alerts.map(a =>
      a.id === alertId
        ? { ...a, dispositionRecords: [...a.dispositionRecords, newRecord] }
        : a
    )
    set({ alerts: newAlerts })
    saveAlerts(newAlerts)
  },

  addDispositionRecordToOrder: (orderId, record) => {
    const orderAlerts = get().alerts.filter(a => a.orderId === orderId)
    if (orderAlerts.length === 0) return

    const now = dayjs().format('YYYY-MM-DD HH:mm')
    const newAlerts = get().alerts.map(a => {
      if (a.orderId !== orderId) return a
      const newRecord: DispositionRecord = {
        ...record,
        alertId: a.id,
        id: `disp_${Date.now()}_${a.id}`
      }
      return { ...a, dispositionRecords: [...a.dispositionRecords, newRecord] }
    })
    set({ alerts: newAlerts })
    saveAlerts(newAlerts)
  }
}))
