// pages/mine/complaint/words/words.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

        activeLeft: 0,
        value: '',
    },
    bindInput(e) {

        this.setData({
            value: e.detail.value
        })

    },
    changeActiveLeft(e) {
        this.setData({
            activeLeft: e.currentTarget.dataset.index
        })
    },
    //创建话题
    createMineWords() {
        let word = this.data.value
        word = word.trim()
        let item = this.data.leftList[0].list
        if (item.includes(word)) {
            return
        }
        item.unshift(word)
        this.setData({
            leftList: this.data.leftList,
            value: '',
        })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
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

        const query = wx.createSelectorQuery()
        query.select('.wrapper').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
            _this.setData({
                scrollTop: res[0].bottom // #the-id节点的上边界坐标
            })
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
        let leftList = [{
                name: '我的',
                title: '我创建的 ',
                list: ['菜品丰富', '服务态度好', '口味偏重']
            },
            {
                name: '推荐',
                title: '推荐',
                list: ['推荐1', '推荐2', '推荐3', '推荐4']
            },
            {
                name: '好评',
                title: '好评',
                list: ['好评1', '好评2']
            },
            {
                name: '吐槽',
                title: '吐槽',
                list: ['吐槽1', '吐槽2', '吐槽3']
            }
        ]
        this.setData({
            leftList: leftList,
            // this.setData({
            scrollToView: 'right10'
                // })
        })
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