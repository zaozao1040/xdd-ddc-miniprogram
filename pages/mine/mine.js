 import { base } from '../../comm/public/request'
 let requestModel = new base()

 Page({
     data: {
         //用户信息
         canIUse: wx.canIUse('button.open-type.getUserInfo'),
         userInfo: null,

         labelList: ['换绑手机', '地址管理', '绑定企业', '客户服务'],
         imageList: ['me_swap@2x', 'me_address@2x', 'me_enterprise@2x', 'me_service@2x'],
         navigatorUrl: [
             '/pages/mine/phone/phone',
             '/pages/mine/address/address',
             '/pages/mine/organize/organize'
         ],
         //客服电话
         servicePhone: null,

         cc: 1,
         cabNumList: [], //柜子列表，如果柜子列表为空，就不显示‘打开柜子页面’

     },
     //跳转到详细资料页面
     gotoDetailInfo() {
         wx.navigateTo({
             url: '/pages/mine/information/information'
         })
     },
     //加餐
     gotoAddfood() {
         wx.navigateTo({
             url: '/pages/mine/addfood/addfood'
         })
     },
     /* 跳转 */
     handleClickLabel: function(e) {

         let clickIndex = e.currentTarget.dataset.labelindex
         let _this = this

         if (clickIndex == 2) { //绑定企业
             requestModel.getUserInfo(userInfo => {
                 if (userInfo.bindOrganized == true) {
                     wx.showToast({
                         title: '已绑定过企业',
                         image: '../../images/msg/warning.png',
                         duration: 3000
                     })
                 } else {
                     wx.navigateTo({
                         url: _this.data.navigatorUrl[clickIndex]
                     })
                 }
             })
         } else if (clickIndex == 3) { //客户服务
             //请求客服电话

             wx.showLoading({ //【防止狂点2】
                 title: '获取电话中',
                 mask: true
             })
             let param = {
                 url: '/help/getHelp'
             }
             requestModel.request(param, data => {
                 wx.hideLoading()
                 _this.data.servicePhone = data.contactPhone

                 wx.showModal({
                     title: '是否拨打客户电话?',
                     content: data.contactPhone,
                     confirmText: '拨打',
                     cancelText: '返回',
                     success(res) {
                         if (res.confirm) {
                             wx.makePhoneCall({
                                 phoneNumber: data.contactPhone
                             })
                         }
                     }
                 })
             })
         } else {
             wx.navigateTo({
                 url: _this.data.navigatorUrl[clickIndex]
             })
         }
     },
     /**
      * 生命周期函数--监听页面加载
      */
     onLoad: function() {
         // 需要从后台再获取一次用户信息吗？

         requestModel.getUserInfo(userInfo => {
             this.setData({
                 userInfo: userInfo
             })
             console.log('requestModel', userInfo)
         })

     },
     // 我要吐槽
     gotoSaySomething() {
         wx.navigateTo({
             url: '/pages/mine/complaint/complaint'
         })
     },
     /**
      * 生命周期函数--监听页面初次渲染完成
      */
     onReady: function() {},

     /**
      * 生命周期函数--监听页面显示
      */
     onShow: function() {
         //
         let param = {
             url: '/user/getUserFinance?userCode=' + wx.getStorageSync('userCode')
         }
         requestModel.request(param, data => {
                 this.setData({
                     balance: data.balance,
                     integral: data.integral,
                     discount: data.discount
                 })
             })
             // 5/13 要修改
         if (wx.getStorageSync('refreshUserInfoFlag')) {
             this.onPullDownRefresh()
             wx.setStorageSync('refreshUserInfoFlag', false)
         } else {
             requestModel.getUserInfo(userInfo => {
                 this.setData({
                     userInfo: userInfo
                 })
             })
         }
     },

     /**
      * 生命周期函数--监听页面隐藏
      */
     onHide: function() {

     },

     /**
      * 生命周期函数--监听页面卸载
      */
     onUnload: function() {

     },

     /**
      * 页面相关事件处理函数--监听用户下拉动作
      */
     onPullDownRefresh: function() {
         let _this = this
             //初始化，获取一些必要参数，如高度

         wx.showNavigationBarLoading();
         wx.login({
             success: function(res) {
                 if (res.code) {
                     _this.setData({
                             userInfo: requestModel.getUserInfo(() => {}, true)
                         })
                         // bug 因为是异步刷新，所以userInfo还没获取到，就hideLoading了

                     wx.hideNavigationBarLoading();
                     wx.stopPullDownRefresh()

                 }
             }
         })
     },

     /**
      * 页面上拉触底事件的处理函数
      */
     onReachBottom: function() {

     },

     /**
      * 用户点击右上角分享
      */
     onShareAppMessage: function() {

     }
 })