import { discount } from './discount-model.js'
let discountModel = new discount()


Page({

    /**
     * 页面的初始数据
     */
    data: {
        //点击
        timer: null,
        canClick: true,
        listCanGet: true,
        //
        windowHeight: 0,
        scrollTop: 0,
        //分页
        page: 1, // 设置加载的第几次，默认是第一次
        limit: 10, // 每页条数
        hasMoreDataFlag: true, //是否还有更多数据  默认还有
        useType: 'USEABLE', //'USEABLE'表示未使用(去除过期的)，1表示已使用，2表示过期 3全部
        //标题
        itemStatusActiveFlag: 'weishiyong',
        //
        discountList: [],
        discountListNoResult: false,
        //
        discountTypeMap: {
            DISCOUNT: '折扣券',
            REDUCTION: '满减券'
        },
        expiredSize: 0,
        useableSize: 0,
        usedSize: 0
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
    /* 页面隐藏后回收定时器指针 */
    onHide: function () {
        if (this.data.timer) {
            clearTimeout(this.data.timer)
        }
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
        const query = wx.createSelectorQuery()
        query.select('.c_scrollPosition_forCalculate').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
            _this.setData({
                scrollTop: res[0].top // #the-id节点的上边界坐标
            })
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

        })
        _this.getDiscountList()
        // let _this = this
        // if (!_this.data.canClick) {
        //     return
        // }
        // _this.data.canClick = false
        // if (_this.data.timer) {
        //     clearTimeout(_this.data.timer)
        // }
        // _this.data.timer = setTimeout(function() {
        //     _this.data.canClick = true
        // }, 500)
        // let tmp_useType = 99
        // if (e.currentTarget.dataset.flag == 'weishiyong') {
        //     tmp_useType = 'USEABLE'
        // } else if (e.currentTarget.dataset.flag == 'yishiyong') {
        //     tmp_useType = 'USED'
        // } else if (e.currentTarget.dataset.flag == 'yiguoqi') {
        //     tmp_useType = 'EXPIRED'
        // }
        // _this.setData({
        //     itemStatusActiveFlag: e.currentTarget.dataset.flag,
        //     discountListNoResult: false,
        //     discountList: [],
        //     useType: tmp_useType,
        // })
        // _this.getDiscountList()
    },
    /* 获取优惠券列表 */
    getDiscountList: function () {
        let _this = this
        if (!_this.data.listCanGet) {
            return
        }
        _this.data.listCanGet = false
        let param = {
            userCode: wx.getStorageSync('userCode'),
            discountStatus: _this.data.useType,
            //discountType: '',  //DISCOUNT 折扣，REDUCTION 满减
            limit: _this.data.limit,
            page: _this.data.page
        }
        wx.showLoading({
            title: '加载中',
        })
        discountModel.getDiscountList(param, (res) => {
            wx.hideLoading()
            if (res.code === 0) {
                //获取已使用，未使用，已过期的个数
                _this.setData({
                    expiredSize: res.data.expiredSize,
                    useableSize: res.data.useableSize,
                    usedSize: res.data.usedSize
                })

                let tmp_discountList = res.data.discounts
                if (tmp_discountList.length > 0) {
                    tmp_discountList.forEach(element => {
                        element.discountTypeDes = _this.data.discountTypeMap[element.discountType]
                        element.endTimeDes = element.endTime
                        element.startTimeDes = element.startTime
                    })
                    //下面开始分页
                    if (tmp_discountList.length < _this.data.limit) {
                        if (tmp_discountList.length === 0) {
                            wx.showToast({
                                image: '/images/msg/warning.png',
                                title: '没有更多数据'
                            })
                            _this.setData({
                                hasMoreDataFlag: false
                            })
                        } else {
                            _this.setData({
                                discountList: _this.data.discountList.concat(tmp_discountList), //concat是拆开数组参数，一个元素一个元素地加进去
                                hasMoreDataFlag: false
                            })
                        }
                    } else {
                        _this.setData({
                            discountList: _this.data.discountList.concat(tmp_discountList), //concat是拆开数组参数，一个元素一个元素地加进去
                            hasMoreDataFlag: true,
                            page: _this.data.page + 1
                        })
                    }
                } else {
                    _this.setData({
                        discountListNoResult: true
                    })
                }
            } else {
                wx.showToast({
                    title: res.msg,
                    image: '/images/msg/error.png',
                    duration: 2000
                })
            }
            _this.data.listCanGet = true
        })
    },
})