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
    windowHeight: 0,
    loading: false,
    showAddressFlag:false,
    showGobackFlag:false,
    location: {},
    organizeList:[],
    organize: '',
    organizeCode: '',
    search: '',
    phone:'',
    code:'',
/*     target:'', */
    firstCode: true,
    waitTime: -1,
    action: "",
    userInfo: {},
    organizeListNoResult: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  initRegister: function(){
    let _this = this;
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
  },
  showAddress:function(){
    let _this = this
    _this.setData({
      showAddressFlag: true
    });
    _this.initRegister()
    //请求经纬度信息，以便注册
    wx.getLocation({
      type: 'gcj02', 
      success: function(res){
        console.log('地理位置：',res)
        let param = {
          myLongitude: res.longitude, 
          myLatitude: res.latitude
        }
        wx.showLoading({ 
          title: '加载中'
        })
        //请求企业列表
        registerModel.getOrganizeListByLocation(param,(res)=>{
          console.log('收到请求(企业列表):',res)
          wx.hideLoading() 
          if(res.code === 0){
            _this.setData({
              organizeList: res.data,
              showGobackFlag: true
            })                       
          }
        }) 
      }
    })
  },
  getDistancesDes:function(distance){
    return distance/1000
  },
  changeShowAddressFlag:function(){
    this.setData({
      showAddressFlag: !this.data.showAddressFlag
    });
  },
  selectOrganize:function(e){
    this.setData({
      organize: e.currentTarget.dataset.organizename
    });
    this.data.organizeCode = e.currentTarget.dataset.organizecode
    console.log(this.data.organizeCode)
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
    wx.showLoading({ 
      title: '加载中',
    })
    //请求企业列表
    registerModel.getOrganizeListByLocation(param,(res)=>{
      console.log('收到请求(企业列表):',res)
      wx.hideLoading() 
      if(res.code === 0){
        _this.setData({
          organizeList: res.data
        })   
        if(res.data.length==0){
          _this.setData({
            organizeListNoResult: true //查到企业列表无结果，则相应视图
          })   
        } else {
          _this.setData({
            organizeListNoResult: false
          })  
        }                     
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
  register:function(res){ //点击注册，先获取个人信息，这个是微信小程序的坑，只能通过这个button来实现
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
                phoneNumber: _this.data.phone,
                nickName: userInfo.nickName,
                headImage: userInfo.avatarUrl,
                sex: userInfo.gender,
                name: _this.data.name,
                userType: "B_USER", //企业用户还是个人用户 B_USER  VISITOR
                organizeCode: _this.data.organizeCode //B_USER模式下需要改字段    
              }
              _this.setData({ //【防止狂点1】
                loading: true
              })
              wx.showLoading({ //【防止狂点2】
                title: '加载中',
                mask: true
              })
              registerModel.register(param,(res)=>{
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
                  app.globalData.userInfo = tmp_userInfo //设置全局变量
                  setTimeout(function(){ //提示注册成功，两秒后跳转到首页
                    wx.switchTab({
                      url: '/pages/home/home',
                    })
                    wx.hideLoading() //【防止狂点3】
                    wx.showToast({
                      title: '注册成功',
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
    } else {
      wx.showToast({
        title: "手机号必须11位数字",
        icon: "none",
        duration: 2000
      })   
    }
  },


})