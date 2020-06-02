import { base } from '../../comm/public/request'

let requestModel = new base()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        detailInfo: null,

        payStatusMap: {
            THIRD_PAYED: '第三方支付',
            NO_PAYED: '未支付',
            STANDARD_PAYED: '标准支付'
        },
        payTypeMap: {
            ALI_PAY: '支付宝支付',
            WECHAT_PAY: '微信支付',
            BALANCE_PAY: '钱包支付',
            STANDARD_PAY: '标准支付'
        },
        mealTypeMap: {
            BREAKFAST: '早餐',
            LUNCH: '午餐',
            DINNER: '晚餐',
            NIGHT: '夜宵'
        },
        getdataalready: false
    },
    //获取服务电话
    getPhoneNumber() {
        let _this = this
        let param = {
            url: '/help/getHelp'
        }
        requestModel.request(param, data => {
            _this.setData({
                showPhoneModal: true,
                servicePhone: data.contactPhone
            })
        })
    },
    closePhoneModal() {
        this.setData({
            showPhoneModal: false
        })
    },

    handleContact() {
        let _this = this
        wx.makePhoneCall({
            phoneNumber: _this.data.servicePhone
        })

        _this.setData({
            showPhoneModal: false
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let _this = this
        requestModel.getUserCode(userCode => {


            let param = {
                url: '/order/getOrderDetail?userCode=' + userCode + '&orderCode=' + options.orderCode
            }
            requestModel.request(param, data => {
                data.mealTypeDes = _this.data.mealTypeMap[data.mealType] //日期
                data.orderStatusDes = _this.getOrderStatus(data) //状态
                data.deduction = parseFloat((parseFloat(data.totalPrice) - parseFloat(data.payPrice)).toFixed(2))

                if (data.pickStatus == 1) { //待取餐
                    //取餐时间
                    if (data.orderFoodList[0].takeMealStartTime && data.orderFoodList[0].takeMealEndTime) {


                        let starts = data.orderFoodList[0].takeMealStartTime.split(' ')
                        let sd = starts[0].split('-')
                        let st = starts[1].split(':')
                        let ends = data.orderFoodList[0].takeMealEndTime.split(' ')
                        let ed = ends[0].split('-')
                        let et = ends[1].split(':')
                        data.pickTimeDes = sd[1] + '-' + sd[2] + ' ' + st[0] + ':' + st[1] + '至' + ed[1] + '-' + ed[2] + ' ' + et[0] + ':' + et[1]
                    } else {
                        data.pickTimeDes = data.mealDate
                    }
                }

                //绑箱绑柜信息
                let boxes = []
                let cabinets = []
                data.orderFoodList.forEach(item => {
                    if (item.boxNumber && item.boxNumber.length > 0) {
                        item.boxNumber.forEach(bb => {
                            if (!boxes.includes(bb)) {
                                boxes.push(bb)
                            }
                        })
                    }
                    if (item.cabinet && item.cabinet.length > 0) {
                        item.cabinet.forEach(cc => {
                            let a = cc.cabinetNumber + '-' + cc.cellNumber
                            if (!cabinets.includes(a)) {
                                cabinets.push(a)
                            }
                        })
                    }
                })

                if (boxes.length > 0) {
                    data.boxes = boxes
                } else {
                    data.boxes = '未查询到绑箱信息'
                }
                if (cabinets.length > 0) {

                    data.cabinets = cabinets
                } else {
                    data.cabinets = '未查询到绑柜信息'
                }

                if (data.isPay) { //已支付，判断支付方式
                    if (data.payMethod == 2 || data.payMethod == 3) {
                        if (data.defrayType == 1) {
                            data.payTypeDes = '钱包支付'
                            data.showPayWay = true
                        } else if (data.defrayType == 2) {
                            data.payTypeDes = '微信支付'
                        }
                        // else if (data.defrayType == 4) {
                        //     data.payTypeDes = '积分支付'
                        // } 
                        else {
                            data.payTypeDes = '标准支付'
                        }
                    } else if (data.payMethod == 1) {
                        data.payTypeDes = '标准支付'
                    }
                } else {
                    data.payTypeDes = '未支付'
                }


                _this.setData({
                    detailInfo: data,
                    getdataalready: true
                })

                console.log('detailInfo', data)

                //获取windowHeight
                wx.getSystemInfo({
                    success: function (res) {
                        _this.setData({
                            windowHeight: res.windowHeight,
                            wrapperHeight: res.windowHeight
                        })
                    }
                })
                //计算最外层view的bottom
                const query = wx.createSelectorQuery()
                query.select('.wrapper').boundingClientRect()
                query.selectViewport().scrollOffset()
                query.exec(function (res) {
                    if (res[0]) {
                        _this.setData({
                            wrapperHeight: res[0].bottom
                        })
                    }

                })
            })
        })
    },

    //获取订单状态
    getOrderStatus(element) {
        let a = ''
        if (element.status == 1) {
            if (element.isPay == 0) {
                a = '订单未支付'

            } else {
                a = '订单已支付'
            }
        } else if (element.status == 2) {
            if (element.confirmStatus == 2) {
                if (element.evaluateStatus == 1) {
                    a = '待评价'
                } else if (element.pickStatus == 1) {
                    a = '待取餐'

                } else if (element.deliveryStatus == 1) {
                    a = '待配送'
                } else if (element.deliveryStatus == 2) {
                    a = '配送中'

                } else {
                    a = '制作中'
                }
            } else {
                a = '订单已支付'
            }

        } else if (element.status == 3) {
            a = '订单已完成'
        } else {
            a = '订单已取消'
        }
        return a
    },
    //复制订单编号
    handleCopy() {
        let orderCode = this.data.detailInfo.orderCode
        wx.setClipboardData({
            data: orderCode,
            success(res) {
                wx.getClipboardData({
                    success(res) {
                        console.log(res.data) // data
                    }
                })
            }
        })
    },
    // 处理最外层的滚动，使
    handleMostOuterScroll(e) {
        let _this = this
        if (e.detail.scrollTop >= 28) { //大于等于40就显示
            wx.setNavigationBarTitle({
                title: _this.data.detailInfo.orderStatusDes
            })
        } else {
            wx.setNavigationBarTitle({
                title: ''
            })
        }
    },
    gotoMyComment() {
        let _this = this
        wx.navigateTo({
            url: './myComment/myComment?orderCode=' + _this.data.detailInfo.orderCode
        })
    },
    handleGotoQrcode(e) {
        wx.navigateTo({
            url: './qrCode/qrCode?orderCode=' + e.currentTarget.dataset.orderCode
        })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})