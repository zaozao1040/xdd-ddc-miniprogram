import { base } from '../../../comm/public/request'
let requestModel = new base()


Page({

    /**
     * 页面的初始数据
     */
    data: {
        //
        windowHeight: 0,
        //分页
        page: 1, // 设置加载的第几次，默认是第一次
        limit: 20, // 每页条数
        hasMoreDataFlag: true, //是否还有更多数据  默认还有
        //标题
        itemStatusActiveFlag: 'NOT_USE', // (未使用,已使用,已过期,已作废) NOT_USE/USED/OUT_OF_DATE/CANCELED  
        //
        discountList: [],
        discountListNoResult: false,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

        this.initDiscount()
        this.getDiscountList()
        this.setData({
            page: 1,
            limit: 20,
            discountList: [] //列表必须清空，否则分页会无限叠加
        })
    },

    initDiscount: function () {
        let _this = this
        wx.getSystemInfo({
            success: function (res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
    },
    /* 手动点击触发下一页 */
    gotoNextPage: function () {
        if (this.data.hasMoreDataFlag) {
            this.getDiscountList()
            wx.showLoading({
                title: '点击加载更多',
            })
        } else {
            wx.showToast({
                image: '/images/msg/warning.png',
                title: '没有更多数据'
            })
        }
    },
    changeItemStatusActiveFlag: function (e) {
        this.setData({
            itemStatusActiveFlag: e.currentTarget.dataset.flag,
            page: 1,
            limit: 20,
        }, () => {
            this.getDiscountList()
        })

    },
    /* 获取优惠券列表 */
    getDiscountList: function () {
        let _this = this
        let params = {
            url: '/userDiscount/userDiscountList',
            method: 'get',
            data: {
                userCode: wx.getStorageSync('userCode'),
                discountStatus: _this.data.itemStatusActiveFlag, // (未使用,已使用,已过期,已作废) NOT_USE/USED/OUT_OF_DATE/CANCELED  
                limit: _this.data.limit,
                page: _this.data.page,
            }
        }
        wx.showLoading({
            title: '加载中',
        })
        requestModel.request(params, (res) => {

            wx.hideLoading()

            let tmp_discountList = res.list
            let page = _this.data.page
            let limit = _this.data.limit

            if (tmp_discountList.length > 0) {
                if (page == 1) {
                    _this.setData({
                        discountList: tmp_discountList,
                        discountListNoResult: false
                    })
                } else {
                    _this.setData({
                        discountList: _this.data.discountList.concat(tmp_discountList),
                        discountListNoResult: false
                    })
                }
                //下面开始分页
                if (page * limit >= res.amount) {
                    _this.setData({
                        hasMoreDataFlag: false
                    })

                } else {
                    _this.setData({
                        hasMoreDataFlag: true,
                    })
                }
                console.log('hasMoreDataFlag', _this.data.page, _this.data.limit, page * limit >= res.amount, _this.data.hasMoreDataFlag)
            } else {
                _this.setData({
                    discountList: [],
                    discountListNoResult: true
                })
            }
        })
    },
})