import { login } from '../login-model.js'
let loginModel = new login()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showChooseOrganizeFlag: false, //显示开关
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

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (wx.getStorageSync('userInfo')) { //已登录状态，则直接弹出模态框去选择是否绑定企业
            this.chooseBindOrganize()
        }
        wx.checkSession({
            success() {
                console.log('####### session_key 未过期')
                    // session_key 未过期，并且在本生命周期一直有效
                wx.login()
            },
            fail() {
                console.log('@@@@@@@ session_key 已经失效')
                    // session_key 已经失效，需要重新执行登录流程
                wx.login()
            }
        })
    },
    /* 弹出模态框去选择是否绑定企业 */
    chooseBindOrganize: function() {
        wx.showModal({
            title: '是否绑定企业?',
            confirmText: '去绑定',
            cancelText: '直接登录',
            success(res_1) {
                if (res_1.confirm) { //新用户 - 选择绑定（代表是企业用户），赋值缓存后跳转到登录页面
                    wx.redirectTo({
                        url: '/pages/login/login',
                    })
                } else if (res_1.cancel) { //新用户 - 选择不绑定（代表是普通用户），赋值缓存后直接跳转到home页
                    wx.switchTab({
                        url: '/pages/home/home',
                    })
                }
            }
        })
    },
    getPhoneNumber(e) {
        var _this = this
        console.log('getPhoneNumber--e:', e)

        if (e.detail.iv) { //这个字段存在 代表用户选择了“授权”
            wx.login({ //调用微信login接口，获取code，然后根据code获取是否是新用户
                success: function(res) {
                    console.log('getPhoneNumber--login', res)
                    if (res.code) {
                        let wxCode = res.code
                        let param = {
                            encryptedData: {
                                encryptedData: e.detail.encryptedData,
                                iv: e.detail.iv,
                                code: wxCode //微信code
                            },
                            userInfo: {
                                headImage: wx.getStorageSync('getWxUserInfo').avatarUrl,
                                nickName: wx.getStorageSync('getWxUserInfo').nickName,
                                sex: wx.getStorageSync('getWxUserInfo').gender
                            }
                        }
                        _this.setData({ //【防止狂点1】
                            loading: true
                        })
                        wx.showLoading({ //【防止狂点2】
                            title: '加载中',
                            mask: true
                        })
                        loginModel.login(param, (res) => {
                            console.log('收到请求(登录):', res)
                            wx.hideLoading() //【防止狂点3】
                            if (res.code === 200) {
                                // 
                                wx.setStorageSync('userCode', res.data.userCode)
                                if (res.data.newUser == true) { //新用户 弹出是否绑定企业的模态框
                                    _this.chooseBindOrganize()
                                } else { //老用户 直接进入home页面
                                    wx.switchTab({
                                        url: '/pages/home/home',
                                    })
                                    wx.showToast({
                                        title: '登录成功',
                                        image: '../../../images/msg/success.png',
                                        duration: 2000
                                    })
                                }
                            } else {
                                wx.showToast({
                                    title: res.msg,
                                    icon: 'none',
                                    duration: 2000
                                })
                                _this.setData({
                                    loading: false
                                })
                            }
                        })
                    }
                }
            })
        }
    }
})