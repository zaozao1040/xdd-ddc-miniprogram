// pages/order/order.js
import { order } from './order-model.js'
let orderModel = new order()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:101,
    orderDataAll:{},
    orderStatus:['今日待取','未取','已取','未付款','已付款','全部'],
    orderStatusActiveFlag:0, //默认今日待取
  },
  getOrderDataByResponse: function(){
    let that = this
    //获取后台数据
    let param = {
      userId:that.data.userId
    }
    orderModel.getOrderData(param,(res)=>{
      let resData = res.data
      let tmp_data= resData
      that.setData({   //添加结束后，setData设置一下，模板就能同步刷新
        orderDataAll : tmp_data
      })
    })
    
  },
  handleChangeOrderStatusActive: function(e){
    this.setData({
      orderStatusActiveFlag: e.currentTarget.dataset.orderstatusindex
    })
    this.getOrderDataByResponse()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    //获取后台数据
    that.getOrderDataByResponse()
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