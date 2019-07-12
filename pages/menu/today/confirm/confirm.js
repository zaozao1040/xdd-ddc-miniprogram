 import { base } from '../../../../comm/public/request'
 let requestModel = new base()
 Page({

     /**
      * 页面的初始数据
      */
     data: {
         payType: 'BALANCE_PAY', //'WECHAT_PAY' 支付方式,余额大于付款额则默认余额支付   小于的话则默认微信支付

         //
         windowHeight: 0,
         scrollTop: 0,
         buttonTop: 0,

         loading: false,
         timer: null,
         canClick: true,
         //这四个记录缓存的值
         address: '',
         userName: '',
         phoneNumber: '',

         selectedFoods: [],
         totalMoney: 0,
         totalMoneyRealDeduction: 0, //额度总金额
         totalDeduction: 0, //优惠的总价格，企业额度和优惠券优惠

         realMoney: 0, //实际总价格，也就是自费价格
         realMoney_save: 0, //实际总价格，也就是自费价格(从menu传过来的，不含减去优惠券的价格--保存下来用于选择不同优惠券)

         showSelectDiscountFlag: false, //展示选择优惠券的页面，默认不展示
         canusedDiscountList: null, //可用的优惠券列表
         adviceDiscountObj: null, //推荐的优惠券
         useDiscountFlag: true, //使用优惠券的标志,默认使用
         discountMoney: 0, //打折的金额（满减券就是本身 折扣券就是x百分比）
         discountTypeMap: {
             DISCOUNT: '折扣券',
             REDUCTION: '满减券'
         },

         mapMenutype: ['早餐', '午餐', '晚餐', '夜宵'],
         mapMenutypeIconName: ['zaocan1', 'wucan', 'canting', 'xiaoye-'],

         allBalance: 0,
         walletSelectedFlag: true, //勾选是否使用余额  默认勾选    true开启    false关闭
         finalMoney: 0,

         showSelectFlag: false, //展示填写姓名和配送地址的弹出框，默认不展示
         mealEnglistLabel: ['breakfast', 'lunch', 'dinner', 'night'],
         generateOrderNow: false //防止狂点去付款
     },

     initAddress: function() {
         let _this = this
         wx.getSystemInfo({
             success: function(res) {
                 _this.setData({
                     windowHeight: res.windowHeight
                 })
             }
         })

         const query_1 = wx.createSelectorQuery()
         query_1.select('.c_buttonPosition_forCalculate').boundingClientRect()
         query_1.selectViewport().scrollOffset()
         query_1.exec(function(res) {
             console.log('c_buttonPosition_forCalculate', res)
             _this.setData({
                 buttonTop: res[0].top // #the-id节点的上边界坐标
             })
         })

         const query_2 = wx.createSelectorQuery()
         query_2.select('.c_buttonPosition_forCalculate_top').boundingClientRect()
         query_2.selectViewport().scrollOffset()
         query_2.exec(function(res) {
             console.log('c_buttonPosition_forCalculate_top', res)
             _this.setData({
                 addressBottom: res[0].bottom // #the-id节点的上边界坐标
             })
         })
     },
     onLoad: function(options) {
         this.initAddress()

         let selectedFoods = [];
         // 一天
         console.log('options', options)
         if (options.orderType == 'one') {
             let a = wx.getStorageSync('todaySelectedFoods')

             a.deductionMoney = options.totalMoneyRealDeduction
             a.count = 1 //这个count是我自己随便设置的 5/6
             selectedFoods.push(a)
                 // 7tian
         } else if (options.orderType == 'seven') {
             selectedFoods = wx.getStorageSync('sevenSelectedFoods')

         } else if (options.orderType == 'add') { //补餐
             let a = wx.getStorageSync('addSelectedFoods')

             selectedFoods.push(a)
         }
         //初始化，默认都选择不使用积分抵扣

         for (let i = 0; i < selectedFoods.length; i++) {
             //是否使用积分
             if (selectedFoods[i].count > 0) {
                 for (let m = 0; m < this.data.mealEnglistLabel.length; m++) {
                     let meal = this.data.mealEnglistLabel[m]
                     if (selectedFoods[i][meal]) {
                         selectedFoods[i][meal].useIntegral = false
                     }
                 }
             }
             //显示的日期
             if (selectedFoods[i].mealDate) {
                 let a = selectedFoods[i].mealDate.split('-')
                 selectedFoods[i].mealDateShow = a[1] + '/' + a[2]
             }
         }

         console.log('sevenSelectedFoods', selectedFoods)
         wx.setStorageSync('sevenSelectedFoods', selectedFoods)
         this.setData({
             selectedFoods: selectedFoods,
             totalMoney: options.totalMoney,
             totalMoneyRealDeduction: options.totalMoneyRealDeduction,
             realMoney: parseFloat(options.realMoney),
             realMoney_save: options.realMoney,
             totalDeduction: options.totalMoneyRealDeduction,
             orderType: options.orderType
         })
         this.getOrderVerificationString()


     },
     getOrderVerificationString() {
         let _this = this
         requestModel.getUserCode(userCode => {
             let param = {
                 url: '/order/getOrderVerificationString?userCode=' + userCode
             }
             requestModel.request(param, data => {
                 _this.data.verificationString = data
             })
         })

     },
     /**
      * 生命周期函数--监听页面显示
      */
     onShow: function() {
         let _this = this
         requestModel.getUserInfo(userInfo => {
             let { userType, orgAdmin } = userInfo
             if (userType == 'ORG_ADMIN' && orgAdmin == true) {
                 _this.setData({
                     orgAdmin: true
                 })
             } else {
                 _this.setData({
                     orgAdmin: false
                 })
             }
             _this.setData({
                 address: userInfo.deliveryAddress,
                 userName: userInfo.userName,
                 phoneNumber: userInfo.phoneNumber,
                 userInfo: userInfo
             })

             if (!_this.data.userName || !userInfo.deliveryAddress) {
                 _this.setData({
                     showSelectFlag: true
                 })
             }

         })
         requestModel.getUserCode(userCode => {
             let param = {
                 url: '/user/getUserFinance?userCode=' + userCode
             }
             requestModel.request(param, data => {
                 _this.setData({
                     allBalance: data.allBalance,
                 })
                 if (!_this.data.realMoney) { //等于0则是标准支付
                     console.log('余额为0')
                     _this.setData({
                         walletSelectedFlag: false,
                         payType: 'STANDARD_PAY'
                     })
                 } else if (data.allBalance < this.data.realMoney) { //余额小于实际付款，则改为微信付款
                     _this.setData({
                         walletSelectedFlag: false,
                         payType: 'WECHAT_PAY'
                     })
                 }
             })
         })


         //从后端获取优惠券信息

     },
     /* 页面隐藏后回收定时器指针 */
     onHide: function() {
         if (this.data.timer) {
             clearTimeout(this.data.timer)
         }
     },

     /* 用户点击不使用优惠券 */
     handleNotUseDiscount: function() {
         this.setData({
             useDiscountFlag: !this.data.useDiscountFlag,
             showSelectDiscountFlag: !this.data.showSelectDiscountFlag,
             adviceDiscountObj: {
                 discountPrice: 0,
                 discountStandardPrice: 0
             },
             realMoney: parseFloat((this.data.realMoney_save - 0).toFixed(2))
         })
     },
     /* 改变现实优惠券选择页的展示状态 */
     handleChangeSelectDiscountFlag: function() {

         this.setData({
             showSelectDiscountFlag: !this.data.showSelectDiscountFlag
         })
     },
     /* 监听子组件：改变现实优惠券选择页的展示状态 */
     onChangeSelectDiscountFlag: function(e) {

         //然后计算折扣掉的金额discountMoney
         let tmp_realMoney = this.data.realMoney_save
         if (e.detail.discountType == 'REDUCTION') {
             tmp_realMoney = parseFloat((parseFloat(tmp_realMoney) - parseFloat(e.detail.discountPrice)).toFixed(2))
         } else if (e.detail.discountType == 'DISCOUNT') {
             tmp_realMoney = parseFloat((parseFloat(this.data.realMoney_save) * e.detail.discountPrice + 0.00001).toFixed(2))
         } else {
             tmp_realMoney = 0
         }
         this.setData({
             showSelectDiscountFlag: !this.data.showSelectDiscountFlag,
             useDiscountFlag: true,
             adviceDiscountObj: e.detail,
             realMoney: tmp_realMoney,
             discountMoney: parseFloat((parseFloat(this.data.realMoney_save) - tmp_realMoney).toFixed(2)),
             totalDeduction: parseFloat((this.data.totalMoneyRealDeduction + this.data.discountMoney).toFixed(2))
         })
         console.log(this.data.realMoney)
     },
     nameInput: function(e) {
         this.setData({
             userName: e.detail.value
         })
     },
     addressInput: function(e) {
         this.setData({
             address: e.detail.value
         });
     },
     /* 展示弹窗(选择姓名和取餐低脂) */
     handleChangeSelectFlag: function() {
         this.setData({
             showSelectFlag: !this.data.showSelectFlag
         })
     },
     /* 校验参数(选择姓名和取餐低脂) */
     handleCheckParams: function() {
         if (!this.data.userName) {
             wx.showToast({
                 title: '请填写姓名',
                 image: '/images/msg/error.png',
                 duration: 2000
             })
         } else if (!this.data.address) {
             wx.showToast({
                 title: '请选择送餐地址',
                 image: '/images/msg/error.png',
                 duration: 2000
             })
         } else {
             wx.showToast({
                 title: '填写成功',
                 image: '/images/msg/success.png',
                 duration: 2000
             })
             this.setData({
                 showSelectFlag: false
             })
         }
     },
     //关闭余额提示
     closeBalanceConfirmFlag() {
         this.setData({
             balanceConfirmFlag: false
         })
     },
     //余额支付的提示
     handleCommitPayCheck() {
         if (!this.data.userName) {
             wx.showToast({
                 title: '请填写姓名',
                 image: '/images/msg/error.png',
                 duration: 2000
             })
             return
         }
         if (!this.data.userInfo.deliveryAddressCode) {
             wx.showToast({
                 title: '请选择送餐地址',
                 image: '/images/msg/error.png',
                 duration: 2000
             })
             return
         }
         //如果是余额支付，并且金额大于0，则弹出提示框
         if (this.data.payType == 'BALANCE_PAY' && this.data.realMoney > 0) {
             this.setData({
                 balanceConfirmFlag: true
             })
         } else {
             //其余支付方式则直接支付
             this.handleCommitPay()
         }
     },
     /**
      * 付款 提交菜单
      */
     handleCommitPay: function() {

         let _this = this
         _this.setData({
             balanceConfirmFlag: false
         })
         if (_this.data.generateOrderNow) {
             return
         }
         //不允许再点击
         _this.setData({
             generateOrderNow: true
         })
         requestModel.getUserCode(userCode => {


             /**** 拼接这个庞大的参数 ****/
             let tmp_userDiscountCode = null
             if (_this.data.adviceDiscountObj) {
                 tmp_userDiscountCode = _this.data.adviceDiscountObj.userDiscountCode
             }
             let tmp_param = {
                 verificationString: _this.data.verificationString,
                 userCode: userCode,
                 userName: _this.data.userName,
                 addressCode: _this.data.userInfo.deliveryAddressCode,
                 payType: _this.data.payType, //支付方式
                 userDiscountCode: tmp_userDiscountCode,
                 orderPayMoney: _this.data.realMoney, //自费的总价格
                 appendMealFlag: _this.data.orderType == 'add' ? true : false,
                 order: []

             }

             _this.data.selectedFoods = wx.getStorageSync('sevenSelectedFoods')

             for (let i = 0; i < _this.data.selectedFoods.length; i++) {

                 let tmp_selectedFoods = _this.data.selectedFoods[i]
                 if (tmp_selectedFoods.count > 0) {


                     _this.data.mealEnglistLabel.forEach(mealType => {
                         if (tmp_selectedFoods[mealType] && tmp_selectedFoods[mealType].selectedFoods.length > 0) { //选了这个餐时的菜

                             let order_item = {
                                 mealDate: tmp_selectedFoods.mealDate,
                                 mealType: mealType.toUpperCase(),
                                 foods: [],
                                 integralNumber: 0
                             }

                             tmp_selectedFoods[mealType].selectedFoods.forEach(onefood => {
                                 let foods_item = {
                                     foodCode: onefood.foodCode,
                                     quantity: onefood.foodCount,
                                     markDetail: onefood.remarkList
                                 }
                                 order_item.foods.push(foods_item)
                             })

                             tmp_param.order.push(order_item)
                         }
                     })
                 }
             }

             let param = tmp_param
             if (!param.orderPayMoney) {
                 param.payType = 'STANDARD_PAY' //支付方式改为标准支付
             }
             let params = {
                 data: param,
                 url: '/order/generateOrder',
                 method: 'post'
             }
             requestModel.request(params, resdata => {

                 let data = resdata.payData

                 if (!data || param.payType == 'BALANCE_PAY' || param.payType == 'STANDARD_PAY') {
                     wx.reLaunch({
                             url: '/pages/order/order?content=' + '订单已生成',
                         })
                         // _this.setData({
                         //     generateOrderNow: false
                         // })
                         // console.log('handleCommitPay--BALANCE_PAY')
                 } else if (param.payType == 'WECHAT_PAY' && resdata.needPay) { //微信支付
                     if (data.timeStamp) {
                         wx.requestPayment({
                             'timeStamp': data.timeStamp.toString(),
                             'nonceStr': data.nonceStr,
                             'package': data.packageValue,
                             'signType': data.signType,
                             'paySign': data.paySign,
                             success: function(e) {
                                 setTimeout(function() {
                                         wx.reLaunch({
                                             url: '/pages/order/order?content=' + '订单已生成',
                                         })
                                     }, 200)
                                     // _this.setData({
                                     //     generateOrderNow: false
                                     // })
                                     // console.log('handleCommitPay--WECHAT_PAY--success')

                             },
                             fail: function(e) {
                                 setTimeout(function() {
                                         wx.reLaunch({
                                             url: '/pages/order/order?content=' + '订单已生成,请尽快支付',
                                         })
                                     }, 200)
                                     // _this.setData({
                                     //     generateOrderNow: false
                                     // })
                                     // console.log('handleCommitPay--WECHAT_PAY--fail')
                             }
                         })
                     }
                 }
             }, true, () => {
                 _this.setData({
                     generateOrderNow: false
                 })
                 _this.getOrderVerificationString()
             })
         })
     },

     /* 重新选择默认地址 */
     handleSelectAddress: function() {
         wx.navigateTo({
             url: '/pages/mine/address/address?frontPageFlag=confirm',
         })
     },
     /* 勾选余额付款的按钮 */
     handleChangeWalletSelectedFlag: function() {
         let _this = this
         if (_this.data.walletSelectedFlag) { //如果原来是开启余额支付，则本次点击会切换成关闭，同时切换成微信支付
             _this.setData({
                 walletSelectedFlag: !_this.data.walletSelectedFlag,
                 payType: 'WECHAT_PAY'
             })
         } else { //如果原来是关闭余额支付，则首先判断余额是否充足
             if (_this.data.allBalance < _this.data.realMoney) { //如果用户余额少于用户需要支付的价格，不允许用余额,也就是禁止打开switch
                 wx.showToast({
                     title: '余额不足,请充值',
                     image: '/images/msg/error.png',
                     duration: 2000
                 })
                 return
             } else { //使用余额支付方式
                 _this.setData({
                     walletSelectedFlag: !_this.data.walletSelectedFlag,
                     payType: 'BALANCE_PAY'
                 })
             }
         }
     },
     gotoRemark() {
         wx.navigateTo({ url: '/pages/menu/remark/remark' })
     }
 })