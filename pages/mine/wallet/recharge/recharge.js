 import { base } from '../../../../comm/public/request'
 let requestModel = new base()
 Page({
     data: {

         //
         canRechargeFlag: true, //充值通道开启状态，默认开启
         //
         windowHeight: 0,
         moneyList: [],
         activeFlag1: undefined,
         activeFlag2: undefined,
         selectedMoney: 0,
         presentAmount: '',

     },
     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function(options) {
         let _this = this
         wx.getSystemInfo({
             success: function(res) {
                 _this.setData({
                     windowHeight: res.windowHeight
                 })
             }
         })
     },

     /**
      * 生命周期函数--监听页面显示
      */
     onShow: function() {

         this.getGiftList()
     },

     /* 获取充多少送多少的list */
     getGiftList: function() {
         let _this = this
         let param = {
                 url: '/organize/getOrganizeRechargeActivity?userCode=' + wx.getStorageSync('userCode')
             }
             //请求充值返送列表
         requestModel.request(param, (data) => {
             _this.setData({
                 canRechargeFlag: data.recharge
             })
             if (data.recharge) { //该企业可以充值
                 let list = data.rechargeActivityList
                 let tmp_1 = []
                 tmp_1.push(list[0])
                 tmp_1.push(list[1])
                 tmp_1.push(list[2])
                 let tmp_2 = []
                 tmp_2.push(list[3])
                 tmp_2.push(list[4])
                 tmp_2.push(list[5])
                 let tmp_moneyList = []
                 tmp_moneyList.push(tmp_1)
                 tmp_moneyList.push(tmp_2)
                 _this.setData({
                         moneyList: tmp_moneyList
                     })
                     //默认选择第一个
                 this.setData({
                     activeFlag1: 0,

                     activeFlag2: 0,

                     selectedMoney: list[0].rechargeAmount,
                     presentAmount: list[0].presentAmount
                 })
             }
         })
     },

     /* click更改选中的金额 */
     changeMoneyActiveFlag: function(e) {
         let { activeflag1, activeflag2, selectedmoney, presentamount } = e.currentTarget.dataset
         this.setData({
             activeFlag1: activeflag1,
             activeFlag2: activeflag2,
             selectedMoney: selectedmoney,
             presentAmount: presentamount
         })
     },
     /* 立即充值 */
     handleRecharge: function() {
         let _this = this
         console.log(this.data.selectedMoney)
         if (_this.data.selectedMoney == 0) {
             wx.showToast({
                 title: "请选择充值金额",
                 icon: "none",
                 duration: 2000
             })
         } else {

             let param = {
                 userCode: wx.getStorageSync('userCode'),
                 rechargeAmount: _this.data.selectedMoney
             }
             let params = {
                 data: param,
                 url: '/user/userRecharge',
                 method: 'post'
             }
             requestModel.request(params, (resdata) => {
                 if (resdata.needPay) {
                     let data = resdata.payData

                     if (data.timeStamp) {
                         wx.requestPayment({
                             'timeStamp': data.timeStamp.toString(),
                             'nonceStr': data.nonceStr,
                             'package': data.packageValue,
                             'signType': data.signType,
                             'paySign': data.paySign,
                             success: function(e) {
                                 //刷新余额
                                 let param = {
                                     url: '/user/getUserFinance?userCode=' + wx.getStorageSync('userCode')
                                 }
                                 requestModel.request(param, data => {
                                     _this.setData({
                                         balance: data.balance
                                     })
                                 })
                                 wx.showToast({
                                     title: '充值成功',
                                     icon: 'success',
                                     duration: 2000
                                 })
                             },
                             fail: function(e) {
                                 wx.showToast({
                                     title: '已取消充值',
                                     icon: 'success',
                                     duration: 4000
                                 })
                             }
                         })
                     }
                 }

             })

         }
     },

     /* 页面隐藏后回收定时器指针 */
     onHide: function() {

     },
 })