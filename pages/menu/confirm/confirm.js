import { confirm } from './confirm-model.js'
let confirmModel = new confirm()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    canClick:true,
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
    let _this = this
    let tmp_address = wx.getStorageSync('userInfo').address
    _this.setData({  
      address: tmp_address
    })
  },
  /* 清空缓存 */
  clearCache:function(){
    let _this = this
    app.globalData.cacheMenuDataAll = [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]]
    app.globalData.selectedFoods = []
    app.globalData.totalCount = 0
    app.globalData.totalMoney = 0
    _this.setData({  
      cacheMenuDataAll: [[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]],
      selectedFoods : [],
      totalCount: 0,
      totalMoney: 0,
      totalMoneyDeduction:0, 
      realMoney:0
    })
  },
  /**
   * 付款 提交菜单
   */
  handleCommitPay: function(){
    if(!wx.getStorageSync('userInfo').addressCode){
      wx.showToast({
        title: '请先选择地址',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    wx.showLoading({ 
      title: '处理中',
      mask: true
    })
    /**** 拼接这个庞大的参数 ****/
    let tmp_param = {
      userCode:wx.getStorageSync('userInfo').userCode,
      organizeCode:wx.getStorageSync('userInfo').organizeCode,
      deliveryAddressCode:wx.getStorageSync('userInfo').addressCode,
      totalAllPrice:_this.data.totalMoney,//总价格：所有
      standardAllPrice:_this.data.totalMoneyDeduction,//额度的总价格
      payAllPrice:_this.data.realMoney,//自费的总价格
      payType:'WECHAT_PAY',//支付方式
      orderDetail: []
    }
    getApp().globalData.selectedFoods.forEach(element1 => {
      let dayDes = element1.dayDes
      element1.dayInfo.forEach(element2=>{
        let foodTypeDes = element2.foodTypeDes
        let organizeMealLabel = element2.organizeMealLabel
        let mealLabelUsed = element2.mealLabelUsed
        let orderDetail_item = {
          mealDate:dayDes,
          mealType:foodTypeDes,
          mark:"我是备注",
          totalPrice: undefined,//先占位
          //standardPrice:organizeMealLabel,
          standardPrice:undefined,//先占位
          payPrice: undefined,//先占位
          orderFood:[]
        }
        let tmp_totalPrice = 0
        element2.foodTypeInfo.forEach(element3=>{
          tmp_totalPrice += element3.foodCount * element3.foodPrice
          let orderFood_item = {
            foodCode : element3.foodCode,
            name : element3.foodName,
            quantity : element3.foodCount,
            price : element3.foodPrice,
            mark : "我是备注"
          }
          orderDetail_item.orderFood.push(orderFood_item)
        })
        orderDetail_item.totalPrice = tmp_totalPrice
        if(mealLabelUsed==true){
          orderDetail_item.payPrice = tmp_totalPrice 
          orderDetail_item.standardPrice = 0 
        }else{
          orderDetail_item.payPrice = tmp_totalPrice - organizeMealLabel
          orderDetail_item.standardPrice = organizeMealLabel 
        }
        tmp_param.orderDetail.push(orderDetail_item)
      })
    })
    console.log('提交菜单请求参数:',tmp_param)
    let param = tmp_param
    if(param.payAllPrice=='0.00'||param.payAllPrice==0||param.payAllPrice=='0'){
      param.payType='STANDARD_PAY'//支付方式
    }
    confirmModel.commitConfirmMenuData(param,function(res){
      console.log('支付结果返回：',res)
      if(res.code === 0){
        let data = res.data.payData
        if(param.payType=='WECHAT_PAY'){ //微信支付
          if (data.timeStamp) {
            wx.requestPayment({
              'timeStamp': data.timeStamp.toString(),
              'nonceStr': data.nonceStr,
              'package': data.packageValue,
              'signType': data.signType,
              'paySign': data.paySign,
              success: function (e) {
                wx.switchTab({
                  url: '/pages/order-list/order-list',
                })
                wx.showToast({
                  title: '结算成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              fail: function (e) {
                wx.switchTab({
                  url: '/pages/order-list/order-list',
                })
                wx.showToast({
                  title: '已取消付款',
                  icon: 'success',
                  duration: 4000
                })
              },
              complete: function() {
                wx.hideLoading()
                setTimeout(function(){ 
                  _this.clearCache() //清空缓存
                },2000) 
              }
            })
          }          
        }else if(param.payType=='STANDARD_PAY'){
          console.log('&&&&&',res)
          if(res.code==0){
            _this.clearCache() //清空缓存
            wx.hideLoading()
            wx.switchTab({
              url: '/pages/order-list/order-list',
            })
            wx.showToast({
              title: '下单成功',
              icon: 'success',
              duration: 4000
            })
          }else{
            wx.hideLoading()
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 4000
            })
          }
        }else{
          wx.hideLoading()
          //      其他支付方式，待开发
        }
      }else{
        _this.clearCache() //清空缓存
        wx.hideLoading()
        wx.showToast({
          title: '菜品变更,请重新下单',
          icon: 'none',
          duration: 2000
        })  
      }
    })
    setTimeout(function(){ 
      _this.data.canClick = true
    },300)
  },

  /* 重新选择默认地址 */
  handleSelectAddress:function(){
    wx.navigateTo({
      url: '/pages/mine/address/address?frontPageFlag=confirm',
    }) 
  }
})


