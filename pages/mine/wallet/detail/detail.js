import { base } from '../../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        windowHeight: 100,
        rechargeListNoResult: false,
        rechargeList: [],
        page: 1,
        limit: 10,
        organizeMap: {
            RECHARGE: '充值',
            CONSUMPTION: '消费',
            CANCEL_ORDER: '取消订单返还',
            DEDUCTION: '企业扣减'
        },
        personalMap: {
            RECHARGE: '充值',
            CONSUMPTION: '消费',
            CANCEL_ORDER: '取消订单返还',
            PRESENT: '赠送',
            PRE_RECHARGE: '预充',
            ACTIVITY_PRESENT: '活动赠送',
            RECHARGE_PRESENT: '充值赠送',
            INTEGRAL_RECHARGE: '积分兑换'
        },
        giftMap: {
            CONSUMPTION: '消费',
            CANCEL_ORDER: '取消订单返还',
            PRESENT: '赠送',
            ACTIVITY_PRESENT: '活动赠送',
            RECHARGE_PRESENT: '充值赠送',
            INTEGRAL_RECHARGE: '积分兑换'
        },
        personalUrl: 'user/getUserBalanceRecord',
        organizeUrl: 'user/getUserOrganizeBalanceRecord',
        giftUrl: 'user/getUserPresentBalanceRecord',
        currentUrl: '',
        currentMap: {},
        type: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        let type = options.type

        if (type == 'gift') {
            wx.setNavigationBarTitle({
                    title: '赠币明细'
                })
                //赠送记录
            _this.setData({
                currentUrl: _this.data.giftUrl,
                currentMap: _this.data.giftMap
            })
        } else if (type == 'organize') {
            wx.setNavigationBarTitle({
                    title: '企业充值币明细'
                })
                //企业充值记录
            _this.setData({
                currentUrl: _this.data.organizeUrl,
                currentMap: _this.data.organizeMap
            })
        } else {
            wx.setNavigationBarTitle({
                    title: '个人充值币明细'
                })
                //个人充值记录
            _this.setData({
                currentUrl: _this.data.personalUrl,
                currentMap: _this.data.personalMap
            })
        }
        _this.setData({
            type: type
        })
        _this.getRechargeList(_this.data.currentUrl, _this.data.currentMap)
    },
    getRechargeList: function(url, typeMap) {
        this.setData({
            loadingData: true
        })
        let _this = this

        let page = _this.data.page
        let limit = _this.data.limit
        let param = {
            url: '/' + url + '?userCode=' + wx.getStorageSync('userCode') + '&page=' + page + '&limit=' + limit
        }
        requestModel.request(param, data => {
            if (data.amount == 0) {
                _this.setData({
                    rechargeListNoResult: true
                })
            } else {


                let tmp_rechargeList = data.list
                tmp_rechargeList.forEach(element => {
                    element.balance = (element.difference > 0 ? '+' : '') + (element.difference).toFixed(2)
                    element.recordTypeDes = typeMap[element.recordType]
                    element.operateTimeDes = element.operateTime
                })
                if (page == 1) {
                    _this.setData({
                        rechargeList: tmp_rechargeList,
                        loadingData: false
                    })
                } else {
                    _this.setData({
                        rechargeList: _this.data.rechargeList.concat(tmp_rechargeList),
                        loadingData: false
                    })
                }
                //下面开始分页 
                if (page * limit >= data.amount) { //说明已经请求完了 
                    _this.setData({
                        hasMoreDataFlag: false
                    })
                } else {
                    _this.setData({
                        hasMoreDataFlag: true
                    })
                    _this.data.page = page + 1
                }
            }
        })
    },
    /* 手动点击触发下一页 */
    gotoNextPage: function() {
        if (this.data.hasMoreDataFlag) {
            this.getRechargeList(this.data.currentUrl, this.data.currentMap)
        }
    },
    gotoCharge() {
        wx.navigateTo({ url: '../recharge/recharge' })
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
    /* 获取交易记录列表 */
    getpersonalRechargeList: function() {
        this.setData({
            loadingData: true
        })
        let _this = this

        let page = _this.data.page
        let limit = _this.data.limit
        let param = {
            url: '/user/getUserBalanceRecord?userCode=' + wx.getStorageSync('userCode') + '&page=' + page + '&limit=' + limit
        }
        requestModel.request(param, data => {
            let typeMap = {
                RECHARGE: '充值',
                CONSUMPTION: '消费',
                CANCEL_ORDER: '取消订单返还',
                PRESENT: '赠送',
                PRE_RECHARGE: '预充',
                ACTIVITY_PRESENT: '活动赠送',
                RECHARGE_PRESENT: '充值赠送',
                INTEGRAL_RECHARGE: '积分兑换'
            }
            let tmp_rechargeList = data.list
            tmp_rechargeList.forEach(element => {
                element.balance = (element.difference > 0 ? '+' : '') + (element.difference).toFixed(2)
                element.recordTypeDes = typeMap[element.recordType]
                element.operateTimeDes = element.operateTime
            })
            if (page == 1) {
                _this.setData({
                    rechargeList: tmp_rechargeList,
                    loadingData: false
                })
            } else {
                _this.setData({
                    rechargeList: _this.data.rechargeList.concat(tmp_rechargeList),
                    loadingData: false
                })
            }
            //下面开始分页 
            if (page * limit >= data.amount) { //说明已经请求完了 
                _this.setData({
                    hasMoreDataFlag: false
                })
            } else {
                _this.setData({
                    hasMoreDataFlag: true
                })
                _this.data.page = page + 1
            }
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