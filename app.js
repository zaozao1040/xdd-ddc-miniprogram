App({
  globalData: {
    baseUrl: 'https://wx.api.vpans.cn',
    //baseUrl: 'http://192.168.1.123:8080',
    userInfo: null,
    selectedFoods:[],
    cacheMenuDataAll:[[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],
      [null,null,null,null],[null,null,null,null],[null,null,null,null]], //7行4列数组，用于存所有选中的数据---当前所有数据
    totalCount: 0,
    totalMoney: 0,//总价格
    realMoney:0,//实际价格
    totalCount:0
  },
  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
