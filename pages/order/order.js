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
    windowHeight: 0,
    scrollTop: 0,
    //
    page:1,//页数
    limit:10,//加载个数
    itemStatusActiveFlag:true, //默认今日待取
    orderList:null,
    orderListNoResult: false,
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
      this.getOrderList()
    }else{

    }
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
  getOrderList:function(){
    let _this = this
    let todayFlag = true
    if (_this.data.itemStatusActiveFlag == true) {
      todayFlag = true
    }else{
      todayFlag = false
    }
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      orderStatus: "",
      today: todayFlag,
      today: false,
      page: _this.data.page,
      limit: _this.data.limit,
    }
    wx.showLoading({ 
      title: '加载中',
    })
    orderModel.getOrderList(param,(res)=>{
      console.log('收到请求(订单列表):',res)
      wx.hideLoading() 
      if(res.code === 0){
        let orderStatusMap = {
          NO_PAY:'未支付',
          PAYED_WAITINT_CONFIRM:'已支付',
          CONFIRM_WAITING_MAKE:'待制作',
          MAKING:'开始制作',
          MAKED_WAITING_DELIVERY:'待配送',
          DELIVERING:'配送中',
          DELIVERED_WAITING_PICK:'待取货',
          PICKED_WAITING_EVALUATE:'待评价',
          NO_PICK_WAITING_BACK:'超时未取货待取回'
        }
        let mealTypeMap = {
          BREAKFAST:'早餐',
          LUNCH:'午餐',
          DINNER:'晚餐',
          NIGHT:'夜宵'
        }
        let tmp_orderList = res.data.list
        tmp_orderList.forEach(element => {
          element.mealTypeDes = mealTypeMap[element.mealType]
          element.orderStatusDes = orderStatusMap[element.orderStatus]
          element.orderTimeDes = moment(element.orderTime).format('YYYY-MM-DD HH:mm:ss')
        })
        console.log(this.data.tmp_orderList)
        _this.setData({
          orderList: tmp_orderList
        }) 
        if(res.data.length==0){
          _this.setData({
            orderListNoResult: true //查到订单列表无结果，则相应视图
          })   
        } else {
          _this.setData({
            orderListNoResult: false
          })  
        }                     
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        }) 
      }
    })
  }, 
})