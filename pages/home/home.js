// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperInfo: null,
    promotionInfo: null,
    wel: "",
    propagandaList: ['比外卖便宜','全程保温','食品更安全','急速退款'],
    propagandaIconArr:['bianyihuo2','peisong','shipinanquan-','tuikuan'],
  },
  initHome:function(){
    /* **********设置轮播图数据********** */
    this.setData({
      swiperInfo: [{
        url: 'https://img.4008823823.com.cn/kfcios/Banner/Banner_1_c80749057bfc4ad68d06af90bb809d25.jpg'
      }, {
        url: 'https://img.4008823823.com.cn/kfcios/Banner/Banner_1_d1c9737fad7d42df8b593bb7ae696e7c.jpg'
      }, {
        url: 'https://img.4008823823.com.cn/kfcios/Banner/Banner_1_c6e80bd6dbc5420b886937f217efc40d.jpg'
      }],
      promotionInfo: [{
        url: 'https://fuss10.elemecdn.com/d/d4/16ff085900d62b8d60fa7e9c6b65dpng.png?imageMogr/format/webp/thumbnail/!240x160r/gravity/Center/crop/240x160/'
      }, {
          url: 'https://fuss10.elemecdn.com/b/e1/0fa0ed514c093a7138b0b9a50d61fpng.png?imageMogr/format/webp/thumbnail/!240x160r/gravity/Center/crop/240x160/'
      }]
    })
    /* **********设置欢迎时间********** */
    var t = new Date().getHours();
    t >= 6 && t < 11 ? this.setData({
      wel: "早上好"
    }) : t >= 11 && t < 13 ? this.setData({
      wel: "中午好"
    }) : t >= 13 && t < 18 ? this.setData({
      wel: "下午好"
    }) : this.setData({
      wel: "晚上好"
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    const app = getApp()  
    this.setData({
      userInfo: app.globalData.userInfo
    })
    this.initHome()

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

  },


})