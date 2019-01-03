// pages/menu/confirm/confirm.js
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
  },

  /**
   * 付款 提交菜单
   */
  handleCommitMenu: function(){
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    wx.showLoading({ 
      title: '结算中',
      mask: true
    })
    let param = {   //这个参数相当庞大
      userCode:wx.getStorageSync('userInfo').userCode,
      organizeCode:wx.getStorageSync('userInfo').organizeCode,
      deliveryAddressCode:wx.getStorageSync('userInfo').addressCode,
      totalAllPrice:_this.data.totalMoney,//总价
      standardAllPrice:_this.data.totalMoneyDeduction,//餐标总价格
      payAllPrice:_this.data.realMoney,//需要付款总价
      payType: "WECHAT_PAY",//支付方式


      code: res.code, //微信code
      validation: _this.data.code, //短信验证码
      phoneNumber: _this.data.phone,
      nickName: userInfo.nickName,
      headImage: userInfo.avatarUrl,
      sex: userInfo.gender,
      name: _this.data.name,
      userType: "B_USER", //企业用户还是个人用户 B_USER  VISITOR
      organizeCode: _this.data.organizeCode //B_USER模式下需要改字段    
    }
    menuModel.commitMenuData(param,function(res){
      console.log('收到请求(结算菜单):',res)
      if(res.code === 0){
        wx.setStorageSync('userInfo', res.data)
        setTimeout(function(){ //提示结算成功，两秒后跳转到首页
          wx.switchTab({
            url: '/pages/home/home',
          })
          wx.hideLoading() //【防止狂点3】
          wx.showToast({
            title: '结算成功',
            icon: 'success',
            duration: 2000
          })
        },2000) 
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })  
      }
    })





    setTimeout(function(){ 
      _this.data.canClick = true
    },300)
    wx.hideLoading()
  },
})