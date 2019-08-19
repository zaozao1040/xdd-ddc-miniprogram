// pages/mine/complaint/say.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeNum: 1,
        count: 0,
        max: 6,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let wordList = [{
                title: '菜品丰富',
                active: true,
            },
            {
                title: '食材新鲜',
                active: false,
            },
            {
                title: '好吃不油腻',
                active: false,
            },
            {
                title: '食材很新鲜',
                active: false,
            },
            {
                title: '食材新鲜',
                active: false
            }
        ]
        this.setData({
            wordList: wordList
        })
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
    deleteOne(e) {

    },
    changeSelect(e) {
        let _this = this
        let index = e.currentTarget.dataset.index
        let item = _this.data.wordList[index]
        if (item.active) {
            item.active = false
            _this.data.activeNum--
                _this.setData({
                    wordList: _this.data.wordList,

                })
        } else {
            if (_this.data.activeNum == _this.data.max) {
                wx.showToast({
                    title: '最多' + _this.data.max + '个',
                    icon: '/images/msg/warning.png',
                    duration: 2000
                })
            } else {
                item.active = true
                _this.data.activeNum++
                    _this.setData({
                        wordList: _this.data.wordList,

                    })
            }
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
    gotoAddWords() {
        wx.navigateTo({
            url: './words/words'
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