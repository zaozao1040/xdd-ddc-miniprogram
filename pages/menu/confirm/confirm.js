import { confirm } from './confirm-model.js'
import { wallet } from '../../mine/wallet/wallet-model.js'
import { mine } from '../../mine/mine-model.js'
import { discount } from '../../mine/discount/discount-model.js'
let discountModel = new discount()
let mineModel = new mine()
let confirmModel = new confirm()
let walletModel = new wallet()
import moment from "../../../comm/script/moment"

Page({

  /**
   * 页面的初始数据
   */
  data: {
    payType: 'BALANCE_PAY',//'WECHAT_PAY' 支付方式,余额大于付款额则默认余额支付   小于的话则默认微信支付

    //
    windowHeight: 0,
    scrollTop: 0,
    buttonTop: 0,

    loading: false,
    canClick: true,
    //这四个记录缓存的值
    address: '',
    name: '',
    bindOrganized: '',
    phoneNumber: '',

    selectedFoods: [],
    totalMoney: 0,
    totalMoneyRealDeduction: 0, //额度总金额
    realMoney: 0,//实际总价格，也就是自费价格
    realMoney_save: 0,//实际总价格，也就是自费价格(从menu传过来的，不含减去优惠券的价格--保存下来用于选择不同优惠券)

    showSelectDiscountFlag: false, //展示选择优惠券的页面，默认不展示
    canusedDiscountList: null,//可用的优惠券列表
    adviceDiscountObj: null, //推荐的优惠券
    useDiscountFlag: true,//使用优惠券的标志,默认使用
    discountTypeMap: {
      DISCOUNT: '折扣券',
      REDUCTION: '满减券'
    },

    mapMenutype: ['早餐', '午餐', '晚餐', '夜宵'],
    mapMenutypeIconName: ['zaocan1', 'wucan', 'canting', 'xiaoye-'],

    balance: 0,
    walletSelectedFlag: true,//勾选是否使用余额  默认勾选    true开启    false关闭
    finalMoney: 0,

    showSelectFlag: false, //展示填写姓名和配送地址的弹出框，默认不展示
  },

  initAddress: function () {
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initAddress()
    let _this = this
    _this.setData({
      selectedFoods: getApp().globalData.selectedFoods,
      totalMoney: options.totalMoney,
      totalMoneyRealDeduction: options.totalMoneyRealDeduction,
      realMoney: options.realMoney,
      realMoney_save: options.realMoney
    })
    console.log('selectedFoods', this.data.selectedFoods)
    console.log('options', options)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    _this.setData({
      address: wx.getStorageSync('userInfo').address,
      //name: _this.data.name.length<=0 ? wx.getStorageSync('userInfo').name : _this.data.name,
      name: wx.getStorageSync('userInfo').name ? wx.getStorageSync('userInfo').name : wx.getStorageSync('tmp_storage'),
      phoneNumber: wx.getStorageSync('userInfo').phoneNumber,
      bindOrganized: wx.getStorageSync('userInfo').bindOrganized
    })
    console.log(!_this.data.name || !_this.data.address,
      (_this.data.name == null) || (_this.data.address == null),
      _this.data.name,
      _this.data.address)
    if ((_this.data.name == null) || (_this.data.address == null)) {
      _this.setData({
        showSelectFlag: true
      })
    }
    let tmp_address = wx.getStorageSync('userInfo').address
    _this.setData({
      address: tmp_address
    })
    //从后端获取钱包余额
    _this.getWallet()
    //从后端获取优惠券信息
    _this.getDiscount()
  },
  /* 从后端获取钱包余额 */
  getWallet: function () {
    let _this = this
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
    }
    walletModel.getWalletData(param, function (res) {
      console.log('收到请求(钱包信息):', res)
      if (res.code === 0) {
        let tmp_userInfo = wx.getStorageSync('userInfo')
        tmp_userInfo.balance = _this.data.balance
        wx.setStorageSync('userInfo', tmp_userInfo)
        _this.setData({
          balance: res.data
        })
        if (res.data < _this.data.realMoney) { //余额小于实际付款，则改为微信付款
          _this.setData({
            walletSelectedFlag: false,
            payType: 'WECHAT_PAY'
          })
        }
      }
    })
  },
  /* 用户点击不使用优惠券 */
  handleNotUseDiscount: function () {
    this.setData({
      useDiscountFlag: !this.data.useDiscountFlag,
      showSelectDiscountFlag: !this.data.showSelectDiscountFlag,
      adviceDiscountObj:{
        discountPrice:0,
        discountStandardPrice:0
      },
      realMoney:this.data.realMoney_save 
    })
  },
  /* 改变现实优惠券选择页的展示状态 */
  handleChangeSelectDiscountFlag: function () {
    this.setData({
      showSelectDiscountFlag: !this.data.showSelectDiscountFlag
    })
  },
  /* 监听子组件：改变现实优惠券选择页的展示状态 */
  onChangeSelectDiscountFlag: function (e) {
    let _this = this
    console.log('选中的优惠券信息:', e.detail)
    this.setData({
      showSelectDiscountFlag: !this.data.showSelectDiscountFlag,
      useDiscountFlag:true,
      adviceDiscountObj: e.detail,
      realMoney:parseFloat((parseFloat(_this.data.realMoney_save) - parseFloat(e.detail.discountPrice)).toFixed(2)) 
    })
  },
  /* 从后端获取优惠券信息 */
  getDiscount: function () {
    let _this = this
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      useType: 0,  //0表示未使用
      discountType: '',  //DISCOUNT 折扣，REDUCTION 满减
      limit: 20,
      page: 1
    }
    discountModel.getDiscountList(param, function (res) {
      console.log('收到响应(优惠券列表):', res)
      if (res.code === 0) {
        if (res.data.discounts.length > 0) {
          let tmp_canusedDiscountList = []
          res.data.discounts.forEach(element => {
            if (_this.data.realMoney >= element.discountStandardPrice) {
              element.discountTypeDes = _this.data.discountTypeMap[element.discountType]
              element.endTimeDes = element.endTime ? moment(element.endTime).format('YYYY/MM/DD HH:mm') : element.endTime
              element.startTimeDes = element.startTime ? moment(element.startTime).format('YYYY/MM/DD HH:mm') : element.startTime
              tmp_canusedDiscountList.push(element)
            }
          })
          if (tmp_canusedDiscountList.length > 0) {
            _this.setData({
              canusedDiscountList: tmp_canusedDiscountList,
              adviceDiscountObj: tmp_canusedDiscountList[0], //推荐的就取第一个
              realMoney:parseFloat((parseFloat(_this.data.realMoney_save) - parseFloat(tmp_canusedDiscountList[0].discountPrice)).toFixed(2))
            })
          }
/*           console.log('金额信息',_this.data.canusedDiscountList, _this.data.adviceDiscountObj,
            _this.data.realMoney_save,tmp_canusedDiscountList[0].discountStandardPrice,
            parseFloat((parseFloat(_this.data.realMoney_save) - parseFloat(tmp_canusedDiscountList[0].discountStandardPrice)).toFixed(2)))
             */
        }
      }
    })
  },
  /* 清空缓存 */
  clearCache: function () {
    let _this = this
    getApp().globalData.cacheMenuDataAll = [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]]
    getApp().globalData.selectedFoods = []
    getApp().globalData.totalCount = 0
    getApp().globalData.totalMoney = 0
    _this.setData({
      cacheMenuDataAll: [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]],
      selectedFoods: [],
      totalCount: 0,
      totalMoney: 0,
      totalMoneyRealDeduction: 0,
      realMoney: 0
    })
  },
  /* 企业用户点击弹窗中的姓名 不允许修改 */
  handleClickName: function () {
    wx.showToast({
      title: '不可修改',
      image: '../../../images/msg/error.png',
      duration: 2000
    })
  },
  nameInput: function (e) {
    wx.setStorageSync('tmp_storage', e.detail.value)
    this.setData({
      name: e.detail.value
    })
  },
  addressInput: function (e) {
    this.setData({
      address: e.detail.value
    });
  },
  /* 展示弹窗(选择姓名和取餐低脂) */
  handleChangeSelectFlag: function () {
    this.setData({
      showSelectFlag: !this.data.showSelectFlag
    })
  },
  /* 校验参数(选择姓名和取餐低脂) */
  handleCheckParams: function () {
    if (!this.data.name) {
      wx.showToast({
        title: '请填写姓名',
        image: '../../../images/msg/error.png',
        duration: 2000
      })
    } else if (!this.data.address) {
      wx.showToast({
        title: '请选择送餐地址',
        image: '../../../images/msg/error.png',
        duration: 2000
      })
    } else {
      wx.showToast({
        title: '填写成功',
        image: '../../../images/msg/success.png',
        duration: 2000
      })
      this.setData({
        showSelectFlag: false
      })
    }
  },
  /**
   * 付款 提交菜单
   */
  handleCommitPay: function () {
    if (!this.data.name) {
      wx.showToast({
        title: '请填写姓名',
        image: '../../../images/msg/error.png',
        duration: 2000
      })
      return
    }
    if (!wx.getStorageSync('userInfo').addressCode) {
      wx.showToast({
        title: '请选择送餐地址',
        image: '../../../images/msg/error.png',
        duration: 2000
      })
      return
    }
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    wx.showLoading({
      title: '处理中',
      mask: true
    })
    /**** 拼接这个庞大的参数 ****/
    let tmp_param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      organizeCode: wx.getStorageSync('userInfo').organizeCode,
      deliveryAddressCode: wx.getStorageSync('userInfo').addressCode,
      totalAllPrice: _this.data.totalMoney,//总价格：所有
      standardAllPrice: _this.data.totalMoneyRealDeduction,//额度的总价格
      payAllPrice: _this.data.realMoney,//自费的总价格
      payType: _this.data.payType,//支付方式
      orderDetail: [],
      discountCode: _this.data.adviceDiscountObj.discountCode
    }
    getApp().globalData.selectedFoods.forEach(element1 => {
      let dayDes = element1.dayDes
      element1.dayInfo.forEach(element2 => {
        let foodTypeDes = element2.foodTypeDes
        let organizeMealLabel = element2.organizeMealLabel
        let mealLabelUsed = element2.mealLabelUsed
        let orderDetail_item = {
          mealDate: dayDes,
          mealType: foodTypeDes,
          mark: "",
          totalPrice: undefined,//先占位
          //standardPrice:organizeMealLabel,
          standardPrice: undefined,//先占位
          payPrice: undefined,//先占位
          orderFood: []
        }
        let tmp_totalPrice = 0
        element2.foodTypeInfo.forEach(element3 => {
          //tmp_totalPrice += element3.foodCount * element3.foodPrice
          tmp_totalPrice = (parseFloat(tmp_totalPrice) + element3.foodCount * parseFloat(element3.foodPrice)).toFixed(2)
          let orderFood_item = {
            foodCode: element3.foodCode,
            name: element3.foodName,
            quantity: element3.foodCount,
            price: element3.foodPrice,
            mark: ""
          }
          orderDetail_item.orderFood.push(orderFood_item)
        })
        orderDetail_item.totalPrice = tmp_totalPrice
        if (mealLabelUsed == true) {
          orderDetail_item.payPrice = tmp_totalPrice
          orderDetail_item.standardPrice = 0
        } else {
          //orderDetail_item.payPrice = tmp_totalPrice - organizeMealLabel
          //orderDetail_item.payPrice = (parseFloat(tmp_totalPrice) - parseFloat(organizeMealLabel)).toFixed(2)
          let tmp_payPrice = (parseFloat(tmp_totalPrice) - parseFloat(organizeMealLabel)).toFixed(2)
          if (tmp_payPrice < 0) { //需要处理这个额度大于实际付款的情况，虽然几乎不可能发生，但是还要容错
            tmp_payPrice = 0
          }
          orderDetail_item.payPrice = tmp_payPrice
          orderDetail_item.standardPrice = organizeMealLabel
        }
        tmp_param.orderDetail.push(orderDetail_item)
      })
    })
    console.log('提交菜单请求参数:', tmp_param)
    let param = tmp_param
    if (param.payAllPrice == '0.00' || param.payAllPrice == 0 || param.payAllPrice == '0') {
      param.payType = 'STANDARD_PAY'//支付方式改为标准支付
    }
    confirmModel.commitConfirmMenuData(param, function (res) {
      console.log('支付结果返回：', res)
      if (res.code === 0) {
        let data = res.data.payData
        if (param.payType == 'WECHAT_PAY') { //微信支付
          if (data.timeStamp) {
            wx.requestPayment({
              'timeStamp': data.timeStamp.toString(),
              'nonceStr': data.nonceStr,
              'package': data.packageValue,
              'signType': data.signType,
              'paySign': data.paySign,
              success: function (e) {
                wx.hideLoading()
                wx.showModal({
                  title: '提示',
                  content: '订单已生成',
                  showCancel: false,
                  confirmText: '查看订单',
                  success(res) {
                    if (res.confirm) {
                      //_this.clearCache() //清空缓存
                      wx.reLaunch({
                        url: '/pages/order/order',
                      })
                    }
                  }
                })
              },
              fail: function (e) {
                wx.hideLoading()
                wx.showModal({
                  title: '提示',
                  content: '订单已生成,请尽快支付',
                  showCancel: false,
                  confirmText: '查看订单',
                  success(res) {
                    if (res.confirm) {
                      //_this.clearCache() //清空缓存
                      wx.reLaunch({
                        url: '/pages/order/order',
                      })
                    }
                  }
                })
              },
              complete: function () {
                wx.hideLoading()
              }
            })
          }
        } else if (param.payType == 'BALANCE_PAY' || param.payType == 'STANDARD_PAY') {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '订单已生成',
            showCancel: false,
            confirmText: '查看订单',
            success(res) {
              if (res.confirm) {
                wx.reLaunch({
                  url: '/pages/order/order',
                })
              }
            }
          })
        } else {
          wx.hideLoading()
          //      其他支付方式，待开发
        }
        /* 不管什么方式只要支付成功(即res.code为0)，就要更新缓存中的userInfo */
        mineModel.getMineData(param, (res) => { //刷新用户信息
          if (res.code == 0) {
            wx.setStorageSync('userInfo', res.data)
            _this.setData({
              userInfo: res.data
            })
          }
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.msg,
          image: '../../../images/msg/error.png',
          duration: 2000
        })
      }
    })
    setTimeout(function () {
      _this.data.canClick = true
    }, 300)
  },

  /* 重新选择默认地址 */
  handleSelectAddress: function () {
    wx.navigateTo({
      url: '/pages/mine/address/address?frontPageFlag=confirm',
    })
  },
  /* 勾选余额付款的按钮 */
  handleChangeWalletSelectedFlag: function () {
    let _this = this
    if (_this.data.walletSelectedFlag) { //如果原来是开启余额支付，则本次点击会切换成关闭，同时切换成微信支付
      _this.setData({
        walletSelectedFlag: !_this.data.walletSelectedFlag,
        payType: 'WECHAT_PAY'
      })
    } else { //如果原来是关闭余额支付，则首先判断余额是否充足
      if (_this.data.balance < _this.data.realMoney) { //如果用户余额少于用户需要支付的价格，不允许用余额,也就是禁止打开switch
        wx.showToast({
          title: '余额不足,请充值',
          image: '../../../images/msg/error.png',
          duration: 2000
        })
        return
      } else {  //使用余额支付方式
        _this.setData({
          walletSelectedFlag: !_this.data.walletSelectedFlag,
          payType: 'WECHAT_PAY'
        })
      }
    }
  },

})


