// pages/order/comment/comment.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },
    /* 去评价的对话框的确定 */
    buttonClickYes_ratings: function(e) {
        let _this = this
        if (!_this.data.starActiveNum) {
            wx.showToast({
                title: '请选择星级',
                image: '../../images/msg/warning.png',
                duration: 2000
            })
        } else if (_this.data.tempFilePaths != [] && _this.data.ratingsContent == '') {
            console.log(_this.data.tempFilePaths, _this.data.ratingsContent, _this.data.tempFilePaths && !_this.data.ratingsContent)
            wx.showToast({
                title: '请填写评价',
                image: '../../images/msg/warning.png',
                duration: 2000
            })
        } else {
            let param = {
                order: {
                    orderCode: _this.data.orderCode,
                    star: 0,
                    images: [],
                    wechatFormId: ''
                },
                foods: [{
                    foodCode: _this.data.foodCode,
                    star: _this.data.starActiveNum,
                    content: _this.data.ratingsContent,
                    wechatFormId: e.detail.formId,
                    images: _this.data.imagesArr
                }]
            }
            console.log('评价请求的参数：', param)
            wx.showLoading({ //【防止狂点2】
                title: '加载中',
                mask: true
            })
            orderModel.evaluateOrder(param, (res) => {
                console.log('收到请求(评价):', res)
                if (res.code === 0) {
                    wx.hideLoading()
                    wx.reLaunch({
                        url: '/pages/order/order',
                        success: function(res) {
                            wx.showToast({
                                title: '成功评价,已送您' + res.data + '积分',
                                image: '../../images/msg/success.png',
                                duration: 2000
                            })
                        }
                    })

                    wx.setStorageSync('refreshUserInfoFlag', true)
                } else {
                    wx.hideLoading()
                    wx.showToast({
                        title: res.msg,
                        image: '../../images/msg/error.png',
                        duration: 2000
                    })
                }
            })
        }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

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