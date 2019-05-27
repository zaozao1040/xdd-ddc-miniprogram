 const baseUrl = getApp().globalData.baseUrl

 import { base } from '../../comm/public/request'
 let requestModel = new base()

 Page({
     data: {
         //
         timer: null,
         canClick: true,
         listCanGet: true,
         //分页
         page: 1, // 设置加载的第几次，默认是第一次
         limit: 5, // 每页条数
         hasMoreDataFlag: true, //是否还有更多数据  默认还有
         //
         showPayTypeFlag: false,

         payType: 'BALANCE_PAY',
         //评价
         showRatingsFlag: false,
         orderFoodList: null,
         foodCode: '',
         tempFilePaths: [],
         imagesArr: [], //评价上传图片时 存储参数
         evaluateLabels: [],
         evaluateLabelsActive: [],
         labels: [],
         content: [], //绑定多道菜的每个文字评价内容
         //
         windowHeight: 0,
         scrollTop: 0,
         //
         itemStatusActiveFlag: 0, //0：全部订单，1：今日待取，2：待评价
         orderList: [],
         orderListNoResult: false,
         mealTypeMap: {
             BREAKFAST: '早餐',
             LUNCH: '午餐',
             DINNER: '晚餐',
             NIGHT: '夜宵'
         },
         getOrdersNow: false
     },
     /* 跳转订单详情 */
     handleGotoOrderDetail: function(e) {

         wx.navigateTo({
             url: '/pages/order/detail?orderCode=' + e.currentTarget.dataset.ordercode,
         })

     },

     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function(options) {
         if (options.content) {
             let content = options.content
             wx.showModal({
                 title: '提示',
                 content: content,
                 showCancel: false
             })
         } else {

             this.setData({
                 itemStatusActiveFlag: 0
             })
         }
         this.initOrder()
         this.data.page = 1
         this.setData({
             orderList: [] //列表必须清空，否则分页会无限叠加
         })
         this.getOrderList()
         wx.showTabBar()
     },

     /* 手动点击触发下一页 */
     gotoNextPage: function() {
         if (this.data.hasMoreDataFlag) {
             this.getOrderList()
             wx.showLoading({
                 title: '加载更多数据',
             })
         } else {
             wx.showToast({
                 image: '/images/msg/warning.png',
                 title: '没有更多数据'
             })
         }
     },
     /**
      * 生命周期函数--监听页面显示
      */
     onShow: function() {},
     onHide: function() {},
     //点击这个订单的tab标签，即触发这个钩子
     onTabItemTap(item) {
         this.setData({
             showRatingsFlag: false,
         })
     },
     changeItemStatusActiveFlag: function(e) {
         if (this.data.getOrdersNow) {
             return
         }
         this.setData({
             getOrdersNow: true
         })

         if (e.currentTarget.dataset.flag == 'jinridaiqu') {
             this.setData({
                 itemStatusActiveFlag: 1
             })
         } else if (e.currentTarget.dataset.flag == 'quanbudingdan') {
             this.setData({
                 itemStatusActiveFlag: 0
             })
         } else if (e.currentTarget.dataset.flag == 'pingjia') {
             this.setData({
                 itemStatusActiveFlag: 2
             })
         }

         this.setData({
             orderList: [], // 这四个要重置，为了交易记录的分页，因为交易记录:'在线重置俩页面是通过点击按钮切换的
             page: 1,
             hasMoreDataFlag: true
         })
         this.getOrderList()
     },
     initOrder: function() {
         let _this = this
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
         query.exec(function(res) {
             _this.setData({
                 scrollTop: res[0].top // #the-id节点的上边界坐标
             })
         })

     },
     //获取订单状态
     getOrderStatus(element) {
         let a = { has: true }
         if (element.status == 1) {
             if (element.isPay == 0) {
                 a.label = '未支付'
                 a.has = false

             } else {
                 a.label = '已支付'
                 a.image = 'yizhifu'
             }
         } else if (element.status == 2) {
             if (element.confirmStatus == 2) {
                 if (element.evaluateStatus == 1) {
                     a.label = '待评价'
                     a.image = 'daipingjia'
                 } else if (element.pickStatus == 1) {
                     a.label = '待取餐'
                     a.image = 'daiqucan'

                 } else if (element.deliveryStatus == 1) {
                     a.label = '待配送'
                     a.image = 'daipeisong'
                 } else if (element.deliveryStatus == 2) {
                     a.label = '配送中'
                     a.image = 'peisongzhong'

                 } else {
                     a.label = '制作中'
                     a.image = 'zhizuozhong'
                 }
             } else {
                 a.label = '已支付'
                 a.image = 'yizhifu'
             }

         } else if (element.status == 3) {
             a.label = '已完成'
             a.image = 'yiwancheng'
         } else {
             a.label = '已取消'
             a.image = 'yiquxiao'
         }
         return a
     },


     /* 获取订单列表 */
     getOrderList: function() {
         let _this = this

         let page = _this.data.page
         let limit = _this.data.limit
         let param = {
             url: '/order/getOrderList?userCode=' + wx.getStorageSync('userCode') + '&page=' + page + '&limit=' + limit + '&type=' + _this.data.itemStatusActiveFlag
         }
         requestModel.request(param, (res) => {
             let tmp_orderList = res.list
             if (tmp_orderList) {
                 tmp_orderList.forEach(element => {
                     element.mealTypeDes = _this.data.mealTypeMap[element.mealType] //类型
                     element.orderStatusDes = _this.getOrderStatus(element) //订单状态  

                     //取餐时间
                     if (element.pickStatus == 1 && element.status == 2 && element.orderFoodList && element.orderFoodList[0].takeMealStartTime) { //待取餐

                         // 取餐时间
                         let start = (element.orderFoodList[0].takeMealStartTime.split(' '))[1].split(':') //时 分 秒

                         let end = (element.orderFoodList[0].takeMealEndTime.split(' '))[1].split(':')

                         //取餐时间顶多是到明天吗？不管了，就是明天
                         let s = '今天' + start[0] + '点' + (start[1] != '00' ? (start[1] + '分') : '')
                         let endHours = end[0] == '00' ? 24 : end[0]
                         let e = endHours < start[0] ? ('明天' + endHours + '点') : (endHours + '点') + (end[1] != '00' ? (end[1] + '分') : '')
                         element.takeMealTimeDes = s + '到' + e

                     } else {
                         let a = element.mealDate.split('-')

                         element.takeMealTimeDes = a[1] + '月' + a[2] + '日'
                     }


                 })
                 if (page == 1) {
                     _this.setData({
                         orderList: tmp_orderList

                     })
                 } else {
                     _this.setData({
                         orderList: _this.data.orderList.concat(tmp_orderList)

                     })
                 }
                 //下面开始分页
                 if (page * limit >= res.amount) {
                     _this.setData({
                         hasMoreDataFlag: false
                     })

                 } else {
                     _this.setData({
                         hasMoreDataFlag: true,
                         page: page + 1
                     })
                 }
             }
             _this.setData({
                 getOrdersNow: false
             })
         })
     },
     /* 取消订单 */
     handleCancelOrder(e) {
         this.setData({
             cancelOrderCode: e.currentTarget.dataset.ordercode,
             cancelFlag: true
         })
     },
     /* 取消取消订单 */
     handleCancelOrderWait() {
         this.setData({
             cancelOrderCode: '',
             cancelFlag: false
         })
     },
     /* 确认取消订单 */
     handleCancelOrderConfirm() {
         if (this.data.cancelOrderCode) { // 防止出错
             this.setData({
                 cancelFlag: false
             })
             let _this = this
             let param = {
                 userCode: wx.getStorageSync('userCode'),
                 orderCode: _this.data.cancelOrderCode
             }
             let params = {
                 data: param,
                 url: '/order/cancelOrder',
                 method: 'post'
             }
             requestModel.request(params, () => {

                 wx.showToast({
                     title: '成功取消订单',
                     duration: 1000
                 })
                 setTimeout(() => {
                     //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
                     _this.setData({
                         page: 1,
                         orderList: []
                     })
                     _this.getOrderList()
                 }, 1000)

             })

         }
     },

     /* radio选择支付方式 */
     radioChange() {
         this.setData({
             payType: this.data.payType == "WECHAT_PAY" ? "BALANCE_PAY" : 'WECHAT_PAY'
         })
     },
     /* 去付款的对话框的确定 */
     buttonClickYes: function() {

         if (this.data.payType == 'WECHAT_PAY') {
             this.payNowByWx()
         } else {
             this.payNowByBalance()
         }

         this.setData({
             showPayTypeFlag: false
         })
     },
     /* 去付款的对话框的取消 */
     buttonClickNo: function() {

         this.setData({
             showPayTypeFlag: false
         })
     },
     /* 去付款 */
     handleSecondpayOrder: function(e) {
         let _this = this;

         let payPrice = e.currentTarget.dataset.payprice
         let orderCode = e.currentTarget.dataset.ordercode
             // 判断余额够不够
         let param = {
             url: '/user/getUserFinance?userCode=' + wx.getStorageSync('userCode')
         }
         requestModel.request(param, data => {

             _this.setData({
                 showPayTypeFlag: true,
                 balanceEnough: data.balance < payPrice ? false : true,
                 payOrderCode: orderCode,
                 payType: data.balance < payPrice ? "WECHAT_PAY" : 'BALANCE_PAY'

             })
         })
     },
     /* 去付款-微信支付 */
     payNowByWx: function() {
         let _this = this
         if (!_this.data.canClick) {
             return
         }
         _this.data.canClick = false
         if (_this.data.timer) {
             clearTimeout(_this.data.timer)
         }
         _this.data.timer = setTimeout(function() {
             _this.data.canClick = true
         }, 2000)


         let param = {
             userCode: wx.getStorageSync('userCode'),
             orderCode: _this.data.payOrderCode,
             payType: 'WECHAT_PAY'
         }

         let params = {
             data: param,
             url: '/order/orderPay',
             method: 'post'
         }
         requestModel.request(params, resdata => {
             let data = resdata.payData
                 // 如果需要支付。选择微信支付哪还有不要支付的5/18
             if (resdata.needPay) {
                 if (data.timeStamp) {
                     wx.requestPayment({
                         'timeStamp': data.timeStamp.toString(),
                         'nonceStr': data.nonceStr,
                         'package': data.packageValue,
                         'signType': data.signType,
                         'paySign': data.paySign,
                         success: function(e) {

                             wx.showToast({
                                 title: '成功支付订单',
                                 image: '/images/msg/success.png',
                                 duration: 1000
                             })
                             setTimeout(() => {
                                 //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
                                 _this.setData({
                                     page: 1,
                                     orderList: []
                                 })
                                 _this.getOrderList()
                             }, 1000)

                         },
                         fail: function(e) {
                             wx.showToast({
                                 title: '已取消支付',
                                 image: '/images/msg/success.png',
                                 duration: 1000
                             })
                         },
                         complete: function() {
                             wx.hideLoading()
                         }
                     })
                 }
             }
         })
     },
     /* 去付款-余额支付 */
     payNowByBalance: function() {
         let _this = this
         if (!_this.data.canClick) {
             return
         }
         _this.data.canClick = false
         if (_this.data.timer) {
             clearTimeout(_this.data.timer)
         }
         _this.data.timer = setTimeout(function() {
             _this.data.canClick = true
         }, 2000)

         let param = {
             userCode: wx.getStorageSync('userCode'),
             orderCode: _this.data.payOrderCode,
             payType: 'BALANCE_PAY'
         }

         let params = {
             data: param,
             url: '/order/orderPay',
             method: 'post'
         }
         requestModel.request(params, data => {

             wx.showToast({
                 title: '成功支付订单',
                 image: '/images/msg/success.png',
                 duration: 1000
             })

             setTimeout(() => {
                 //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
                 _this.setData({
                     page: 1,
                     orderList: []
                 })
                 _this.getOrderList()
             }, 1000)
         })

     },

     //取餐private函数
     takeFoodOrder(ordercode) {
         let _this = this
             //就调用接口加载柜子号 
         let param = {
             url: '/order/orderPickPre?userCode=' + wx.getStorageSync('userCode') + '&orderCode=' + ordercode
         }
         requestModel.request(param, (data) => {
             let tmp_content = ''
             if (data) {
                 let bindnumber = ''
                 if (data.length > 0) {
                     for (let i = 0; i < data.length - 1; i++) {
                         bindnumber += data[i].cabinetNumber + '-' + data[i].cellNumber + ', '
                     }
                     bindnumber += data[data.length - 1].cabinetNumber + '-' + data[data.length - 1].cellNumber

                     tmp_content = '当前柜子为：' + bindnumber + ',请确认本人在柜子旁边'
                 } else {
                     tmp_content = '请确认取餐'
                 }

                 let content = data.length > 0 ? '如果柜子' + bindnumber + '中餐品未取出，可点击确定再次取餐' : '如果餐品未取出，可点击确定再次取餐'

                 wx.showModal({
                     title: '是否取餐?',
                     content: tmp_content,
                     success(res) {
                         if (res.confirm) {
                             _this.takeFoodOrderAgain(ordercode, false, content)
                         } else if (res.cancel) {
                             wx.hideToast()
                                 //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18

                         }
                     }
                 })
             }
         })
     },
     //取餐private函数
     takeFoodOrderAgain(ordercode, again, content) {
         let _this = this

         let param = {
             url: '/order/orderPick?userCode=' + wx.getStorageSync('userCode') + '&orderCode=' + ordercode + '&again=' + again
         }
         requestModel.request(param, () => {
             wx.showModal({
                 title: '是否再次取餐?',
                 content: content,
                 success(res) {
                     if (res.confirm) {
                         _this.takeFoodOrderAgain(ordercode, true, content)
                     } else if (res.cancel) {
                         wx.hideToast()
                             //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
                         _this.setData({
                             page: 1,
                             orderList: []
                         })
                         _this.getOrderList()
                     }
                 }

             })
         })
     },
     /* 去取餐 */
     handleTakeOrder: function(e) {
         //console.log(e)
         let _this = this
         if (!_this.data.canClick) {
             return
         }
         _this.data.canClick = false
             //  let tmp_content = '请确定在柜子前'

         //  wx.showModal({
         //      title: '是否取餐?',
         //      content: tmp_content,
         //      success(res) {
         //          if (res.confirm) {

         //              let param = {
         //                  url: '/order/orderPick?userCode=' + wx.getStorageSync('userCode') + '&orderCode=' + e.currentTarget.dataset.ordercode
         //              }
         //              requestModel.request(param, () => {

         //                  wx.showToast({
         //                      title: '成功取餐',
         //                      image: '/images/msg/success.png',
         //                      duration: 1000
         //                  })
         //                  setTimeout(() => {
         //                      //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
         //                      _this.setData({
         //                          page: 1,
         //                          orderList: []
         //                      })
         //                      _this.getOrderList()
         //                  }, 1000)
         //              })
         //          }
         //      }
         //  })
         _this.takeFoodOrder(e.currentTarget.dataset.ordercode)
         if (_this.data.timer) {
             clearTimeout(_this.data.timer)
         }
         _this.data.timer = setTimeout(function() {
             _this.data.canClick = true
         }, 2000)
     },

     /* 去评价 */
     handleEvaluateOrder: function(e) {
         let a = {}
         a.orderCode = e.currentTarget.dataset.ordercode
         a.orderFoodList = e.currentTarget.dataset.orderfoodlist
         wx.setStorageSync('commentOrder', a)
         wx.navigateTo({
             url: './comment/comment'
         })
     },


     //用于解决小程序的遮罩层滚动穿透
     preventTouchMove: function() {

     }

 })