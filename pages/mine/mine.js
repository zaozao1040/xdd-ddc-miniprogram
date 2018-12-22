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
    userInfo: {},
    //
    orderList:['全部订单','待取订单','待评价','已取消','轻松退'],
    orderIconArr: ['dingdan5','dingdan4','pingjia','yiquxiao1','tuikuan1'],
    labelList:['地址管理','浏览记录','下单闹钟','客户服务','推荐有奖','更多'],
    labelIconArr: ['dizhi','zuji','naozhong','kefu','bajiefuli','gengduo'],
  },
  initMine: function(){
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    const query = wx.createSelectorQuery()
    query.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      that.setData({
        scrollTop: res[0].top // #the-id节点的上边界坐标
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this
    //初始化，获取一些必要参数，如高度
    that.initMine()
    // 查看是否授权
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success(res) {
              that.setData({   
                userInfo : res.userInfo
              })
            }
          })
        }
      }
    })

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