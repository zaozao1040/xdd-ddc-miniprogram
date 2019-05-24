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
         limit: 10, // 每页条数
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
                         let start = new Date(element.orderFoodList[0].takeMealStartTime)
                         let end = new Date(element.orderFoodList[0].takeMealEndTime)

                         //取餐时间顶多是到明天吗？不管了，就是明天
                         let s = '今天' + start.getHours() + '点' + (start.getMinutes() > 0 ? (start.getMinutes() + '分') : '')
                         let endHours = end.getHours() == 0 ? 24 : end.getHours()
                         let e = endHours < start.getHours() ? ('明天' + endHours + '点') : (endHours + '点') + (end.getMinutes() > 0 ? (end.getMinutes() + '分') : '')
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
     /* 去取餐 */
     handleTakeOrder: function(e) {
         //console.log(e)
         let _this = this
         if (!_this.data.canClick) {
             return
         }
         _this.data.canClick = false
         let tmp_content = '请确定在柜子前'
             // if (e.currentTarget.dataset.cabinet != null) {
             //     tmp_content = '当前柜号为：' + e.currentTarget.dataset.cabinet + ',请确认本人在柜子旁边'
             // }
         wx.showModal({
             title: '是否取餐?',
             content: tmp_content,
             success(res) {
                 if (res.confirm) {

                     let param = {
                         url: '/order/orderPick?userCode=' + wx.getStorageSync('userCode') + '&orderCode=' + e.currentTarget.dataset.ordercode
                     }
                     requestModel.request(param, () => {

                         wx.showToast({
                             title: '成功取餐',
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
                 }
             }
         })
         if (_this.data.timer) {
             clearTimeout(_this.data.timer)
         }
         _this.data.timer = setTimeout(function() {
             _this.data.canClick = true
         }, 2000)
     },
     /* 关闭评价标签 */
     handleClickClose: function() {
         this.setData({
             showRatingsFlag: !this.data.showRatingsFlag
         })
         wx.showTabBar()
     },
     /* 去评价 */
     handleEvaluateOrder: function(e) {
         let _this = this
         this.data.orderCode = e.currentTarget.dataset.ordercode
         let orderFoodList = e.currentTarget.dataset.orderfoodlist
         let orderFoodListLength = orderFoodList.length

         let a = {}
         a.orderCode = e.currentTarget.dataset.ordercode
         a.orderFoodList = orderFoodList
         wx.setStorageSync('commentOrder', a)
         wx.navigateTo({
             url: './comment/comment'
         })
     },

     /* 去评价的对话框的确定 */
     buttonClickYes_ratings: function(e) {
         let _this = this
         let tmpData = {
             userCode: wx.getStorageSync('userCode'),
             orderCode: _this.data.orderCode,
             wechatFormId: e.detail.formId,
             foodEvaluateList: []
         }
         let length = _this.data.orderFoodList.length
         console.log('555555', _this.data.orderFoodList)
         for (let i = 0; i < length; i++) {
             _this.data.labels[i] = []
             _this.data.orderFoodList[i].evaluateLabelsActive.forEach(element => {
                 if (element.active) {
                     _this.data.labels[i].push(element.tagCode)
                 }
             })
             let a = {}
             a.foodCode = _this.data.orderFoodList[i].foodCode
             a.star = _this.data.orderFoodList[i].star
             a.content = _this.data.content[i]
             a.images = _this.data.imagesArr[i]
             a.tagCodeList = _this.data.labels[i]
             tmpData.foodEvaluateList.push(a)
             a = {}
         }
         console.log('评价请求的参数：', tmpData)
         let param = {
             url: '/orderEvaluate/orderEvaluate',
             method: 'post',
             data: tmpData
         }
         requestModel.request(param, (res) => {
             wx.hideLoading()
             wx.reLaunch({
                 url: '/pages/order/order',
                 success: function(res) {
                     wx.showToast({
                         title: '成功评价',
                         image: '/images/msg/success.png',
                         duration: 2000
                     })
                 }
             })

         }, true)
     },

     /* 点击星星 */
     handleClickStar: function(e) {
         let _this = this
         let starWillBeNum = 0
         if (e.currentTarget.dataset.starflag === 'yes') { //黄星
             starWillBeNum = e.currentTarget.dataset.allstarindex
         }
         if (e.currentTarget.dataset.starflag === 'no') { //灰星
             starWillBeNum = e.currentTarget.dataset.yellowstar + e.currentTarget.dataset.allstarindex
         }
         /* 同时更新orderFoodList的star和orderFoodList属性 */
         let tmp_orderFoodList = _this.data.orderFoodList
         tmp_orderFoodList[e.currentTarget.dataset.foodindex].star = starWillBeNum
         tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive = _this.data.evaluateLabels[starWillBeNum - 1].tagList
         this.setData({
             orderFoodList: tmp_orderFoodList,
         })

     },
     contentInput: function(e) {
         this.data.content[e.currentTarget.dataset.foodindex] = e.detail.value
         this.setData({
             content: this.data.content,
         })
     },
     /* 点击标签 */
     handleClickLabel: function(e) {
         let _this = this
         let tmp_orderFoodList = _this.data.orderFoodList
         let tmp_activeStatus = tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active
         let labelLength = tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive.length
         const maxNumber = 3
         if (tmp_activeStatus === true) { //原来是true的话，正常修改为false
             tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active = !tmp_activeStatus
             _this.setData({
                 orderFoodList: tmp_orderFoodList,
             })
         } else { //原来是false的话，需要考虑做多n个标签的情况
             if (labelLength > maxNumber) { //只有当前的label列表数量大于n个时候才做判断
                 let selectedLength = 0
                 tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive.forEach(element => {
                     if (element.active === true) {
                         selectedLength++
                     }
                 })
                 if (selectedLength >= maxNumber) {
                     wx.showToast({
                         title: '最多选' + maxNumber + '个',
                         image: '/images/msg/warning.png',
                         duration: 1500
                     })
                 } else {
                     tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active = !tmp_activeStatus
                     _this.setData({
                         orderFoodList: tmp_orderFoodList,
                     })
                 }
             } else {
                 tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active = !tmp_activeStatus
                 _this.setData({
                     orderFoodList: tmp_orderFoodList,
                 })
             }
         }
         console.log('333333', _this.data.orderFoodList)
     },
     /* 点击预览图片 */
     handlePreviewImage: function(e) {
         let _this = this
         let foodIndex = e.currentTarget.dataset.foodindex;
         let index = e.currentTarget.dataset.index; //预览图片的编号
         wx.previewImage({
             current: _this.data.tempFilePaths[foodIndex][index], //预览图片链接
             urls: _this.data.tempFilePaths[foodIndex], //图片预览list列表
             success: function(res) {
                 console.log(res);
             },
             fail: function() {
                 console.log('fail')
             }
         })
     },
     /* 点击上传图片 */
     handleClickAddImg: function(e) {
         let _this = this
         wx.chooseImage({
             count: 1, //最多可以选择的图片数，默认为9
             sizeType: ['orignal', 'compressed'], //original 原图，compressed 压缩图，默认二者都有
             sourceType: ['album', 'camera'], //album 从相册选图，camera 使用相机，默认二者都有
             success: function(res_0) {
                 wx.showToast({
                     title: '正在上传...',
                     icon: 'loading',
                     mask: true,
                     duration: 1000
                 })
                 wx.uploadFile({
                     url: baseUrl + '/file/uploadFile', //开发者服务器 url
                     filePath: res_0.tempFilePaths[0], //要上传文件资源的路径
                     name: 'file', //文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
                     formData: { //HTTP 请求中其他额外的 form data
                         orderCode: _this.data.orderCode,
                         userCode: wx.getStorageSync('userCode'),
                         type: 'EVALUATE'
                     },
                     success: function(res) {
                         let tmp_data = JSON.parse(res.data)
                         if (tmp_data.code == 200) {
                             let tmp_tempFilePaths = _this.data.tempFilePaths
                             tmp_tempFilePaths[e.currentTarget.dataset.foodindex].push(res_0.tempFilePaths[0])
                             _this.setData({
                                 tempFilePaths: tmp_tempFilePaths //预览图片响应式
                             })
                             _this.data.imagesArr[e.currentTarget.dataset.foodindex].push(tmp_data.data)
                         } else {
                             wx.showToast({
                                 title: tmp_data.msg,
                                 image: '/images/msg/error.png',
                                 duration: 2000
                             })
                         }
                     }
                 })
             }

         })
     },
     //用于解决小程序的遮罩层滚动穿透
     preventTouchMove: function() {

     }

 })