import { create } from 'zustand'
import { InspectionRecord, MessageItem, AlertItem } from '@/types/order'
import { mockMessages, mockAlerts } from '@/data/orders'
import Taro from '@tarojs/taro'

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
      passCount: 6
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
  }
}))
