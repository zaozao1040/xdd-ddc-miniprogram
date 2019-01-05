import { home } from '../home/home-model.js'
let homeModel = new home()
import { myPublic } from '../public/public-model.js'
let myPublicModel = new myPublic()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newUserFlag:false,
    showDaliFlag:true,
    redirectToFlag:1,
    registered: false,
    userInfo:null,
    wel: "",
    propagandaList: ['比外卖便宜','全程保温','食品更安全','急速退款'],
    propagandaIconArr:['bianyihuo2','peisong','shipinanquan-','tuikuan'],
    swiperList:[],
    promotionList:[]
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
    let userStatus = myPublicModel.getUserStatus()
    console.log(userStatus)
    if(userStatus!=0){
      return
    }
    wx.navigateTo({
      url: '/pages/menu/menu',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let userStatus = myPublicModel.getUserStatus()
    console.log(userStatus)
    if(userStatus!=0){
      wx.hideTabBar({})
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let _this = this
    _this.initHome()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    if(wx.getStorageSync('userInfo')==''){
      _this.setData({
        newUserFlag:true,
        showDaliFlag:true
      })
    }else{
      if(wx.getStorageSync('userInfo').newUser==true){
        _this.setData({
          newUserFlag:true,
          showDaliFlag:true,
          redirectToFlag:2
        })
      }/* else{
        console.log('777')
        _this.setData({
          newUserFlag:false
        })
      } */
    }
    /* **********判断是否已注册********** */
    wx.login({
      success: function(res){
        if(res.code){
          let param = {
            code: res.code   
          }
          homeModel.getRegisteredFlag(param,(res)=>{
            console.log('是否已注册:',res)
            if(res.code === 0){
              if(res.data === true){
                _this.setData({
                  registered:true
                })
                //既然已经注册，就直接自动登录，即从缓存读信息
                let tmp_userInfo = wx.getStorageSync('userInfo')
                _this.setData({
                  userInfo:tmp_userInfo
                })
              }
            }
          })
        }
      }
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
  handleGotoLogin:function(){
    let _this = this
    if(_this.data.redirectToFlag==1){
      wx.navigateTo({
        url: '/pages/login/login',
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
  }


})