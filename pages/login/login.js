var t = require("../../comm/script/helper")
import { register } from '../register/register-model.js'
import { login } from './login-model.js'
let loginModel = new login()
let registerModel = new register()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
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

  },
  /* 注册 */
  register: function () {
    let _this = this
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
                validtion: _this.data.code, //短信验证码
                phoneNumber: _this.data.phone,
                headImage: userInfo.avatarUrl,
                sex: userInfo.gender,
                nickName: userInfo.nickName,
                name: _this.data.name,
                userType: "B_USER", //企业用户还是个人用户 B_USER  VISITOR
                organizeCode: "" //B_USER模式下需要改字段    
              }
              loginModel.register(param,(res)=>{
                console.log('收到请求(登录):',param,res)
                if(res.code === 0){
                  wx.showToast({
                    title: '发送成功',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.navigateTo({
                    url: '/pages/home/home'
                  })
                }else{
                  wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 2000
                  })  
                }
              })
            }
          },
          fail: function() {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 2000
            })  
          },
          complete: function() {
            // complete
          }
        })

      }
    } else wx.showToast({
      title: "手机号必须11位数字",
      icon: "none",
      duration: 2000
    })
  },
  /* 登录 */
  login: function () {
    let _this = this
    if (t._validCellPhone(_this.data.phone)){
      if(_this.data.code == ''){
        wx.showToast({
          title: "请输入手机验证码",
          icon: "none",
          duration: 2000
        })
      }else{
        wx.login({
          success: function(res){
            if(res.code){
              let param = {
                code: res.code, //微信code
                validtion: _this.data.code, //短信验证码
                phoneNumber: _this.data.phone
              }
              loginModel.login(param,(res)=>{
                console.log('收到请求(登录):',res)
                if(res.code === 0){
                  wx.showToast({
                    title: '发送成功',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.navigateTo({
                    url: '/pages/home/home'
                  })
                }else{
                  wx.showToast({
                    title: res.msg,
                    icon: 'none',
                    duration: 2000
                  })  
                }
              })
            }
          },
          fail: function() {
            wx.showToast({
              title: res.msg,
              icon: 'none',
              duration: 2000
            })  
          },
          complete: function() {
            // complete
          }
        })

      }
    } else wx.showToast({
      title: "手机号必须11位数字",
      icon: "none",
      duration: 2000
    })
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