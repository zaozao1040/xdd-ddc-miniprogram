var t = require("../../../comm/script/helper")
import { mine } from '../mine-model.js'
import { phone } from './phone-model.js'
let mineModel = new mine()
let phoneModel = new phone()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canClick:true,
    loading: false,
    phone: '',
    code:'',
    firstCode: true,
    waitTime: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    setTimeout(function(){ 
      _this.data.canClick = true
    },5000)
    //获取短信验证码
    let param = {
      phoneNumber:_this.data.phone
    }
    mineModel.getVerificationCode(param,(res)=>{
      console.log('收到请求(获取验证码):',res)
      if(res.code === 0){
        wx.showToast({
          title: '发送成功',
          image: '../../../images/msg/success.png',
          duration: 2000
        })
        _this.setData({
          firstCode: false
        })
        let countdown = 60
        for (var i = 60; i >= 0; i--){
          setTimeout(function(){
            _this.setData({
              waitTime: countdown
            })
            countdown--
          },1000*i)      
        }
      }else{
        wx.showToast({
          title: res.msg,
          image: '../../../images/msg/error.png',
          duration: 2000
        })  
      }
    })
  },
  changePhone:function(){
    let _this = this
    if (t._validCellPhone(_this.data.phone)){
      if(_this.data.code == ''){
        wx.showToast({
          title: "请输入验证码",
          image: '../../../images/msg/error.png',
          duration: 2000
        })
      }else{
        wx.login({
          success: function(res){
            if(res.code){
              let param = {
                userCode: wx.getStorageSync('userInfo').userCode, 
                validation: _this.data.code, //短信验证码
                phoneNumber: _this.data.phone
              }
              _this.setData({ //【防止狂点1】
                loading: true
              })
              wx.showLoading({ //【防止狂点2】
                title: '加载中',
                mask: true
              })
              phoneModel.changePhone(param,(res)=>{
                console.log('收到请求(更换手机):',res)
                if(res.code === 0){
                  let tmp_userInfo = wx.getStorageSync('userInfo')
                  tmp_userInfo.phoneNumber = _this.data.phone
                  wx.setStorageSync('userInfo', tmp_userInfo)
                  setTimeout(function(){ //提示修改手机号成功，两秒后跳转到’我的‘
                    wx.switchTab({
                      url: '/pages/mine/mine',
                    })
                    wx.hideLoading() //【防止狂点3】
                    wx.showToast({
                      title: '手机更换成功',
                      image: '../../../images/msg/success.png',
                      duration: 2000
                    })
                  },2000) 
                }else{
                  wx.showToast({
                    title: res.msg,
                    image: '../../../images/msg/error.png',
                    duration: 2000
                  })  
                  _this.setData({
                    loading: false
                  })
                }
              })
            }
          }
        })

      }
    } else {
      wx.showToast({
        title: "手机必须11位数字",
        image: '../../../images/msg/error.png',
        duration: 2000
      })   
    }
  },




})