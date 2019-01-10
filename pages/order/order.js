// pages/order/order.js
import { order } from './order-model.js'
let orderModel = new order()
import moment from "../../comm/script/moment"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    canClick:true,
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 20, // 每页条数
    hasMoreDataFlag: true,//是否还有更多数据  默认还有
    orderListNoResult: false,
    //
    windowHeight: 0,
    scrollTop: 0,
    //
    itemStatusActiveFlag:true, //默认今日待取
    orderList:[],
    orderListNoResult: false,
    //
    showRatingsFlag: false,
    orderStatusMap : {
      NO_PAY:'未支付',
      PAYED_WAITINT_CONFIRM:'已支付',
      CONFIRM_WAITING_MAKE:'待制作',
      MAKING:'开始制作',
      MAKED_WAITING_DELIVERY:'待配送',
      DELIVERING:'配送中',
      DELIVERED_WAITING_PICK:'待取货',
      PICKED_WAITING_EVALUATE:'待评价',
      NO_PICK_WAITING_BACK:'超时未取货待取回',
      USER_CANCEL:'已取消',
      SYSTEM_CANCEL:'系统自动取消'
    },
    mealTypeMap : {
      BREAKFAST:'早餐',
      LUNCH:'午餐',
      DINNER:'晚餐',
      NIGHT:'夜宵'
    },
    orderCode:''
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

  },

  /* 手动点击触发下一页 */
  gotoNextPage: function () {
    if (this.data.hasMoreDataFlag) {
      this.getOrderList()
      wx.showLoading({
        title: '加载更多数据',
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '没有更多数据'
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    _this.initOrder()
    _this.getOrderList()
  },
  changeItemStatusActiveFlag:function(e){
    if(e.currentTarget.dataset.flag=='jinridaiqu'){
      this.setData({ 
        itemStatusActiveFlag: true
      })
    }else if(e.currentTarget.dataset.flag=='quanbudingdan'){
      this.setData({ 
        itemStatusActiveFlag: false
      })   
    }else{

    }
    this.setData({
      orderList: [], // 这四个要重置，为了交易记录的分页，因为交易记录、在线重置俩页面是通过点击按钮切换的
      page: 1,
      limit: 20,
      hasMoreDataFlag: true,
    })
    this.getOrderList()
  },
  initOrder: function(){
    let _this = this
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
  /* 获取订单列表 */
  getOrderList: function () {
    let _this = this
    let todayFlag = true
    if (_this.data.itemStatusActiveFlag == true) {
      todayFlag = true
    }else{
      todayFlag = false
    }
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      today: todayFlag,
      page: _this.data.page,
      limit: _this.data.limit,
    }
    wx.showLoading({
      title: '加载中',
    })
    console.log('发送请求:', param)
    orderModel.getOrderList(param, (res) => {
      console.log('收到响应(订单列表):', res)
      wx.hideLoading()
      if (res.code === 0) {
        let tmp_orderList = res.data.list
        tmp_orderList.forEach(element => {
          element.mealTypeDes = _this.data.mealTypeMap[element.mealType]
          element.orderStatusDes = _this.data.orderStatusMap[element.orderStatus]
          element.orderTimeDes = moment(element.orderTime).format('YYYY-MM-DD HH:mm:ss')
        })
        //下面开始分页
        if (tmp_orderList.length < _this.data.limit) {
          console.log('1')
          if (tmp_orderList.length === 0) {
            wx.showToast({
              icon: "none",
              title: '没有更多数据'
            })
            _this.setData({
              hasMoreDataFlag: false
            })
          } else {
            _this.setData({
              orderList: tmp_orderList.concat(_this.data.orderList), //concat是拆开数组参数，一个元素一个元素地加进去
              hasMoreDataFlag: false
            })
          }
        } else {
          console.log('2')
          console.log(_this.data.orderList)
          _this.setData({
            orderList: tmp_orderList.concat(_this.data.orderList), //concat是拆开数组参数，一个元素一个元素地加进去
            hasMoreDataFlag: true,
            page: _this.data.page + 1
          })
        }
        console.log('changdu:',_this.data.orderList.length)
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /* 取消订单 */
  handleCancelOrder:function(e){
    console.log(e)
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    setTimeout(function(){ 
      _this.data.canClick = true
    },2000)
    wx.showModal({
      title: '提示',
      content: '是否取消订单？',
      success(res) {
        if (res.confirm) {
          let param = {
            userCode: wx.getStorageSync('userInfo').userCode, 
            orderCode: e.currentTarget.dataset.ordercode 
          }
          wx.showLoading({ //【防止狂点2】
            title: '加载中',
            mask: true
          })
          orderModel.cancelOrder(param,(res)=>{
            console.log('收到请求(取消订单):',res)
            if(res.code === 0){
              wx.hideLoading() 
              //刷新订单列表中该订单的状态值，使用setData响应式模板
              let tmp_orderList = _this.data.orderList
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatus = 'USER_CANCEL'
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatusDes = '已取消'
              _this.setData({
                orderList: tmp_orderList
              })  
              wx.showToast({
                title: '成功取消订单',
                icon: 'success',
                duration: 2000
              }) 
            }else{
              wx.hideLoading() 
              wx.showToast({
                title: res.msg,
                icon: 'none',
                duration: 2000
              })  
            }
          })
        } 
      }
    })
  },
  /* 去付款 */
  handleSecondpayOrder:function(e){
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    setTimeout(function(){ 
      _this.data.canClick = true
    },2000)
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode, 
      orderCode: e.currentTarget.dataset.ordercode 
    }
    orderModel.secondpayOrder(param,(res)=>{
      console.log('收到响应(再次付款):', res)
      if (res.code === 0) {
        let data = res.data
        if (data.timeStamp) {
          wx.requestPayment({
            'timeStamp': data.timeStamp.toString(),
            'nonceStr': data.nonceStr,
            'package': data.packageValue,
            'signType': data.signType,
            'paySign': data.paySign,
            success: function (e) {
              //刷新订单列表中该订单的状态值，使用setData响应式模板
              let tmp_orderList = _this.data.orderList
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatus = 'PAYED_WAITINT_CONFIRM'
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatusDes = '已支付'
              _this.setData({
                orderList: tmp_orderList
              })  
              wx.showToast({
                title: '成功支付订单',
                icon: 'success',
                duration: 2000
              }) 
            },
            fail: function (e) {
              wx.showToast({
                title: '已取消支付',
                icon: 'success',
                duration: 4000
              })
            },
            complete: function () {
              wx.hideLoading()
            }
          })
        }
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /* 去取餐 */
  handleTakeOrder:function(e){
    console.log(e)
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    wx.showModal({
      title: '提示',
      content: '是否取餐？',
      success(res) {
        if (res.confirm) {
          let param = {
            userCode: wx.getStorageSync('userInfo').userCode, 
            orderCode: e.currentTarget.dataset.ordercode 
          }
          wx.showLoading({ //【防止狂点2】
            title: '加载中',
            mask: true
          })
          orderModel.takeOrder(param,(res)=>{
            console.log('收到请求(取餐):',res)
            if(res.code === 0){
              wx.hideLoading() 
              wx.showToast({
                title: '成功取餐',
                icon: 'success',
                duration: 2000
              }) 
            }else{
              wx.hideLoading() 
              wx.showToast({
                title: res.msg,
                icon: 'none',
                duration: 2000
              })  
            }
          })
        } 
      }
    })
    setTimeout(function(){ 
      _this.data.canClick = true
    },2000)
  },
  /* 去评价 */
  handleEvaluateOrder:function(e){
    let _this = this
    _this.setData({
      showRatingsFlag: true,
      orderCode:e.currentTarget.dataset.ordercode
    }) 
  },
})