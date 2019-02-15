// pages/components/discountPromotion/discountPromotion.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    discountList:[{
        total:59,
        dis:15
      },{
        total:40,
        dis:5
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /* 触发父组件去关闭弹出层 */
  handleCloseLayer: function () {
    this.triggerEvent('closelayer', {})
  },

  /* 领取优惠券 */
  handleTakeDiscount: function (e) {
    //e.currentTarget.dataset.discountcode
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