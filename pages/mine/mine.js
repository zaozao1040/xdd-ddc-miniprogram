// pages/mine/mine.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    windowHeight: 0,
    scrollTop: 0,
    //用户信息
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo:null,
    //
    labelList:['换绑手机','换绑企业','地址管理','浏览记录','下单闹钟','客户服务','推荐有奖','更多'],
    labelIconArr: ['shouji1','qiye1','dizhi','zuji','naozhong','kefu','bajiefuli','gengduo'],
    navigatorUrl:['/pages/mine/phone/phone','/pages/mine/organize/organize','/pages/mine/address/address']
  },
  initMine: function(){
    let _this = this;
    wx.getSystemInfo({
      success: function(res) {
        _this.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    const query = wx.createSelectorQuery()
    query.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].top // #the-id节点的上边界坐标
      })
    })
    let tmp_userInfo = wx.getStorageSync('userInfo')
    _this.setData({
      userInfo:tmp_userInfo
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    //初始化，获取一些必要参数，如高度
    _this.initMine()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})