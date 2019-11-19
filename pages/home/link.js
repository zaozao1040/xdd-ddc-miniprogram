Page({

    /**
     * 页面的初始数据
     */
    data: {
        extendUrl: ''
    },


    /**
     * 生命周期函数--监听页面加载
     */

    onLoad: function(options) {

        this.setData({
            extendUrl: options.extendUrl + '?userCode=' + wx.getStorageSync('userCode') + '&from=miniprogram'
        })
        if (options.title) {
            wx.setNavigationBarTitle({
                title: options.title
            })
        }
        // this.setData({
        //     extendUrl: 'http://192.168.0.101:8080/survey?userCode=' + wx.getStorageSync('userCode')
        // })
    },



})