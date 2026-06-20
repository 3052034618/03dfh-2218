export type OrderStatus = 'transporting' | 'completed' | 'abnormal'

export type TempZone = 'frozen' | 'chilled' | 'ambient'

export type AlertLevel = 'normal' | 'warning' | 'severe'

export interface OrderItem {
  id: string
  orderNo: string
  productName: string
  tempZone: TempZone
  tempRequireMin: number
  tempRequireMax: number
  currentTemp: number
  status: OrderStatus
  vehicleNo: string
  departureTime: string
  estimatedArrival: string
  origin: string
  destination: string
  hasAlert: boolean
  alertCount: number
  thumbnail: string
  progress: number
  currentLocation: string
  tempRecords: TempRecord[]
}

export type RiskAction = 'spotCheck' | 'exchange' | 'reject' | 'normal'

export interface AlertItem {
  id: string
  orderId: string
  orderNo: string
  productName: string
  level: AlertLevel
  tempZone: TempZone
  tempRequireMin: number
  tempRequireMax: number
  currentTemp: number
  durationMinutes: number
  description: string
  suggestion: string
  impactAssessment: string
  time: string
  isRead: boolean
  riskLevelDesc: string
  recommendedActions: RiskAction[]
  triggerThreshold: string
  tempOffset: string
}

export interface RiskActionConfig {
  key: RiskAction
  label: string
  desc: string
  icon: string
  color: string
}

export interface MessageItem {
  id: string
  type: 'arrival' | 'alert' | 'system'
  title: string
  content: string
  time: string
  isRead: boolean
  orderId?: string
}

export interface TempRecord {
  time: string
  temp: number
}

export interface TransportDetail {
  orderId: string
  orderNo: string
  productName: string
  vehicleNo: string
  driverName: string
  driverPhone: string
  tempZone: TempZone
  tempRequireMin: number
  tempRequireMax: number
  currentTemp: number
  origin: string
  destination: string
  departureTime: string
  estimatedArrival: string
  currentLocation: string
  progress: number
  tempRecords: TempRecord[]
  alerts: AlertItem[]
}

export interface InspectionItem {
  id: string
  label: string
  description: string
  checked: boolean
  result?: 'pass' | 'fail'
  remark?: string
  isKeyCheck?: boolean
}

export interface InspectionForm {
  orderId: string
  orderNo: string
  items: InspectionItem[]
  overallRemark: string
  submitTime?: string
  submitted: boolean
}

export interface InspectionRecord {
  orderId: string
  orderNo: string
  productName: string
  items: InspectionItem[]
  overallRemark: string
  submitTime: string
  submitter: string
  failCount: number
  passCount: number
}
