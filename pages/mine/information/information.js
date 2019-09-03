import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        getalready: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this
        wx.getSystemInfo({
            success(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })

            }
        })
        _this.getUserDetailInfo()
    },
    getUserDetailInfo() {
        requestModel.getUserCode(userCode => {
            let param = {
                url: '/user/getUserDetailInfo?userCode=' + userCode
            }
            requestModel.request(param, data => {
                this.setData({
                    userInfo: data,
                    getalready: true
                })
            })
        })

    },
    // 注销账户 
    logout: function() {
        wx.removeStorageSync('userCode')
        wx.removeStorageSync('userInfo')

        wx.reLaunch({
            url: '/pages/home/home',
        })
        wx.showToast({
            title: '注销成功',
            image: '/images/msg/success.png',
            duration: 2000
        })
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