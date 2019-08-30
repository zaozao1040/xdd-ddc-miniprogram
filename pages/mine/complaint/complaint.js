import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        amount: 0,
        list: [],
        page: 1,
        limit: 10,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        let _this = this
        let { headImage, userName } = wx.getStorageSync('userInfo').userInfo
        _this.setData({
            headImage,
            userName
        })

        wx.getSystemInfo({
            success(res) {
                if (res) {
                    _this.setData({
                        windowHeight: res.windowHeight
                    })
                }
            }
        })
        _this.getList()

    },
    getList() {
        let _this = this
        let page = _this.data.page
        let limit = _this.data.limit
        let url = '/help/getUserSuggestionList?userCode=' + wx.getStorageSync('userCode') + '&page=' + page + '&limit=' + limit
        let param = {
            url
        }
        requestModel.request(param, (data) => {

            let { list, amount } = data

            if (page == 1) {
                _this.setData({
                    list: list,
                    loadingData: false,
                    amount: amount
                })
            } else {
                _this.setData({
                    list: _this.data.list.concat(list), //concat是拆开数组参数，一个元素一个元素地加进去
                    loadingData: false,
                    amount: amount
                })
            }
            // 大于amount，说明已经加载完了
            if (page * limit >= amount) {
                _this.setData({
                    hasMoreDataFlag: false
                })
            } else {
                _this.setData({
                    hasMoreDataFlag: true,
                    page: page + 1
                })
            }

            if (amount >= 1 && !_this.data.scrollHeight) {
                const query2 = wx.createSelectorQuery()
                query2.select('.button').boundingClientRect()
                query2.selectViewport().scrollOffset()
                query2.exec(function(res) {
                    _this.setData({
                        scrollHeight: res[0].top // #the-id节点的上边界坐标
                    })
                })
            }
        })
    },
    gotoNextPage: function() {
        if (this.data.hasMoreDataFlag) {
            this.getList()
        }
    },
    gotoSay() {
        wx.navigateTo({
            url: './say'
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
        console.log('refreshComplaint', wx.getStorageSync('refreshComplaint'))
        if (wx.getStorageSync('refreshComplaint')) {
            this.setData({
                page: 1
            })
            this.getList()
            wx.setStorageSync('refreshComplaint', false)
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