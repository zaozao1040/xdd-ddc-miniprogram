var t = require("../../../comm/script/helper")
import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        phone: '',
        code: '',
        firstCode: true,
        waitTime: -1,
        bindShow: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {},
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
                                _this.setData({
                                        bindShow: true
                                    })
                                    // 刷新userInfo
                                requestModel.getUserInfo(() => {}, true)
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
    goback() {
        wx.switchTab({
            url: '/pages/mine/mine',
        })
    }



})