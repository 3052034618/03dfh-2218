export type OrderStatus = 'transporting' | 'completed' | 'abnormal'

export type TempZone = 'frozen' | 'chilled' | 'ambient'

export type AlertLevel = 'normal' | 'warning' | 'severe'

export type ServiceStatus = 'pending' | 'confirmed' | 'exchanged' | 'rejected'

export interface ServiceTimelineEntry {
  status: ServiceStatus
  time: string
  operator: string
  remark: string
  expectedDate?: string
}

export interface DispositionRecord {
  id: string
  alertId: string
  orderId: string
  type: 'spotCheck' | 'remark' | 'statusChange' | 'inspection'
  content: string
  operator: string
  time: string
}

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
  dispositionRecords: DispositionRecord[]
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
  alertId?: string
}

export interface TempRecord {
  time: string
  temp: number
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
  serviceStatus: ServiceStatus
  serviceTimeline: ServiceTimelineEntry[]
}
