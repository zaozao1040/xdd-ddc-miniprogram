import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        amount: 0,
        list: [],
        page: 1,
        limit: 10,
        weekend: {
            MONDAY: '周一',
            TUESDAY: '周二',
            WEDNESDAY: '周三',
            THURSDAY: '周四',
            SATURDAY: '周六',
            FRIDAY: '周五',
            SUNDAY: '周日'
        },
        mealType: {
            BREAKFASE: '早餐',
            LUNCH: '午餐',
            DINNER: '晚餐',
            NIGHT: '夜宵'
        }
    },
    gotoDetail(e) {
        wx.navigateTo({
            url: './detail?orderCode=' + e.currentTarget.dataset.ordercode
        })
    },
    getList() {
        let _this = this
        let page = _this.data.page
        let limit = _this.data.limit
        let url = '/userEvaluate/getUserEvaluateList?userCode=' + wx.getStorageSync('userCode') + '&page=' + page + '&limit=' + limit
        let param = {
            url
        }
        requestModel.request(param, (data) => {

            let { list, amount } = data
            list.forEach(item => {
                //获取 07月19日（周五）晚餐
                let dates = item.mealDate.split('-')
                item.dateDes = dates[1] + '月' + dates[2] + '日 （' + _this.data.weekend[item.dayOfWeek] + '） ' + _this.data.mealType[item.mealType]
                item.totalCount = item.orderFoodEvaluate.length
            })
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
        })
    },
    gotoNextPage: function() {
        if (this.data.hasMoreDataFlag) {
            this.getList()
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this
        let { headImage, userName } = wx.getStorageSync('userInfo').userInfo
        _this.setData({
            headImage,
            userName
        })
        wx.getSystemInfo({
            success(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
                console.log('scrollHeight', _this.data.windowHeight)
            }
        })

        _this.getList()
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