var t = require("../../../comm/script/helper")
import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        phone: '',
        code: '',
        firstCode: true,
        waitTime: -1,
        bindShow: false,
        loginType: 'shouji',
        name: '',
        password: '',
        agreeAuthority: true,



    },
    phoneInput: function (e) {
        this.setData({
            phone: e.detail.value
        });
    },
    nameInput: function (e) {
        this.setData({
            name: e.detail.value
        });
    },
    pwdInput: function (e) {
        this.setData({
            password: e.detail.value
        });
    },
    codeInput: function (e) {
        this.setData({
            code: e.detail.value
        });
    },
    changeLoginType(e) {
        let _this = this
        _this.setData({
            loginType: e.currentTarget.dataset.type
        })
    },
    sendCode: function () {
        let _this = this
        if (t._validCellPhone(_this.data.phone)) {
            //获取短信验证码
            let param = {
                url: '/login/smsCode?phoneNumber=' + _this.data.phone + '&smsType=1'
            }
            requestModel.request(param, () => {

                wx.showToast({
                    title: '发送成功',
                    image: '/images/msg/success.png',
                    duration: 2000
                })
                _this.setData({
                    firstCode: false
                })
                let countdown = 60
                for (var i = 60; i >= 0; i--) {
                    setTimeout(function () {
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
                image: '/images/msg/error.png',
                duration: 2000
            })
        }
    },
    loginByPhone: function () {
        let _this = this
        if (t._validCellPhone(_this.data.phone)) {
            if (_this.data.code == '') {
                wx.showToast({
                    title: "请输入验证码",
                    image: '/images/msg/error.png',
                    duration: 2000
                })
            } else {
                wx.login({
                    success: function (res) {
                        if (res.code) {
                            let { avatarUrl, nickName, gender } = wx.getStorageSync('getWxUserInfo')
                            let param = {
                                smsCode: _this.data.code, //短信验证码
                                phoneNumber: _this.data.phone,
                                encryptedData: {
                                    code: res.code
                                },
                                userInfo: {
                                    headImage: avatarUrl,
                                    nickName: nickName,
                                    sex: gender
                                }
                            }
                            let params = {
                                data: param,
                                url: '/login/phoneCodeLogin',
                                method: 'post'
                            }

                            requestModel.request(params, (data) => {
                                wx.setStorageSync('userCode', data.userCode)
                                if (data.newUser == true) { //新用户 弹出是否绑定企业的模态框 TODO 5/14
                                    wx.reLaunch({
                                        url: '/pages/mine/organize/organize',
                                    })
                                } else { //老用户 直接进入home页面
                                    wx.switchTab({
                                        url: '/pages/home/home',
                                    })
                                    wx.showToast({
                                        title: '登录成功',
                                        image: '/images/msg/success.png',
                                        duration: 1000
                                    })
                                }
                            })

                        }
                    }
                })

            }
        } else {
            wx.showToast({
                title: "手机必须11位数字",
                image: '/images/msg/error.png',
                duration: 2000
            })
        }
    },
    changeAuthority() {
        let _this = this
        _this.setData({
            agreeAuthority: !_this.data.agreeAuthority
        })
    },





    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },
    showProtocal() {
        let extendUrl = 'https://www.ddiancan.cn/protocal'
        wx.navigateTo({
            url: '/pages/home/link?extendUrl=' + extendUrl + '&title=用户协议'
        })
    },
    showPrivacy() {
        let extendUrl = 'https://www.ddiancan.cn/privacy'
        wx.navigateTo({
            url: '/pages/home/link?extendUrl=' + extendUrl + '&title=隐私政策'
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
        // let _this = this
        // //已登录状态，则直接弹出模态框去选择是否绑定企业 
        // if (wx.getStorageSync('userCode')) {

        //     _this.setData({
        //         bindOrganizeFlag: true
        //     })
        // }

        // wx.checkSession({
        //     success() {
        //         wx.login()
        //     },
        //     fail() {
        //         console.log('####### session_key 已经失效')
        //         wx.login()
        //     }
        // })

    },
    handleGetPhoneNumber(e) {
        var _this = this
        if (e.detail.iv) { //这个字段存在 代表用户选择了“授权”
            wx.showLoading()
            wx.login({ //调用微信login接口，获取code，然后根据code获取是否是新用户
                success: function (res) {
                    if (res.code) {
                        let wxCode = res.code
                        let { avatarUrl, nickName, gender } = wx.getStorageSync('getWxUserInfo')
                        let param = {
                            encryptedData: {
                                encryptedData: e.detail.encryptedData,
                                iv: e.detail.iv,
                                code: wxCode //微信code
                            },
                            userInfo: {
                                headImage: avatarUrl,
                                nickName: nickName,
                                sex: gender
                            }
                        }

                        let params = {
                            data: param,
                            url: '/login/wechatLogin',
                            method: 'post'
                        }
                        requestModel.request(params, (data) => {
                            wx.setStorageSync('userCode', data.userCode)
                            if (data.newUser == true) { //新用户 弹出是否绑定企业的模态框 TODO 5/14
                                wx.reLaunch({
                                    url: '/pages/mine/organize/organize',
                                })
                            } else { //老用户 直接进入home页面
                                wx.switchTab({
                                    url: '/pages/home/home',
                                })
                                wx.showToast({
                                    title: '登录成功',
                                    image: '/images/msg/success.png',
                                    duration: 1000
                                })
                            }
                        })
                    }

                    wx.hideLoading()
                },
                fail: function () {
                    wx.hideLoading()
                    // wx.showToast({
                    //     title: '手机号失败了',
                    //     image: ' /images/msg/success.png',
                    //     duration: 2000
                    // })
                }
            })
        } else {
            wx.showToast({
                title: '已取消登录',
                image: '/images/msg/warning.png',
                duration: 2000
            })
        }
    },
    // 修改验证方式-手机号验证码
    changeValidateType() {
        wx.navigateTo({ url: '../phone/phone' })
    },
    // 修改验证方式-用户名密码
    changeValidateTypeUserPw() {
        wx.navigateTo({ url: '../userPw/userPw' })
    },
    // 用户名
    bindNameInput(e) {
        this.setData({
            name: e.detail.value
        })
    },
    //密码
    bindPwdInput(e) {
        this.setData({
            password: e.detail.value
        })
    },
    // 用户名密码登录
    loginWithNamePwd() {
        let param = {}
        param.account = this.data.name
        param.password = this.data.password
        let params = {
            url: '/login/accountLogin',
            method: 'post',
            data: param
        }
        requestModel.request(params, (data) => {

            //刷新userInfo 
            wx.setStorageSync('userCode', data.userCode)

            wx.switchTab({
                url: '/pages/home/home',
            })
            wx.showToast({
                title: '登录成功',
                image: '/images/msg/success.png',
                duration: 2000
            })

        })
    }
})