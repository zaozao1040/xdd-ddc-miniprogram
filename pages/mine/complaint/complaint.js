import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        windowHeight: 200,
        value: '', //吐槽的内容
        count: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        let _this = this
        wx.getSystemInfo({
            success(res) {
                if (res) {
                    _this.setData({
                        windowHeight: res.windowHeight
                    })
                }
            }
        })
    },
    makeComplaints() {
        let _this = this
        if (_this.data.value) {
            requestModel.getUserCode(userCode => {
                let param = {}
                param.userCode = userCode
                param.content = _this.data.value

                let url = '/help/suggestion'
                let params = {
                    data: param,
                    url,
                    method: 'post'
                }

                requestModel.request(params, () => {
                    wx.showToast({
                        title: '吐槽完成',
                        icon: 'success',
                        duration: 2000
                    })
                    _this.setData({
                        value: '',
                        count: 0
                    })
                })
            })
        }
    },
    bindTextAreaInput(e) {
        if (e.detail.value) {
            this.setData({
                value: e.detail.value,
                count: e.detail.cursor
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