// pages/order/detail.js
import { order } from './order-model.js'
let orderModel = new order()
import moment from "../../comm/script/moment"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderCode:undefined,
    detailInfo:null,
        //
        orderStatusMap: {
          NO_PAY: '未支付',
          PAYED_WAITINT_CONFIRM: '已支付',
          CONFIRM_WAITING_MAKE: '待制作',
          MAKING: '开始制作',
          MAKED_WAITING_DELIVERY: '待配送',
          DELIVERING: '配送中',
          DELIVERED_WAITING_PICK: '待取货',
          PICKED_WAITING_EVALUATE: '待评价',
          COMPLETED_EVALUATED: '已评价',
          NO_PICK_WAITING_BACK: '超时未取货待取回',
          USER_CANCEL: '已取消',
          SYSTEM_CANCEL: '系统自动取消'
        },
        payStatusMap: {
          THIRD_PAYED: '第三方支付',
          NO_PAYED: '未支付',
          STANDARD_PAYED: '标准支付'
        },
        mealTypeMap: {
          BREAKFAST: '早餐',
          LUNCH: '午餐',
          DINNER: '晚餐',
          NIGHT: '夜宵'
        },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    _this.setData({ 
      orderCode: options.orderCode
    })
    let param = {
/*       orderCode: options.orderCode, 
      userCode: wx.getStorageSync('userInfo').userCode */
      orderCode: 'DDC540922057089744896',
      userCode: 'USER540619295831490560'
    }
    wx.showLoading({ //【防止狂点2】
      title: '加载中',
      mask: true
    })
    orderModel.getOrderDeatailData(param, (res) => {
      console.log('收到请求(订单详情):', res)
      let tmpData = res.data
      tmpData.mealTypeDes = _this.data.mealTypeMap[res.data.mealType]
      tmpData.orderStatusDes = _this.data.orderStatusMap[res.data.orderStatus]
      tmpData.payStatusDes = _this.data.payStatusMap[res.data.payStatus]
      tmpData.orderTimeDes = moment(res.data.orderTime).format('YYYY-MM-DD HH:mm:ss')

      tmpData.mealDateDes = moment(res.data.mealDate).format('MM月DD日')
      tmpData.takeMealEndTimeDes = moment(res.data.takeMealEndTime).format('MM月DD日HH:mm')
      tmpData.takeMealStartTimeDes = moment(res.data.takeMealStartTime).format('MM月DD日HH:mm')
      if (res.code === 0) {
        _this.setData({ 
          detailInfo: res.data
        })
        wx.hideLoading() //【防止狂点3】
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
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