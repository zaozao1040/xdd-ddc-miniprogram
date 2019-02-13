import { discount } from './discount-model.js'
let discountModel = new discount()
import moment from "../../../comm/script/moment"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //点击
    canClick: true,
    listCanGet: true,
    userInfo: null,
    //
    windowHeight: 0,
    scrollTop: 0,
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 20, // 每页条数
    hasMoreDataFlag: true,//是否还有更多数据  默认还有
    //标题
    itemStatusActiveFlag: 'weishiyong',
    //
    discountList: [],
    discountListNoResult: false,
    //查询参数
    param: {
      userCode: wx.getStorageSync('userInfo').userCode,
      useType: 0,  //0表示未使用(去除过期的)，1表示已使用，2表示过期 3全部
      discountType: '',  //DISCOUNT 折扣，REDUCTION 满减
      limit: 20,
      page: 1
    },
    discountTypeMap: {
      DISCOUNT: '折扣券',
      REDUCTION: '满减券'
    },

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
    _this.initDiscount()
    _this.getDiscountList()
    _this.setData({
      page: 1,
      limit: 20,
      discountList: [] //列表必须清空，否则分页会无限叠加
    })
  },

  initDiscount: function () {
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
  /* 手动点击触发下一页 */
  gotoNextPage: function () {
    if (this.data.hasMoreDataFlag) {
      this.getDiscountList()
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
    let tmp_useType = 99
    if (e.currentTarget.dataset.flag == 'weishiyong') {
      tmp_useType = 0
    } else if (e.currentTarget.dataset.flag == 'yishiyong') {
      tmp_useType = 1
    }else if (e.currentTarget.dataset.flag == 'yiguoqi') {
      tmp_useType = 2
    }
    _this.setData({
      itemStatusActiveFlag: e.currentTarget.dataset.flag,
      discountListNoResult: false,
      discountList: [], 
      param: {
        userCode: wx.getStorageSync('userInfo').userCode,
        useType: tmp_useType,  
        discountType: '',  //DISCOUNT 折扣，REDUCTION 满减
        limit: 20,
        page: 1
      },
    })
    _this.getDiscountList()
  },
  /* 获取优惠券列表 */
  getDiscountList: function () {
    let _this = this
    if (!_this.data.listCanGet) {
      return
    }
    _this.data.listCanGet = false
    let param = _this.data.param
    wx.showLoading({
      title: '加载中',
    })
    discountModel.getDiscountList(param, (res) => {
      console.log('收到响应(优惠券列表):', res)
      wx.hideLoading()
      if (res.code === 0) {
        let tmp_discountList = res.data.discounts
        if (tmp_discountList.length > 0) {
          tmp_discountList.forEach(element => {
            element.discountTypeDes = _this.data.discountTypeMap[element.discountType]
            element.endTimeDes = element.endTime ? moment(element.endTime).format('YYYY/MM/DD HH:mm') : element.endTime
            element.startTimeDes = element.startTime ? moment(element.startTime).format('YYYY/MM/DD HH:mm') : element.startTime
          })
          //下面开始分页
          if (tmp_discountList.length < _this.data.param.limit) {
            if (tmp_discountList.length === 0) {
              wx.showToast({
                image: '../../../images/msg/warning.png',
                title: '没有更多数据'
              })
              _this.setData({
                hasMoreDataFlag: false
              })
            } else {
              _this.setData({
                discountList: _this.data.discountList.concat(tmp_discountList), //concat是拆开数组参数，一个元素一个元素地加进去
                hasMoreDataFlag: false
              })
            }
          } else {
            let tmp_param = _this.data.param
            tmp_param.page = tmp_param.page + 1
            _this.setData({
              discountList: _this.data.discountList.concat(tmp_discountList), //concat是拆开数组参数，一个元素一个元素地加进去
              hasMoreDataFlag: true,
              param: tmp_param
            })
          }          
        }else{
          _this.setData({
            discountListNoResult: true
          })
        }
      } else {
        wx.showToast({
          title: res.msg,
          image: '../../../images/msg/error.png',
          duration: 2000
        })
      }
      _this.data.listCanGet = true
    })
  },
})