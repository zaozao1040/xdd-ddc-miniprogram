import { discountPromotion } from './discountPromotion-model.js'
let discountPromotionModel = new discountPromotion()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //
        canClick: true,
        //
        discountList: [{
            total: 59,
            dis: 15,
            discountCode: '123'
        }, {
            total: 40,
            dis: 5,
            discountCode: '345'
        }]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /* 触发父组件去关闭弹出层 */
    handleCloseLayer: function() {
        this.triggerEvent('closelayer', {})
    },

    /* 领取优惠券 */
    handleTakeDiscount: function(e) {
        console.log(e.currentTarget.dataset.discountcode)
        let _this = this
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        let param = {
            userCode: wx.getStorageSync('userCode'),
            discountcode: e.currentTarget.dataset.discountcode
        }
        wx.showLoading({
            title: '处理中',
            mask: true
        })
        discountPromotionModel.takeDiscount(param, (res) => {
            console.log('收到请求(领取优惠券):', res)
            if (res.code === 0) {
                wx.hideLoading()
                wx.showToast({
                    title: '成功领取',
                    image: '/images/msg/success.png',
                    duration: 2000
                })
                wx.reLaunch({
                    url: '/pages/home/home'
                })
            } else {
                wx.hideLoading()
                wx.showToast({
                    title: res.msg,
                    image: '/images/msg/error.png',
                    duration: 2000
                })
            }
        })
        setTimeout(function() {
            _this.data.canClick = true
        }, 2000)
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

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