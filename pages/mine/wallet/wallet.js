 import { base } from '../../../comm/public/request'
 let requestModel = new base()
 Page({
     data: {
         canRechargeFlag: true, //充值通道开启状态，默认开启
         //
         windowHeight: 0,
         open: false,
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

         let param = {
             url: '/user/getUserFinance?userCode=' + wx.getStorageSync('userCode')
         }
         requestModel.request(param, data => {
             this.setData({
                 balance: data.balance, //个人充值币
                 organizeBalance: data.organizeBalance, //企业充值币
                 presentBalance: data.presentBalance, //赠币
                 allBalance: data.allBalance, //所有币
                 totalBalance: data.totalBalance, //充值币
                 totalPresentBalance: data.totalPresentBalance, //赠币的和

             })
         })
         this.getOrganizeSet()
     },
     //获取企业设置
     getOrganizeSet() {
         let _this = this
         requestModel.getUserInfo(userInfo => {
             let param = {
                 url: '/organize/getOrganizeSet?userCode=' + wx.getStorageSync('userCode') + '&organizeCode=' + userInfo.organizeCode
             }
             requestModel.request(param, data => {
                 _this.setData({
                     canRechargeFlag: data.recharge,
                     organizeBalanceFlag: data.organizeBalance
                 })
             })
         })


     },

     //有企业点餐币的操作
     showDetail() {
         this.setData({
             open: !this.data.open
         })
     },
     gotoRecharge() {
         wx.navigateTo({ url: '/pages/mine/wallet/recharge/recharge' })
     },
     gotoDetail(e) {
         let type = e.currentTarget.dataset.type
         wx.navigateTo({ url: './detail/detail?type=' + type })
     },

     /**
      * 生命周期函数--监听页面显示
      */
     onShow: function() {


     },


     /* 页面隐藏后回收定时器指针 */
     onHide: function() {

     },
 })