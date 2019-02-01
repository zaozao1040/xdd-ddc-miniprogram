
import { integral } from './integral-model.js'
let integralModel = new integral()
import moment from "../../../comm/script/moment"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    canClick: true,
    listCanGet: true,
    userInfo: null,
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 20, // 每页条数
    hasMoreDataFlag: true,//是否还有更多数据  默认还有
    //
    windowHeight: 0,
    scrollTop: 0,
    //
    itemStatusActiveFlag: true,
    pointsList: [
      [100, 200],
      [500, 800]],
    activeFlag1: undefined,
    activeFlag2: undefined,
    selectedPoint: 0,
    explainDes: {
      one: '100积分兑换1点餐币,兑换成功后点餐币将存入您的余额',
      two: '积分暂不支持跨平台使用，暂不支持转赠他人'
    },
    explainRulesDes: {
      one: '订单中的自费金额赠送积分,满1元消费赠送1积分',
      two: '订单评价赠送积分,星级送1分,文字赠送5分,上传图片送15分'
    },
    //
    integralList: [],
    integralListNoResult: false,
  },

  initIntegral: function () {
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
    _this.initIntegral()
    this.setData({
      page: 1,
      limit: 20,
      integralList: [] //列表必须清空，否则分页会无限叠加
    })
  },


  /* 手动点击触发下一页 */
  gotoNextPage: function () {
    if (this.data.hasMoreDataFlag) {
      this.getIntegralList()
      wx.showLoading({
        title: '点击加载更多',
      })
    } else {
      wx.showToast({
        image: '../../../images/msg/warning.png',
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
    if (e.currentTarget.dataset.flag == 'duihuan') {
      _this.setData({
        itemStatusActiveFlag: true
      })
    } else if (e.currentTarget.dataset.flag == 'jilu') {
      _this.setData({
        itemStatusActiveFlag: false,
        integralList: [], // 这四个要重置，为了交易记录的分页，因为交易记录、在线重置俩页面是通过点击按钮切换的
        page: 1,
        limit: 20,
        hasMoreDataFlag: true,
      })
      _this.getIntegralList()
    } else { }
  },
  /* 获取交易记录列表 */
  getIntegralList: function () {
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
    integralModel.getIntegralList(param, (res) => {
      console.log('收到响应(积分记录列表):', res)
      wx.hideLoading()
      if (res.code === 0) {
        let typeMap = {
          ORDER: '下单送积分',
          CONSUMPTION: '消费',
          CANCEL_ORDER: '取消订单返还积分',
          EVALUATE: '评价送积分'
        }
        let tmp_integralList = res.data
        tmp_integralList.forEach(element => {
          element.recordTypeDes = typeMap[element.recordType]
          //element.integral = (parseFloat(element.newIntegral) - parseFloat(element.oldIntegral)).toFixed(2)  --积分不需要小数点后两位
          element.integral = element.newIntegral - element.oldIntegral
          if (element.integral > 0) {
            element.integral = '+' + element.integral
          }
          element.recordTypeDes = typeMap[element.recordType]
          element.operateTimeDes = moment(element.operateTime).format('YYYY-MM-DD HH:mm:ss')
        })
        console.log(this.data.tmp_integralList)
        //下面开始分页
        if (tmp_integralList.length < _this.data.limit) {
          if (tmp_integralList.length === 0) {
            wx.showToast({
              icon: "none",
              title: '没有更多数据'
            })
            _this.setData({
              hasMoreDataFlag: false
            })
          } else {
            _this.setData({
              integralList: _this.data.integralList.concat(tmp_integralList), //concat是拆开数组参数，一个元素一个元素地加进去
              hasMoreDataFlag: false
            })
          }
        } else {
          _this.setData({
            integralList: _this.data.integralList.concat(tmp_integralList), //concat是拆开数组参数，一个元素一个元素地加进去
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
  changePointActiveFlag: function (e) {
    console.log(e)
    this.setData({
      activeFlag1: e.currentTarget.dataset.activeflag1
    })
    this.setData({
      activeFlag2: e.currentTarget.dataset.activeflag2
    })
    this.setData({
      selectedPoint: e.currentTarget.dataset.selectedpoint
    })
  },
  /* 积分兑换 */
  handleExchange: function () {
    let _this = this
    console.log(this.data.selectedPoint)
    if (_this.data.selectedPoint == 0) {
      wx.showToast({
        title: "请选择兑换积分",
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
        integral: _this.data.selectedPoint
      }
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      integralModel.handleExchange(param, (res) => {
        console.log('收到请求(积分兑换):', res)
        if (res.code === 0) {
          wx.showToast({
            title: '积分兑换成功',
            icon: 'success',
            duration: 2000
          })
          setTimeout(function () {
            wx.switchTab({
              url: '/pages/mine/mine',
            })
            wx.hideLoading() //【防止狂点3】
          }, 2000)
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