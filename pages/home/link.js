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
                extendUrl: options.extendUrl //这个options就是navigator跳转过来的url参数
            })
            // this.setData({
            //     extendUrl: 'http://192.168.0.101:8080/protocal?userCode=' + wx.getStorageSync('userCode') //这个options就是navigator跳转过来的url参数
            // })
        console.log(this.data.extendUrl)
    },



})