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


            let tmpData = data
            tmpData.mealTypeDes = _this.data.mealTypeMap[data.mealType] //日期
            tmpData.orderStatusDes = _this.getOrderStatus(data) //状态
            tmpData.payStatusDes = _this.data.payStatusMap[data.payStatus]
            tmpData.payTypeDes = _this.data.payTypeMap[data.payType]
            tmpData.payTimeDes = data.payTime ? moment(data.payTime).format('YYYY-MM-DD HH:mm:ss') : data.payTime
            tmpData.pickTimeDes = data.pickTime ? moment(data.pickTime).format('YYYY-MM-DD HH:mm:ss') : data.pickTime
            tmpData.orderTimeDes = data.orderTime ? moment(data.orderTime).format('YYYY-MM-DD HH:mm:ss') : data.orderTime
            tmpData.mealDateDes = data.mealDate ? moment(data.mealDate).format('MM月DD日') : data.mealDate
            tmpData.takeMealEndTimeDes = data.takeMealEndTime ? moment(data.takeMealEndTime).format('MM月DD日HH:mm') : data.takeMealEndTime
            tmpData.takeMealStartTimeDes = data.takeMealStartTime ? moment(data.takeMealStartTime).format('MM月DD日HH:mm') : data.takeMealStartTime

            _this.setData({
                detailInfo: tmpData
            })

            console.log('detailInfo', tmpData)
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