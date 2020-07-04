import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: {},
        orderCode: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this
        let url = '/userEvaluate/getUserEvaluateDetail?userCode=' + wx.getStorageSync('userCode') + '&orderCode=' + options.orderCode
        let param = {
            url
        }
        requestModel.request(param, (data) => {
            _this.setData({
                detail: data,
                already: true,
                orderCode: options.orderCode
            })
        })
        _this.updateOrderReplyRead(options.orderCode)
    },
    // 标记已读
    updateOrderReplyRead(orderCode) {
        let param = {
            userCode: wx.getStorageSync('userCode'),
            orderCode: orderCode
        }
        let url = '/userEvaluate/updateOrderReplyRead'
        let params = {
            data: param,
            url,
            method: 'post'
        }
        requestModel.request(params, () => {
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})