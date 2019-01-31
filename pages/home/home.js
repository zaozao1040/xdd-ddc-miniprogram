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
    canClick: true,
    showDaliFlag: false, //显示新人大礼的标志 默认不显示
    showCheckFlag: false, //显示审核状态框标志 默认不显示
    showUserAuthFlag: false, //显示用户授权框标志 默认不显示
    registered: false,
    userInfo: null,
    wel: "",
    propagandaList: ['比外卖便宜', '全程保温', '食品更安全', '急速退款'],
    propagandaIconArr: ['bianyihuo2', 'peisong', 'shipinanquan-', 'tuikuan'],
    imagesList: []
  },
  handleGotoLabel: function (e) {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    setTimeout(function () {
      _this.data.canClick = true
    }, 2000)
    let flag = e.currentTarget.dataset.type
    let url = ''
    if (flag == 'qianbao') {
      url = '/pages/mine/wallet/wallet'
    } else if (flag == 'youhuiquan') {
      url = '/pages/mine/discount/discount'
    } else if (flag == 'jifen') {
      url = '/pages/mine/integral/integral'
    }
    if (wx.getStorageSync('userInfo')) {
      if (wx.getStorageSync('userInfo').userStatus == 'NO_CHECK') {
        wx.showToast({
          title: '审核中,请继续尝试',
          icon: 'none',
          duration: 2000
        })
      } else {
        wx.navigateTo({
          url: url,
        })
      }
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
    }
  },
  initHome: function () {
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
    // 获取首页图片
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode
    }
    homeModel.getImages(param, (res) => {
      console.log('获取首页图片:', res)
      if (res.code === 0) {
        this.setData({
          imagesList: res.data
        })
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  handleGotoMenu: function () {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    setTimeout(function () {
      _this.data.canClick = true
    }, 2000)
    wx.navigateTo({
      url: '/pages/menu/menu',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    _this.initHome()

    let tmp_userInfo = wx.getStorageSync('userInfo')
    if (tmp_userInfo == '') { //未登录状态，弹出授权框，隐藏底部状态栏
      _this.setData({
        showUserAuthFlag: true
      })
      wx.hideTabBar({})
    } else { //已登录状态，直接登录
      _this.setData({  //既然已经注册，就直接自动登录，即从缓存读信息
        userInfo: tmp_userInfo
      })
      wx.showTabBar({})
      if (tmp_userInfo.userStatus == 'NO_CHECK') { //企业用户的'审核中'状态,而其他的状态无需隐藏
        _this.setData({
          showCheckFlag: true
        })
        wx.hideTabBar({})
      }
      if ((tmp_userInfo.bindOrganized == false || tmp_userInfo.bindOrganized == true && tmp_userInfo.userStatus == 'NORMAL') && (tmp_userInfo.canTakeDiscount == true)) {   //在登录状态下判断用户类型，企业用户的normal状态显示新人大礼，一般用户的登录状态显示新人大礼
        _this.setData({
          showDaliFlag: true
        })
      }
    }
  },
  logout: function () {
    wx.removeStorageSync('userInfo')
    wx.removeStorageSync('getWxUserInfo')
    wx.reLaunch({
      url: '/pages/home/home',
    })
    wx.showToast({
      title: '注销成功',
      image: '../../images/msg/success.png',
      duration: 2000
    })
  },
  closeDali: function () {
    this.setData({
      showDaliFlag: false
    })
  },
  /* 领取新人大礼 */
  getNewUserGift: function () {
    let _this = this
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode
    }
    homeModel.getNewUserGift(param, (res) => {
      console.log('获取新人礼包后台反馈:', res)
      if (res.code === 0) {
        let tmp_userInfo = wx.getStorageSync('userInfo')
        tmp_userInfo.newUser = false
        wx.setStorageSync('userInfo', tmp_userInfo)
        wx.showToast({
          title: '领取成功',
          image: '../../images/msg/success.png',
          duration: 2000
        })
        _this.setData({
          showDaliFlag: false
        })
      } else {
        wx.showToast({
          title: res.msg,
          image: '../../images/msg/error.png',
          duration: 2000
        })
        setTimeout(function () {
          _this.setData({
            showDaliFlag: false
          })
        }, 2000)
      }
    })
  },
  /* 刷新用户状态信息 用于用户注册登录后，此时后台还没有审核该企业用户，当前小程序home页最上面显示button“刷新用户”*/
  handleRefreshUser: function () {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    wx.login({
      success: function (res) {
        if (res.code) {
          if (wx.getStorageSync('userInfo')) { //已经登录
            let param = {
              code: res.code, //微信code
              userCode: wx.getStorageSync('userInfo').userCode
            }
            mineModel.getMineData(param, (res) => { //刷新用户信息后再跳转到首页
              if (res.code == 0) {
                if (res.data.userStatus == 'NORMAL') {
                  wx.setStorageSync('userInfo', res.data)
                  wx.reLaunch({  //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
                    url: '/pages/home/home',
                  })
                  wx.showToast({
                    title: '登录成功',
                    image: '../../images/msg/success.png',
                    duration: 2000
                  })
                } else {
                  wx.showToast({
                    title: '企业审核中..',
                    image: '../../images/msg/warning.png',
                    duration: 3000
                  })
                }
              }
            })
          }
        }
      }
    })
    setTimeout(function () {
      _this.data.canClick = true
    }, 500)
  },
  /*   用户授权弹框-获取微信授权 */
  getWxUserInfo(e) {
    console.log(e)
    if (e.detail.iv) { //这个字段存在，代表授权成功
      wx.setStorageSync('getWxUserInfo', e.detail.userInfo)
      wx.redirectTo({
        url: '/pages/login/selectPhone/selectPhone',
      })
    }
  },


})