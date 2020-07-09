
import { base } from '../../../comm/public/request'
let requestModel = new base()
Component({
    /* 通信数据 */
    properties: {
        detail: {
            type: Object
        }
    },
    data: {
        comment: {},
        showDialog: false,
        TextAreaValue: ''
    },
    lifetimes: {
        ready: function () {

            let weekend = {
                MONDAY: '周一',
                TUESDAY: '周二',
                WEDNESDAY: '周三',
                THURSDAY: '周四',
                SATURDAY: '周六',
                FRIDAY: '周五',
                SUNDAY: '周日'
            }
            let mealType = {
                BREAKFASE: '早餐',
                LUNCH: '午餐',
                DINNER: '晚餐',
                NIGHT: '夜宵'
            }
            let comment = this.data.detail
            let dates = comment.mealDate.split('-')
            comment.dateDes = dates[1] + '月' + dates[2] + '日 (' + weekend[comment.dayOfWeek] + ') ' + mealType[comment.mealType]
            this.setData({
                comment: comment
            })
        },
    },

    methods: {


        // 点击回复
        handleEvaluateReply() {
            this.setData({
                showDialog: true
            })
        },
        bindTextAreaInput(e) {
            if (e.detail.value) {
                this.setData({
                    TextAreaValue: e.detail.value
                })
            }
        },
        // 
        handleCloseDialog() {
            this.setData({
                showDialog: false
            })
        },
        // 
        handleDonothing() {

        },
        // 回复评论
        evaluteReply() {
            let _this = this
            if (_this.data.TextAreaValue) {
                let param = {
                    userCode: wx.getStorageSync('userCode'),
                    orderCode: this.data.comment.orderCode,
                    replyContent: _this.data.TextAreaValue
                }
                let url = '/userEvaluate/orderEvaluateReply'
                let params = {
                    data: param,
                    url,
                    method: 'post'
                }

                requestModel.request(params, (data) => {
                    wx.showToast({
                        title: '回复完成',
                        icon: 'success',
                        duration: 2000
                    })

                    wx.reLaunch({
                        url: '/pages/mine/allComment/allComment'
                    })
                })
            } else {
                wx.showToast({
                    title: '填写回复内容',
                    icon: 'none',
                    duration: 2000
                })
            }
        },

    }


})