import { home } from '../home/home-model.js'
let homeModel = new home()
import { myPublic } from '../public/public-model.js'
let myPublicModel = new myPublic()
import { mine } from '../mine/mine-model.js'
let mineModel = new mine()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageWidth: wx.getSystemInfoSync().windowWidth,
    userType: '普通用户',
    canClick:true,
    newUserFlag:false,
    showDaliFlag:false,
    redirectToFlag:1, //跳转到登录页  默认
    registered: false,
    userInfo:null,
    wel: "",
    propagandaList: ['比外卖便宜','全程保温','食品更安全','急速退款'],
    propagandaIconArr:['bianyihuo2','peisong','shipinanquan-','tuikuan'],
    swiperList:[],
    promotionList:[]
  },
  handleGotoLabel:function(e){
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    setTimeout(function(){ 
      _this.data.canClick = true
    },2000)
    let flag =  e.currentTarget.dataset.type
    let url = ''
    if(flag=='qianbao'){
      url = '/pages/mine/wallet/wallet'
    }else if(flag=='youhuiquan'){
      url = '/pages/mine/discount/discount'
    }else if(flag=='jifen'){
      url = '/pages/mine/integral/integral'
    }
    if(wx.getStorageSync('userInfo')){
      if(wx.getStorageSync('userInfo').userStatus == 'NO_CHECK'){
        wx.showToast({
          title: '审核中,请继续尝试',
          icon: 'none',
          duration: 2000
        }) 
      }else{
        wx.navigateTo({
          url: url,
        })
      }     
    }else{
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      }) 
    }
  },
  initHome:function(){
    let _this = this
    /* **********设置欢迎时间********** */
    var t = new Date().getHours();
    t >= 6 && t < 11 ? this.setData({
      wel: "早上好"
    }) : t >= 11 && t < 13 ? this.setData({
      wel: "中午好"
    }) : t >= 13 && t < 18 ? this.setData({
      wel: "下午好"
    }) : this.setData({
      wel: "晚上好"
    });
    /* **********获取轮播图********** */
    let paramSwiper = {
      limit:5,
      page:1
    }
    homeModel.getSwiperList(paramSwiper,(res)=>{
      console.log('获取轮播图:',res)
      if(res.code === 0){
        _this.setData({
          swiperList: res.data
        })
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })  
      }
    })

    /* **********获取推荐活动********** */
    let paramPromotion = {
      limit:5,
      page:1
    }
    homeModel.getPromotionList(paramPromotion,(res)=>{
      console.log('获取推荐活动:',res)
      if(res.code === 0){
        _this.setData({
          promotionList: res.data
        })
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })  
      }
    })
  },
  handleGotoMenu:function(){
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    setTimeout(function(){ 
      _this.data.canClick = true
    },2000)
    if(wx.getStorageSync('userInfo')){
      if(wx.getStorageSync('userInfo').userStatus == 'NO_CHECK'){
        wx.showToast({
          title: '审核中,请继续尝试',
          icon: 'none',
          duration: 500
        }) 
      }else{
        wx.navigateTo({
          url: '/pages/menu/menu',
        })
      }     
    }else{
      if(_this.data.redirectToFlag==1){ //未登录状态
        wx.navigateTo({
          url: '/pages/login/login',
        })
        wx.showToast({
          title: '请先登录再点餐',
          icon: 'none',
          duration: 2000
        }) 
      }else if(_this.data.redirectToFlag==3){ //未注册状态
        wx.navigateTo({
          url: '/pages/register/register',
        })
        wx.showToast({
          title: '请先注册再点餐',
          icon: 'none',
          duration: 2000
        }) 
      }      
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let _this = this
    _this.initHome()
    _this.handleRefreshUser() //每次onload都强制刷新用户状态
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    let userStatus = myPublicModel.getUserStatus()
    console.log(userStatus)
    if(userStatus!=0){
      wx.hideTabBar({})
    }else{
      wx.showTabBar({})
    }
    let tag = undefined 
    let tmp_userInfo = wx.getStorageSync('userInfo')
    if(tmp_userInfo==''){ //未登录状态，判断是否注册过
      tag = true
      //判断是否已注册
      wx.login({  
        success: function(res){
          if(res.code){
            let param = {
              code: res.code   
            }
            homeModel.getRegisteredFlag(param,(res)=>{
              console.log('是否已注册:',res)
              if(res.code === 0){
                if(res.data === true){ //已注册
                  _this.setData({
                    registered:true
                  })
                }else{ //未注册
                  _this.setData({
                    userInfo:null,
                    registered:false,
                    redirectToFlag:3 //3代表跳转到注册页
                  })
                }
              }
            })
          }
        }
      })
    }else{ //已登录状态，直接登录
      _this.setData({  //既然已经注册，就直接自动登录，即从缓存读信息
        userInfo:tmp_userInfo
      })
      if(tmp_userInfo.userStatus == 'NO_CHECK'){
        _this.setData({
          userType:'待审核,点击刷新'
        })        
      }
      if(tmp_userInfo.newUser==true){ 
        tag = true
        _this.setData({
          redirectToFlag:2 //新用户  不跳转
        })
      }else{
        tag = false
      } 
    }
    _this.setData({
      newUserFlag:tag,
      showDaliFlag:tag
    })


  },
  logout:function(){
    wx.removeStorageSync('userInfo')
    wx.navigateTo({
      url: '/pages/login/login',
    })
    wx.showToast({
      title: '注销成功',
      icon: 'success',
      duration: 2000
    })
  },
  closeDali:function(){
    this.setData({
      showDaliFlag:false
    })
  },
  /* 跳转到首页 */
  handleGotoLogin:function(){
    let _this = this
    if(_this.data.redirectToFlag==1){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      _this.setData({
        showDaliFlag:false
      })
    }else if(_this.data.redirectToFlag==3){
      wx.navigateTo({
        url: '/pages/register/register',
      })
      _this.setData({
        showDaliFlag:false
      })
    }else{
      //请求后端接口，领取新人礼包
      let param = {
        userCode: wx.getStorageSync('userInfo').userCode
      }
      homeModel.getNewUserGift(param,(res)=>{
        console.log('获取新人礼包后台反馈:',res)
        if(res.code === 0){
          let tmp_userInfo = wx.getStorageSync('userInfo')
          tmp_userInfo.newUser = false
          wx.setStorageSync('userInfo', tmp_userInfo)
          wx.showToast({
            title: '领取成功',
            icon: 'success',
            duration: 2000
          })
          _this.setData({
            showDaliFlag:false
          })
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })  
          setTimeout(function(){ 
            _this.setData({
              showDaliFlag:false
            })
          },2000) 
        }
      })
    }
  },
  /* 刷新用户状态信息 用于用户注册登录后，此时后台还没有审核该企业用户，当前小程序home页最上面显示button“刷新用户”*/
  handleRefreshUser:function(){
    let _this = this
    if(!_this.data.canClick){
      return
    }
    _this.data.canClick = false
    wx.login({
      success: function(res){
        console.log(res)
        if(res.code){
          if(wx.getStorageSync('userInfo')){ //已经登录
            let param = {
              code: res.code, //微信code
              phoneNumber: wx.getStorageSync('userInfo').phoneNumber
            }
            mineModel.getMineData(param,(res)=>{
              if(res.code == 0){
                wx.setStorageSync('userInfo', res.data)
                _this.setData({
                  userInfo:res.data
                })
                if(wx.getStorageSync('userInfo').userStatus == 'NO_CHECK'){
                  wx.showToast({
                    title: '审核中,请继续尝试',
                    icon: 'none',
                    duration: 2000
                  })                   
                }else{
                  wx.showTabBar({})
                }
              }
            })
          }/* else{
            setTimeout(function(){ 
              wx.navigateTo({
                url: '/pages/login/login',
              }) 
            },500) 
          } */
        }
      }
    })
    setTimeout(function(){ 
      _this.data.canClick = true
    },500)
  }


})