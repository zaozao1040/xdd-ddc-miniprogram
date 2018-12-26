// pages/register/register.js
var t = require("../../comm/script/helper")
import { register } from './register-model.js'
let registerModel = new register()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAddressFlag: true,//showAddressFlag: false,
    location: {},
    organizeList:[],
    organize: '',
    search: '',
    phone:'',
    code:'',
    target:'',
    firstCode: true,
    waitTime: -1,
    action: "",
    userInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    //获取微信用户信息
    wx.getUserInfo({
      success(res) {
        _this.setData({
          userInfo: res.userInfo
        })
      }
    })
    //请求经纬度信息，以便注册
    wx.getLocation({
      type: 'gcj02', 
      success: function(res){
        console.log('地理位置：',res)
        let param = {
          myLongitude: res.longitude, 
          myLatitude: res.latitude
        }
        //请求企业列表
        registerModel.getOrganizeListByLocation(param,(res)=>{
          console.log('收到请求(企业列表):',res)
          if(res.code === 0){
            _this.setData({
              organizeList: res.data
            })                        
          }
        })
      },
      fail: function(res) {
      },
      complete: function() {
        // complete
      }
    })
  },
  showAddress:function(){
    this.setData({
      showAddressFlag: true
    });
  },
  getDistancesDes:function(distance){
    return distance/1000
  },
  changeShowAddressFlag:function(){
    this.setData({
      showAddressFlag: false
    });
  },
  selectorganize:function(e){
    console.log(e,e.currentTarget.dataset.organizename)
    this.setData({
      organize: e.currentTarget.dataset.organizename
    });
    this.changeShowAddressFlag()
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
  nameInput: function(e) {
    this.setData({
      name: e.detail.value
    });
  },
  organizeInput: function(e) {
    this.setData({
      organize: e.detail.value
    });
  },
  searchInput: function(e) {
    let _this = this
    _this.setData({
      search: e.detail.value
    });
    let param = {
      organizeName: e.detail.value
    }
    //请求企业列表
    registerModel.getOrganizeListByLocation(param,(res)=>{
      console.log('收到请求(企业列表):',res)
      if(res.code === 0){
        _this.setData({
          organizeList: res.data
        })                        
      }
    })
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
              registerModel.register(param,(res)=>{
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
              registerModel.login(param,(res)=>{
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