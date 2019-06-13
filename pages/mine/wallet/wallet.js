import { wallet } from './wallet-model.js'
let walletModel = new wallet()

import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        //分页
        page: 1, // 设置加载的第几次，默认是第一次
        limit: 20, // 每页条数
        hasMoreDataFlag: true, //是否还有更多数据  默认还有
        //
        canRechargeFlag: true, //充值通道开启状态，默认开启
        //
        windowHeight: 0,
        scrollTop: 0,

        itemStatusActiveFlag: true,

        moneyList: [],
        activeFlag1: undefined,
        activeFlag2: undefined,
        selectedMoney: 0,
        explainDes: {
            one: '充值金额暂不支持跨平台使用，暂不支持退款、提现、转赠他人',
            two: '若充值遇到问题请联系1855748732',
            three: '若充值遇到问题请联系1855748732',
        },
        rechargeList: [],
        rechargeListNoResult: false,

    },
    initWallet: function() {
        let _this = this

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
        let _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        if (options.balance) {
            this.setData({
                balance: options.balance
            })
        } else {
            let param = {
                url: '/user/getUserFinance?userCode=' + wx.getStorageSync('userCode')
            }
            requestModel.request(param, data => {
                this.setData({
                    balance: data.balance
                })
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

        this.getGiftList()
    },

    /* 获取充多少送多少的list */
    getGiftList: function() {
        let _this = this
        let param = {
                url: '/organize/getOrganizeRechargeActivity?userCode=' + wx.getStorageSync('userCode')
            }
            //请求充值返送列表
        requestModel.request(param, (data) => {
            _this.setData({
                canRechargeFlag: data.recharge
            })
            if (data.recharge) { //该企业可以充值
                let list = data.rechargeActivityList
                let tmp_1 = []
                tmp_1.push(list[0])
                tmp_1.push(list[1])
                tmp_1.push(list[2])
                let tmp_2 = []
                tmp_2.push(list[3])
                tmp_2.push(list[4])
                tmp_2.push(list[5])
                let tmp_moneyList = []
                tmp_moneyList.push(tmp_1)
                tmp_moneyList.push(tmp_2)
                _this.setData({
                    moneyList: tmp_moneyList
                })
            } else {
                _this.setData({
                    itemStatusActiveFlag: false
                })
                _this.getRechargeList()
            }
        })
    },
    /* 手动点击触发下一页 */
    gotoNextPage: function() {
        if (this.data.hasMoreDataFlag) {
            this.getRechargeList()
        }
    },
    changeItemStatusActiveFlag: function(e) {
        let flag = e.currentTarget.dataset.flag
        if (flag == 'chongzhi') {
            this.setData({
                itemStatusActiveFlag: true
            })
        } else if (flag == 'jiaoyi') {
            // 每次点击，展示前20条
            this.data.page = 1
            this.data.limit = 20
            this.setData({
                itemStatusActiveFlag: false,
                rechargeList: [],
                hasMoreDataFlag: true,
            })
            this.initWallet()
            this.getRechargeList()
        }
    },
    /* 获取交易记录列表 */
    getRechargeList: function() {
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
    /* click更改选中的金额 */
    changeMoneyActiveFlag: function(e) {
        this.setData({
            activeFlag1: e.currentTarget.dataset.activeflag1
        })
        this.setData({
            activeFlag2: e.currentTarget.dataset.activeflag2
        })
        this.setData({
            selectedMoney: e.currentTarget.dataset.selectedmoney
        })
    },
    /* 立即充值 */
    handleRecharge: function() {
        let _this = this
        console.log(this.data.selectedMoney)
        if (_this.data.selectedMoney == 0) {
            wx.showToast({
                title: "请选择充值金额",
                icon: "none",
                duration: 2000
            })
        } else {

            let param = {
                userCode: wx.getStorageSync('userCode'),
                rechargeAmount: _this.data.selectedMoney
            }
            let params = {
                data: param,
                url: '/user/userRecharge',
                method: 'post'
            }
            requestModel.request(params, (resdata) => {
                if (resdata.needPay) {
                    let data = resdata.payData

                    if (data.timeStamp) {
                        wx.requestPayment({
                            'timeStamp': data.timeStamp.toString(),
                            'nonceStr': data.nonceStr,
                            'package': data.packageValue,
                            'signType': data.signType,
                            'paySign': data.paySign,
                            success: function(e) {
                                //刷新余额
                                let param = {
                                    url: '/user/getUserFinance?userCode=' + wx.getStorageSync('userCode')
                                }
                                requestModel.request(param, data => {
                                    _this.setData({
                                        balance: data.balance
                                    })
                                })
                                wx.showToast({
                                    title: '充值成功',
                                    icon: 'success',
                                    duration: 2000
                                })
                            },
                            fail: function(e) {
                                wx.showToast({
                                    title: '已取消充值',
                                    icon: 'success',
                                    duration: 4000
                                })
                            }
                        })
                    }
                }

            })

        }
    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {

    },
})