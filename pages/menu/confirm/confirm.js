// pages/menu/confirm/confirm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    address:wx.getStorageSync('userInfo').address,
    name:wx.getStorageSync('userInfo').name,
    phoneNumber:wx.getStorageSync('userInfo').phoneNumber,
    selectedFoods:[],
    totalMoney: 0,
    totalMoneyDeduction:0, //额度总金额
    realMoney:0,//实际总价格，也就是自费价格
  },

  initAddress: function(){
    let _this = this;
    const query = wx.createSelectorQuery()
    query.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].top // #the-id节点的上边界坐标
      })
    })
    const query_1 = wx.createSelectorQuery()
    query_1.select('.c_buttonPosition_forCalculate').boundingClientRect()
    query_1.selectViewport().scrollOffset()
    query_1.exec(function (res) {
      _this.setData({
        buttonTop: res[0].top // #the-id节点的上边界坐标
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initAddress()
    let _this = this
    _this.setData({   
      selectedFoods : getApp().globalData.selectedFoods,
      totalMoney: options.totalMoney,
      totalMoneyDeduction: options.totalMoneyDeduction,
      realMoney: options.realMoney
    })
    console.log('selectedFoods',this.data.selectedFoods)
    console.log('options',options)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
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