// pages/login/login.js
//var e = require("../../component/loading/loading"), a = require("../../comm/script/model"), t = require("../../comm/script/helper"), o = //require("../../comm/script/order-helper"), r = require("../../comm/script/menu-helper"), i = null;
var t = require("../../comm/script/helper")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    code:'',
    target:'',
    firstCode: true,
    waitTime: -1,
    action: "",
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
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value
    });
  },
  codeInput: function(e) {
    this.setData({
      code: e.detail.value
    });
  },
  sendCode: function () {
    let _this = this
    _this.setData({
      firstCode: false
    })
    let countdown = 30
    for (var i = 30; i >= 0; i--){
      setTimeout(function(){
        _this.setData({
          waitTime: countdown
        })
        countdown--
      },1000*i)      
    }
  },
  login: function () {
    if (t._validCellPhone(this.data.phone)){
      if(this.data.code == ''){
        wx.showToast({
          title: "请输入手机验证码",
          icon: "none",
          duration: 2000
        })
      }else{
        wx.request({
          url: 'login.php',
          data:{
            phone: this.data.phone,
            code: this.data.code
          },
          success(res){
            //-----------处理
            wx.navigateTo({
              url: '../loginInfo/loginInfo?phone='+this.data.phone,
            })
          }
        })
      }
    } else wx.showToast({
      title: "请输入正确的手机号",
      icon: "none",
      duration: 2000
    })
    //this.checkPhone(this.data.phone)
  },
/*   checkPhone(phoneNum){
    let str = /^1[0-9]{10}$/   
    if (str.test(phoneNum)) {
      return true
    } else {
      wx.showToast({
        title: '手机号不正确',
      })
      return false
    }
  } */


})