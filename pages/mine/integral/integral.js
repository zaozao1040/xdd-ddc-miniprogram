import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        //分页
        page: 1, // 设置加载的第几次，默认是第一次
        limit: 20, // 每页条数
        hasMoreDataFlag: true, //是否还有更多数据  默认还有

        windowHeight: 0,
        scrollTop: 0,
        explainDes: {
            one: '100积分兑换1点餐币,兑换成功后点餐币将存入您的余额',
            two: '积分暂不支持跨平台使用，暂不支持转赠他人'
        },
        explainRulesDes: {
            one: '订单中的自费金额赠送积分,满1元消费赠送1积分',
            two: '订单评价赠送积分,星级送1分,文字赠送5分,上传图片送15分'
        },
        integralList: [],
        integralListNoResult: false,
        operateResult: ''
    },

    initIntegral: function() {
        let _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        const query = wx.createSelectorQuery()
        query.select('.c_scrollPosition_forCalculate').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
            _this.setData({
                scrollTop: res[0].top // #the-id节点的上边界坐标
            })
        })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {


    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

        this.initIntegral()
        this.getUserIntegral()
        this.data.page = 1
        this.data.limit = 20
        this.setData({
            integralList: [] //列表必须清空，否则分页会无限叠加
        })
        this.getIntegralList()

    },

    //获取用户当前积分
    getUserIntegral() {
        let _this = this
        requestModel.getUserCode(userCode => {
            let param = {
                url: '/user/userIntegral?userCode=' + userCode
            }
            requestModel.request(param, data => {
                _this.setData({
                    integral: data.integral,
                    canExchange: data.canExchange,
                    exchangeTotalIntegral: data.exchangeTotalIntegral,
                    exchangeWeekIntegral: data.exchangeWeekIntegral
                })
            })
        })

    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {},

    /* 手动点击触发下一页 */
    gotoNextPage: function() {
        if (this.data.hasMoreDataFlag) {
            this.getIntegralList()
        }
    },

    /* 获取交易记录列表 */
    getIntegralList: function() {
        this.setData({
            loadingData: true
        })
        let _this = this
        let page = _this.data.page
        let limit = _this.data.limit
        requestModel.getUserCode(userCode => {


            let param = {
                url: '/user/getUserIntegralRecord?userCode=' + userCode + '&page=' + page + '&limit=' + limit
            }

            requestModel.request(param, data => {

                let typeMap = {
                    ORDER: '下单送积分',
                    CONSUMPTION: '兑换',
                    CANCEL_ORDER: '取消订单返还积分',
                    EVALUATE: '评价送积分'
                }
                let tmp_integralList = data.list
                tmp_integralList.forEach(element => {

                    element.integral = (element.difference > 0 ? '+' : '') + element.difference

                    element.recordTypeDes = typeMap[element.recordType]
                    element.operateTimeDes = element.operateTime
                })
                if (page == 1) {
                    _this.setData({
                        integralList: tmp_integralList,
                        loadingData: false
                    })
                } else {
                    _this.setData({
                        integralList: _this.data.integralList.concat(tmp_integralList),
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
        })
    },

    handleExchange() {
        if (this.data.integral < 100) {
            this.setData({
                operateResult: 2, //积分不足
            })
        } else if (this.data.exchangeWeekIntegral >= 3) {
            this.setData({
                operateResult: 1, //本周兑换次数超过3次
            })
        } else {
            this.setData({
                operateResult: 3, //可兑换
                exchangeIntegral: parseInt(3 - this.data.exchangeWeekIntegral)
            })
        }
    },
    closeDialog() {
        this.setData({
            operateResult: ''
        })
    },
    handleUserIntegralExchange() {
        let _this = this
        requestModel.getUserCode(userCode => {
            let data = {
                userCode: userCode,
                exchangeIntegral: parseInt(_this.data.exchangeIntegral * 100)
            }
            let param = {
                url: '/user/userIntegralExchange',
                data,
                method: 'post'
            }
            requestModel.request(param, (data) => {

                //刷新
                _this.getUserIntegral()
                _this.data.page = 1
                _this.data.limit = 20
                _this.setData({
                    operateResult: '',
                    integralList: [] //列表必须清空，否则分页会无限叠加
                })
                _this.getIntegralList()

            })
        })

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