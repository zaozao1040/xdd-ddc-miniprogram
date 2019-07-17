import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showChooseOrganizeFlag: false, //显示开关
        loginType: 'wxAuthorization',
        bindOrganizeFlag: false, //绑定企业弹框
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },
    //新用户 - 选择绑定（代表是企业用户），赋值缓存后跳转到登录页面
    gotoBind() {
        this.setData({
            bindOrganizeFlag: false
        })

        wx.redirectTo({
            url: '/pages/login/login',
        })
    },
    //新用户 - 选择不绑定（代表是普通用户），赋值缓存后直接跳转到home页
    cancelBind() {
        this.setData({
            bindOrganizeFlag: false
        })
        wx.switchTab({
            url: '/pages/home/home',
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let _this = this
            //已登录状态，则直接弹出模态框去选择是否绑定企业 
        if (wx.getStorageSync('userCode')) {

            _this.setData({
                bindOrganizeFlag: true
            })
        }

        wx.checkSession({
            success() {
                wx.login()
            },
            fail() {
                console.log('####### session_key 已经失效')
                wx.login()
            }
        })

    },
    getPhoneNumber(e) {

        var _this = this
        if (e.detail.iv) { //这个字段存在 代表用户选择了“授权”

            wx.login({ //调用微信login接口，获取code，然后根据code获取是否是新用户
                success: function(res) {
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
                                _this.setData({
                                    bindOrganizeFlag: true
                                })
                            } else { //老用户 直接进入home页面
                                wx.switchTab({
                                    url: '/pages/home/home',
                                })
                                wx.showToast({
                                    title: '登录成功',
                                    image: ' /images/msg/success.png',
                                    duration: 2000
                                })
                            }
                        })
                    }
                }
            })
        }
    },
    // 修改验证方式
    changeValidateType() {
        let tmp_type = this.data.loginType
        if (tmp_type === 'wxAuthorization') {
            this.setData({
                loginType: 'namePwd'
            })
        } else {
            this.setData({
                loginType: 'wxAuthorization'
            })
        }
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
    },
})