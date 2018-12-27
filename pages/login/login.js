var t = require("../../comm/script/helper")
import { register } from '../register/register-model.js'
import { login } from './login-model.js'
let loginModel = new login()
let registerModel = new register()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    phone:'',
    code:'',
    firstCode: true,
    waitTime: -1,
/*     action: "",
    userInfo: {} */
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
    //获取短信验证码
    let param = {
      phoneNumber:_this.data.phone
    }
    registerModel.getVerificationCode(param,(res)=>{
      console.log('收到请求(获取验证码):',res)
      if(res.code === 0){
        wx.showToast({
          title: '发送成功',
          icon: 'success',
          duration: 2000
        })
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
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })  
      }
    })
  },
  /* 登录 */
  login:function(res){ //点击登录，先获取个人信息，这个是微信小程序的坑，只能通过这个button来实现
    let _this = this
    this.data.userInfo = {
      nickName:res.detail.userInfo.nickName,
      avatarUrl:res.detail.userInfo.avatarUrl,
      gender:res.detail.userInfo.gender
    }  
    if (t._validCellPhone(_this.data.phone)){
      if(_this.data.code == ''){
        wx.showToast({
          title: "请输入手机验证码",
          icon: "none",
          duration: 2000
        })
      }else{
        let userInfo = this.data.userInfo
        wx.login({
          success: function(res){
            if(res.code){
              let param = {
                code: res.code, //微信code
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
              loginModel.login(param,(res)=>{
                console.log('收到请求(登录):',param,res)
                if(res.code === 0){
                  let tmp_userInfo = {
                    phoneNumber: _this.data.phone,
                    nickName: userInfo.nickName,
                    headImage: userInfo.avatarUrl,
                    sex: userInfo.gender,
                    name: _this.data.name,
                    userType: "B_USER", 
                    organizeCode: _this.data.organizeCode,
                    organize: _this.data.organize    
                  }
                  getApp().globalData.userInfo = tmp_userInfo //设置全局变量 以及缓存变量
                  wx.setStorageSync('userInfo', tmp_userInfo)
                  setTimeout(function(){ //提示登录成功，两秒后跳转到首页
                    wx.switchTab({
                      url: '/pages/home/home',
                    })
                    wx.hideLoading() //【防止狂点3】
                    wx.showToast({
                      title: '登录成功',
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
        title: "手机号必须11位数字",
        icon: "none",
        duration: 2000
      })   
    }
  },


})