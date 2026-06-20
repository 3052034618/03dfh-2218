import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

const MinePage = () => {
  const menuItems = [
    { icon: '🏪', label: '门店管理' },
    { icon: '📊', label: '收货统计' },
    { icon: '🔔', label: '预警设置' },
    { icon: '📞', label: '联系客服' },
    { icon: '📄', label: '使用帮助' },
    { icon: '⚙️', label: '系统设置' }
  ]

  return (
    <View className={styles.page}>
      <View className={styles.profileHeader}>
        <View className={styles.avatar}>🏢</View>
        <View className={styles.profileInfo}>
          <Text className={styles.companyName}>鲜味坊连锁餐饮</Text>
          <Text className={styles.userRole}>采购经理 · 张经理</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <View className={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={index} className={styles.menuItem}>
              <View className={styles.menuItemLeft}>
                <Text className={styles.menuIcon}>{item.icon}</Text>
                <Text className={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>

      <Text className={styles.versionText}>鲜链管家 v1.0.0</Text>
    </View>
  )
}

export default MinePage
