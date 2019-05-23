import moment from "../../comm/script/moment"

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
            BALANCE_PAY: '余额支付',
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this

        let param = {
            url: '/order/getOrderDetail?userCode=' + wx.getStorageSync('userCode') + '&orderCode=' + options.orderCode
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

            if (data.isPay) { //已支付，判断支付方式
                if (data.payMethod == 2 || data.payMethod == 3) {
                    if (data.defrayType == 1) {
                        data.payTypeDes = '余额支付'
                    } else if (data.defrayType == 2) {
                        data.payTypeDes = '微信支付'
                    } else if (data.defrayType == 4) {
                        data.payTypeDes = '积分支付'
                    } else {
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
        })

    },
    //获取订单状态
    getOrderStatus(element) {
        if (element.status == 1) {
            if (element.isPay == 0) {
                return '未支付'
            } else {
                return '已支付'
            }
        } else if (element.status == 2) {
            if (element.confirmStatus == 2) {
                if (element.isBox == 1 && element.cabinetStatus == 0 && element.evaluateStatus == 0) {
                    return '待配送'
                } else {
                    if (element.cabinetStatus == 0 && element.evaluateStatus == 0) {
                        return '配送中'
                    } else {
                        if (element.cabinetStatus != 0 && element.pickStatus == 1 && element.evaluateStatus == 0) {
                            return '可取餐'
                        } else {
                            if (element.cabinetStatus != 0 && element.pickStatus == 2 && element.evaluateStatus == 1) {
                                return '待评价'
                            }
                        }
                    }
                }
            }

        } else if (element.status == 3) {
            return '已完成'
        } else {
            return '已取消'
        }
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