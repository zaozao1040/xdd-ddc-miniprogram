// pages/order/order.js
import { order } from './order-model.js'
let orderModel = new order()
import moment from "../../comm/script/moment"
const baseUrl = getApp().globalData.baseUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    canClick: true,
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 20, // 每页条数
    hasMoreDataFlag: true,//是否还有更多数据  默认还有
    orderListNoResult: false,
    //
    showPayTypeFlag: false,
    e: null,
    payType: 'BALANCE_PAY',
    //评价
    showRatingsFlag: false,
    orderFoodList: null,
    starNum: [0, 1, 2, 3, 4],
    starActiveNum: 0,
    ratingsContent: '',
    currentUploadImgs:null,
    tempFilePaths:[],
    imagesArr:[],//评价上传图片时 存储参数
    foodCode:'',
    //
    windowHeight: 0,
    scrollTop: 0,
    //
    itemStatusActiveFlag: true, //默认今日待取
    orderList: [],
    orderListNoResult: false,
    //
    orderStatusMap: {
      NO_PAY: '未支付',
      PAYED_WAITINT_CONFIRM: '已支付',
      CONFIRM_WAITING_MAKE: '待制作',
      MAKING: '开始制作',
      MAKED_WAITING_DELIVERY: '待配送',
      DELIVERING: '配送中',
      DELIVERED_WAITING_PICK: '待取货',
      PICKED_WAITING_EVALUATE: '待评价',
      COMPLETED_EVALUATED: '已评价',
      NO_PICK_WAITING_BACK: '超时未取货待取回',
      USER_CANCEL: '已取消',
      SYSTEM_CANCEL: '系统自动取消'
    },
    mealTypeMap: {
      BREAKFAST: '早餐',
      LUNCH: '午餐',
      DINNER: '晚餐',
      NIGHT: '夜宵'
    },
    orderCode: ''
  },
  getOrderDataByResponse: function () {
    let that = this
    //获取后台数据
    let param = {
      userId: that.data.userId
    }
    orderModel.getOrderData(param, (res) => {
      let resData = res.data
      let tmp_data = resData
      that.setData({   //添加结束后，setData设置一下，模板就能同步刷新
        orderDataAll: tmp_data
      })
    })

  },
  handleChangeOrderStatusActive: function (e) {
    this.setData({
      orderStatusActiveFlag: e.currentTarget.dataset.orderstatusindex
    })
    this.getOrderDataByResponse()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /* 手动点击触发下一页 */
  gotoNextPage: function () {
    if (this.data.hasMoreDataFlag) {
      this.getOrderList()
      wx.showLoading({
        title: '加载更多数据',
      })
    } else {
      wx.showToast({
        icon: "none",
        title: '没有更多数据'
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    _this.initOrder()
    _this.getOrderList()
  },
  changeItemStatusActiveFlag: function (e) {
    if (e.currentTarget.dataset.flag == 'jinridaiqu') {
      this.setData({
        itemStatusActiveFlag: true
      })
    } else if (e.currentTarget.dataset.flag == 'quanbudingdan') {
      this.setData({
        itemStatusActiveFlag: false
      })
    } else {

    }
    this.setData({
      orderList: [], // 这四个要重置，为了交易记录的分页，因为交易记录、在线重置俩页面是通过点击按钮切换的
      page: 1,
      limit: 20,
      hasMoreDataFlag: true,
    })
    this.getOrderList()
  },
  initOrder: function () {
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
  /* 获取订单列表 */
  getOrderList: function () {
    let _this = this
    let todayFlag = true
    if (_this.data.itemStatusActiveFlag == true) {
      todayFlag = true
    } else {
      todayFlag = false
    }
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      today: todayFlag,
      page: _this.data.page,
      limit: _this.data.limit,
    }
    wx.showLoading({
      title: '加载中',
    })
    console.log('发送请求:', param)
    orderModel.getOrderList(param, (res) => {
      console.log('收到响应(订单列表):', res)
      wx.hideLoading()
      if (res.code === 0) {
        let tmp_orderList = res.data.list
        tmp_orderList.forEach(element => {
          element.mealTypeDes = _this.data.mealTypeMap[element.mealType]
          element.orderStatusDes = _this.data.orderStatusMap[element.orderStatus]
          element.orderTimeDes = moment(element.orderTime).format('YYYY-MM-DD HH:mm:ss')
        })
        //下面开始分页
        if (tmp_orderList.length < _this.data.limit) {
          if (tmp_orderList.length === 0) {
            wx.showToast({
              icon: "none",
              title: '没有更多数据'
            })
            _this.setData({
              hasMoreDataFlag: false
            })
          } else {
            _this.setData({
              orderList: tmp_orderList.concat(_this.data.orderList), //concat是拆开数组参数，一个元素一个元素地加进去
              hasMoreDataFlag: false
            })
          }
        } else {
          console.log(_this.data.orderList)
          _this.setData({
            orderList: tmp_orderList.concat(_this.data.orderList), //concat是拆开数组参数，一个元素一个元素地加进去
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
    })
  },
  /* 取消订单 */
  handleCancelOrder: function (e) {
    console.log(e)
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    setTimeout(function () {
      _this.data.canClick = true
    }, 2000)
    wx.showModal({
      title: '提示',
      content: '是否取消订单？',
      success(res) {
        if (res.confirm) {
          let param = {
            userCode: wx.getStorageSync('userInfo').userCode,
            orderCode: e.currentTarget.dataset.ordercode
          }
          wx.showLoading({ //【防止狂点2】
            title: '加载中',
            mask: true
          })
          orderModel.cancelOrder(param, (res) => {
            console.log('收到请求(取消订单):', res)
            if (res.code === 0) {
              wx.hideLoading()
              //刷新订单列表中该订单的状态值，使用setData响应式模板
              let tmp_orderList = _this.data.orderList
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatus = 'USER_CANCEL'
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatusDes = '已取消'
              _this.setData({
                orderList: tmp_orderList
              })
              wx.showToast({
                title: '成功取消订单',
                icon: 'success',
                duration: 2000
              })
            } else {
              wx.hideLoading()
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
  /* radio选择支付方式 */
  radioChange(e) {
    this.setData({
      payType: e.detail.value
    })
  },
  /* 去付款的对话框的确定 */
  buttonClickYes: function () {
    let _this = this;
    if (_this.data.payType == 'WECHAT_PAY') {
      _this.payNowByWx(_this.data.e)
    } else {
      _this.payNowByBalance(_this.data.e)
    }

    _this.setData({
      showPayTypeFlag: !_this.data.showPayTypeFlag
    })
  },
  /* 去付款的对话框的取消 */
  buttonClickNo: function () {
    let _this = this;
    _this.setData({
      showPayTypeFlag: !_this.data.showPayTypeFlag
    })
  },
  /* 去付款 */
  handleSecondpayOrder: function (e) {
    let _this = this;
    _this.data.e = e
    _this.setData({
      showPayTypeFlag: !_this.data.showPayTypeFlag
    })
  },
  /* 去付款-微信支付 */
  payNowByWx: function (e) {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    setTimeout(function () {
      _this.data.canClick = true
    }, 2000)
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      orderCode: e.currentTarget.dataset.ordercode,
      payType: 'WECHAT_PAY'
    }
    orderModel.secondpayOrder(param, (res) => {
      console.log('收到响应(再次付款-微信):', res)
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
              //刷新订单列表中该订单的状态值，使用setData响应式模板
              let tmp_orderList = _this.data.orderList
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatus = 'PAYED_WAITINT_CONFIRM'
              tmp_orderList[e.currentTarget.dataset.orderindex].orderStatusDes = '已支付'
              _this.setData({
                orderList: tmp_orderList
              })
              wx.showToast({
                title: '成功支付订单',
                icon: 'success',
                duration: 2000
              })
            },
            fail: function (e) {
              wx.showToast({
                title: '已取消支付',
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
  },
  /* 去付款-余额支付 */
  payNowByBalance: function (e) {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    setTimeout(function () {
      _this.data.canClick = true
    }, 2000)
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
      orderCode: e.currentTarget.dataset.ordercode,
      payType: 'BALANCE_PAY'
    }
    orderModel.secondpayOrder(param, (res) => {
      console.log('收到响应(再次付款-余额):', res)
      if (res.code === 0) {
        //刷新订单列表中该订单的状态值，使用setData响应式模板
        let tmp_orderList = _this.data.orderList
        tmp_orderList[e.currentTarget.dataset.orderindex].orderStatus = 'PAYED_WAITINT_CONFIRM'
        tmp_orderList[e.currentTarget.dataset.orderindex].orderStatusDes = '已支付'
        _this.setData({
          orderList: tmp_orderList
        })
        wx.showToast({
          title: '成功支付订单',
          icon: 'success',
          duration: 2000
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
  /* 去取餐 */
  handleTakeOrder: function (e) {
    console.log(e)
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    wx.showModal({
      title: '提示',
      content: '是否取餐？',
      success(res) {
        if (res.confirm) {
          let param = {
            userCode: wx.getStorageSync('userInfo').userCode,
            orderCode: e.currentTarget.dataset.ordercode
          }
          wx.showLoading({ //【防止狂点2】
            title: '加载中',
            mask: true
          })
          orderModel.takeOrder(param, (res) => {
            console.log('收到请求(取餐):', res)
            if (res.code === 0) {
              wx.hideLoading()
              wx.showToast({
                title: '成功取餐',
                icon: 'success',
                duration: 2000
              })
            } else {
              wx.hideLoading()
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
    setTimeout(function () {
      _this.data.canClick = true
    }, 2000)
  },
  /* 去评价 */
  handleEvaluateOrder: function (e) {
    let _this = this
    _this.setData({
      showRatingsFlag: true,
      orderCode: e.currentTarget.dataset.ordercode,
      foodCode:e.currentTarget.dataset.foodcode,
      orderFoodList: [e.currentTarget.dataset.orderfoodlist[0]] //---------暂时只做成评价一个菜品，取数组第一个
    })
  },

  /* 去评价的对话框的确定 */
  buttonClickYes_ratings: function (e) {
    let _this = this;
    console.log(_this.data.ratingsContent, _this.data.starActiveNum,_this.data.imagesArr)
    let param = {
      order:{
        orderCode: _this.data.orderCode,
        star:0,
        images:[],
        wechatFormId:''        
      },
      foods:[{
        foodCode: _this.data.foodCode,
        star:_this.data.starActiveNum,
        content:_this.data.ratingsContent,
        wechatFormId:e.detail.formId,
        images:_this.data.imagesArr
      }]
    } 
    console.log('评价请求的参数：',param)
    wx.showLoading({ //【防止狂点2】
      title: '加载中',
      mask: true
    }) 
    orderModel.evaluateOrder(param, (res) => {
      console.log('收到请求(评价):', res)
      if (res.code === 0) {
        wx.hideLoading()
        wx.redirectTo({
          url: '/pages/order/order'
        })
        wx.showToast({
          title: '成功评价',
          icon: 'success',
          duration: 2000
        })
      } else {
        wx.hideLoading()
        wx.showToast({
          title: res.msg,
          icon: 'none',
          duration: 2000
        })
      }
    }) 

  },
  /* 去评价的对话框的取消 */
  buttonClickNo_ratings: function () {
    let _this = this;
    _this.setData({
      showRatingsFlag: !_this.data.showRatingsFlag
    })
  },

  ratingsInput: function (e) {
    this.setData({
      ratingsContent: e.detail.value
    })
  },

  handleClickStar: function (e) {
    let _this = this
    _this.setData({
      starActiveNum: e.currentTarget.dataset.num
    })
  },
  /* 点击预览图片 */
  handlePreviewImage:function (e) {
    let _this = this
    let index = e.currentTarget.dataset.index;//预览图片的编号
    wx.previewImage({
      current: _this.data.tempFilePaths[index],//预览图片链接
      urls: _this.data.tempFilePaths,//图片预览list列表
      success: function (res) {
        console.log(res);
      },
      fail: function () {
        console.log('fail')
      }
    })
  },
  /* 点击上传图片 */
  handleClickAddImg: function () {
    let _this = this
    wx.chooseImage({
      count: 1, //最多可以选择的图片数，默认为9
      sizeType: ['orignal', 'compressed'], //original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], //album 从相册选图，camera 使用相机，默认二者都有
      success: function (res_0) {
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 1000
        }) 
        wx.uploadFile({
          url: baseUrl+'/file/uploadFile',//开发者服务器 url
          filePath: res_0.tempFilePaths[0],//要上传文件资源的路径
          name: 'file', //文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
          formData:{ //HTTP 请求中其他额外的 form data
            userCode: wx.getStorageSync('userInfo').userCode,
            type: 'EVALUATE'
          },
          success: function(res){
            let tmp_data = JSON.parse(res.data)
            console.log('rrrr',tmp_data)
            if(tmp_data.code == 0 ){
              // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
              let tmp_tempFilePaths = _this.data.tempFilePaths
              tmp_tempFilePaths.push(res_0.tempFilePaths[0])
              _this.setData({
                tempFilePaths: tmp_tempFilePaths //预览图片响应式
              })
              _this.data.imagesArr.push(tmp_data.data)
            }else{
              wx.showToast({
                title: tmp_data.msg,
                icon: 'none',
                duration: 2000
              }) 
            }
          }
        })
      }, 
      fail: function () { }, //接口调用失败的回调函数
      complete: function () { } //接口调用结束的回调函数（调用成功、失败都会执行）
    })
  }

})