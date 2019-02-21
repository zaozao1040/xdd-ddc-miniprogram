import { mine } from './mine-model.js'
let mineModel = new mine()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    windowHeight: 0,
    scrollTop: 0,
    //用户信息
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userInfo: null,
    //
    //labelList:['换绑手机','绑定企业','地址管理','浏览记录','下单闹钟','客户服务','推荐有奖','更多'],
    //labelIconArr: ['shouji1','qiye1','dizhi','zuji','naozhong','kefu','bajiefuli','gengduo'],
    labelList: ['加班餐/补餐', '换绑手机', '绑定企业', '地址管理', '客户服务'],
    labelIconArr: ['canting', 'shouji1', 'qiye1', 'dizhi', 'kefu'],
    navigatorUrl: [
      '/pages/mine/addfood/addfood',
      '/pages/mine/phone/phone',
      '/pages/mine/organize/organize',
      '/pages/mine/address/address',
      '/pages/mine/service/service'
    ],
    //客服电话
    servicePhone: null,
  },
  initMine: function () {
    let _this = this
    wx.getSystemInfo({
      success: function (res) {
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
    let tmp_userInfo = wx.getStorageSync('userInfo')
    _this.setData({
      userInfo: tmp_userInfo
    })
  },
  /* 跳转 */
  handleClickLabel: function (e) {
    let _this = this
    let url = _this.data.navigatorUrl[e.currentTarget.dataset.labelindex]
    if (e.currentTarget.dataset.labelitem == '绑定企业') {
      if (wx.getStorageSync('userInfo').bindOrganized == true) {
        wx.showToast({
          title: '已绑定过企业',
          image: '../../images/msg/warning.png',
          duration: 3000
        })
      } else {
        wx.navigateTo({
          url: url
        })
      }
    } else if (e.currentTarget.dataset.labelitem == '客户服务') {
      //请求客服电话
      let param = {

      }
      wx.showLoading({ //【防止狂点2】
        title: '获取电话中',
        mask: true
      })
      mineModel.getServicePhoneData(param, (res) => {
        console.log('收到请求(客服电话):', res)
        if (res.code === 0) {
          wx.hideLoading()
          _this.data.servicePhone = res.data.contactPhone
/*           _this.setData({
            servicePhone: res.data.contactPhone
          }) */
          wx.showModal({
            title: '是否拨打客户电话?',
            content: res.data.contactPhone,
            confirmText: '拨打',
            cancelText: '返回',
            success(res) {
              if (res.confirm) {
                wx.makePhoneCall({
                  phoneNumber: _this.data.servicePhone
                })
              }
            }
          })          
        }
      })
    } else {
      wx.navigateTo({
        url: url
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

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
    let _this = this
    //初始化，获取一些必要参数，如高度
    _this.initMine()
    wx.login({
      success: function (res) {
        if (res.code) {
          let param = {
            code: res.code, //微信code
            userCode: wx.getStorageSync('userInfo').userCode
          }
          wx.showLoading({ //【防止狂点2】
            title: '加载中',
            mask: true
          })
          mineModel.getMineData(param, (res) => {
            console.log('收到请求(我的):', res)
            if (res.code === 0) {
              wx.setStorageSync('userInfo', res.data) //更新缓存的userInfo
              _this.setData({
                userInfo: res.data
              })
              wx.hideLoading() //【防止狂点3】
            } else {
              wx.showToast({
                title: res.msg,
                icon: 'none',
                duration: 2000
              })
            }
          })
        }
      }
    })
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

  }
})