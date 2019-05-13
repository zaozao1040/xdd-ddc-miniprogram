var t = require("../../../comm/script/helper")
import { mine } from '../mine-model.js'
import { phone } from './phone-model.js'
let mineModel = new mine()
let phoneModel = new phone()

import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        timer: null,
        canClick: true,
        loading: false,
        phone: '',
        code: '',
        firstCode: true,
        waitTime: -1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {
        if (this.data.timer) {
            clearTimeout(this.data.timer)
        }
    },
    phoneInput: function(e) {
        this.setData({
            phone: e.detail.value
        });
    },
    codeInput: function(e) {
        this.setData({
            code: e.detail.value
        });
    },
    sendCode: function() {
        let _this = this
        if (t._validCellPhone(_this.data.phone)) {
            //获取短信验证码
            let param = {
                url: '/login/smsCode?phoneNumber=' + _this.data.phone + '&smsType=2'
            }
            requestModel.request(param, () => {

                wx.showToast({
                    title: '发送成功',
                    image: '../../../images/msg/success.png',
                    duration: 2000
                })
                _this.setData({
                    firstCode: false
                })
                let countdown = 60
                for (var i = 60; i >= 0; i--) {
                    setTimeout(function() {
                        _this.setData({
                            waitTime: countdown
                        })
                        countdown--
                    }, 1000 * i)
                }

            })
        } else {
            wx.showToast({
                title: "手机必须11位数字",
                image: '../../../images/msg/error.png',
                duration: 2000
            })
        }
    },
    changePhone: function() {
        let _this = this
        if (t._validCellPhone(_this.data.phone)) {
            if (_this.data.code == '') {
                wx.showToast({
                    title: "请输入验证码",
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
            } else {
                wx.login({
                    success: function(res) {
                        if (res.code) {
                            let param = {
                                userCode: wx.getStorageSync('userCode'),
                                smsCode: _this.data.code, //短信验证码
                                phoneNumber: _this.data.phone
                            }

                            let params = {
                                data: param,
                                url: '/user/changeUserPhoneNumber',
                                method: 'post'
                            }

                            requestModel.request(params, () => {

                                // 刷新userInfo
                                requestModel.getUserInfo(() => {

                                }, true)
                                setTimeout(function() { //提示修改手机号成功，两秒后跳转到’我的‘
                                    wx.switchTab({
                                        url: '/pages/mine/mine',
                                    })
                                    wx.hideLoading() //【防止狂点3】
                                    wx.showToast({
                                        title: '手机更换成功',
                                        image: '../../../images/msg/success.png',
                                        duration: 2000
                                    })
                                }, 2000)

                            })
                        }
                    }
                })

            }
        } else {
            wx.showToast({
                title: "手机必须11位数字",
                image: '../../../images/msg/error.png',
                duration: 2000
            })
        }
    },




})