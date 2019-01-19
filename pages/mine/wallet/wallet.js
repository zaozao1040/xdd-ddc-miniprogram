import { wallet } from './wallet-model.js'
let walletModel = new wallet()
import moment from "../../../comm/script/moment"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canClick: true,
    listCanGet: true,
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 20, // 每页条数
    hasMoreDataFlag: true,//是否还有更多数据  默认还有
    //
    windowHeight: 0,
    scrollTop: 0,
    buttonTop: 0,
    //
    itemStatusActiveFlag: true,
    moneyList: [[6, 12, 68], [108, 218, 318], [468, 618, 888]],
    itemMoneyActiveFlag: [0, 2],//默认0行2列，也就是人民币68
    activeFlag1: undefined,
    activeFlag2: undefined,
    selectedMoney: 0,
    explainDes: {
      one: '充值金额暂不支持跨平台使用，暂不支持退款、提现、转赠他人',
      two: '若充值遇到问题请联系1855748732',
      three: '若充值遇到问题请联系1855748732',
    },
    userInfo: null,
    rechargeList: [],
    rechargeListNoResult: false,
  },
  initWallet: function () {
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
    const query_1 = wx.createSelectorQuery()
    query_1.select('.c_buttonPosition_forCalculate').boundingClientRect()
    query_1.selectViewport().scrollOffset()
    query_1.exec(function (res) {
      _this.setData({
        buttonTop: res[0].top // #the-id节点的上边界坐标
      })
    })
    let tmp_userInfo = wx.getStorageSync('userInfo')
    _this.setData({
      userInfo: tmp_userInfo
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
    _this.initWallet()
    this.setData({
      page: 1,
      limit: 20,
      rechargeList: [] //列表必须清空，否则分页会无限叠加
    })
  },

  /* 手动点击触发下一页 */
  gotoNextPage: function () {
    if (this.data.hasMoreDataFlag) {
      this.getRechargeList()
      wx.showLoading({
        title: '点击加载更多',
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '没有更多数据'
      })
    }
  },
  changeItemStatusActiveFlag: function (e) {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    setTimeout(function () {
      _this.data.canClick = true
    }, 500)
    if (e.currentTarget.dataset.flag == 'chongzhi') {
      _this.setData({
        itemStatusActiveFlag: true
      })
    } else if (e.currentTarget.dataset.flag == 'jiaoyi') {
      _this.setData({
        itemStatusActiveFlag: false,
        rechargeList: [], // 这四个要重置，为了交易记录的分页，因为交易记录、在线重置俩页面是通过点击按钮切换的
        page: 1,
        limit: 20,
        hasMoreDataFlag: true,
      })
      _this.getRechargeList()
    } else { }
  },
  /* 获取交易记录列表 */
  getRechargeList: function () {
    let _this = this
    if (!_this.data.listCanGet) {
      return
    }
    _this.data.listCanGet = false
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      limit: _this.data.limit,
      page: _this.data.page
    }
    wx.showLoading({
      title: '加载中',
    })
    console.log('发送请求:', param)
    walletModel.getRechargeList(param, (res) => {
      console.log('收到响应(交易记录列表):', res)
      wx.hideLoading()
      if (res.code === 0) {
        let typeMap = {
          RECHARGE: '充值',
          CONSUMPTION: '消费',
          CANCEL_ORDER: '取消订单返还',
          PRESENT: '赠送',
          PRE_RECHARGE: '预充',
          ACTIVITY_PRESENT: '活动赠送',
          RECHARGE_PRESENT: '充值赠送'
        }
        let tmp_rechargeList = res.data
        tmp_rechargeList.forEach(element => {
          element.recordTypeDes = typeMap[element.recordType]
          if (element.recordType == 'CONSUMPTION') {
            element.balance = '' + (parseFloat(element.newBalance) - parseFloat(element.oldBalance)).toFixed(2)
            //element.balance = ''+(100*element.newBalance - 100*element.oldBalance)/100
          } else {
            element.balance = '+' + (parseFloat(element.newBalance) - parseFloat(element.oldBalance)).toFixed(2)
            //element.balance = '+'+(100*element.newBalance - 100*element.oldBalance)/100
          }
          element.recordTypeDes = typeMap[element.recordType]
          element.operateTimeDes = moment(element.operateTime).format('YYYY-MM-DD HH:mm:ss')
        })
        console.log(this.data.tmp_rechargeList)
        //下面开始分页
        if (tmp_rechargeList.length < _this.data.limit) {
          if (tmp_rechargeList.length === 0) {
            wx.showToast({
              icon: "none",
              title: '没有更多数据'
            })
            _this.setData({
              hasMoreDataFlag: false
            })
          } else {
            _this.setData({
              rechargeList: _this.data.rechargeList.concat(tmp_rechargeList), //concat是拆开数组参数，一个元素一个元素地加进去
              hasMoreDataFlag: false
            })
          }
        } else {
          _this.setData({
            rechargeList: _this.data.rechargeList.concat(tmp_rechargeList), //concat是拆开数组参数，一个元素一个元素地加进去
            hasMoreDataFlag: true,
            page: _this.data.page + 1
          })
        }
      } else {
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
      }
      _this.data.listCanGet = true
    })
  },
  /* click更改选中的金额 */
  changeMoneyActiveFlag: function (e) {
    this.setData({
      activeFlag1: e.currentTarget.dataset.activeflag1
    })
    this.setData({
      activeFlag2: e.currentTarget.dataset.activeflag2
    })
    this.setData({
      selectedMoney: e.currentTarget.dataset.selectedmoney
    })
  },
  /* 立即充值 */
  handleRecharge: function () {
    let _this = this
    console.log(this.data.selectedMoney)
    if (_this.data.selectedMoney == 0) {
      wx.showToast({
        title: "请选择充值金额",
        icon: "none",
        duration: 2000
      })
    } else {
      if (!_this.data.canClick) {
        return
      }
      _this.data.canClick = false
      let param = {
        userCode: wx.getStorageSync('userInfo').userCode,
        rechargeMoney: _this.data.selectedMoney
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      walletModel.RechargeBalance(param, (res) => {
        console.log('收到请求(充值):', res)
        if (res.code === 0) {
          let data = res.data
          if (data.timeStamp) {
            wx.requestPayment({
              'timeStamp': data.timeStamp.toString(),
              'nonceStr': data.nonceStr,
              'package': data.packageValue,
              'signType': data.signType,
              'paySign': data.paySign,
              success: function (e) {
                wx.switchTab({
                  url: '/pages/mine/wallet/wallet',
                })
                wx.showToast({
                  title: '充值成功',
                  icon: 'success',
                  duration: 2000
                })
              },
              fail: function (e) {
                wx.showToast({
                  title: '已取消充值',
                  icon: 'success',
                  duration: 4000
                })
              },
              complete: function () {
                wx.hideLoading()
              }
            })
          }
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })
        }
      })
      setTimeout(function () {
        _this.data.canClick = true
      }, 300)
    }
  },
})