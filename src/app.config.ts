export default defineAppConfig({
  pages: [
    'pages/orders/index',
    'pages/alerts/index',
    'pages/messages/index',
    'pages/mine/index',
    'pages/transport/index',
    'pages/inspection/index',
    'pages/alertDetail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0FC6C2',
    navigationBarTitleText: '鲜链管家',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#0FC6C2',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/alerts/index',
        text: '预警'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
