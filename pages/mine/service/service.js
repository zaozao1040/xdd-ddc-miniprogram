import { service } from './service-model.js'
let serviceModel = new service()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    //初始化
    //_this.initService()
    let param = { }
/*     wx.showLoading({ //【防止狂点2】
      title: '加载中',
      mask: true
    }) */
    serviceModel.getServiceList(param,(res)=>{
      console.log('收到请求(客服列表):',res)
/*       if(res.code === 0){
        wx.setStorageSync('userInfo', res.data) //更新缓存的userInfo
        _this.setData({
          userInfo:res.data
        })
        wx.hideLoading() //【防止狂点3】
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })  
      } */
    })
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