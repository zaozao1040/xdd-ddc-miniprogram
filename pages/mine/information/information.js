// pages/mine/information/information.js

import { mine } from '../mine-model.js'
let mineModel = new mine()
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

        let tmp_userInfo = wx.getStorageSync('userInfo')
        this.setData({
            userInfo: tmp_userInfo
        })
        console.log('userInfo', tmp_userInfo)
        let _this = this
        wx.getSystemInfo({
            success(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })

            }
        })
    },
    // 注销账户 
    logout: function() {
        wx.removeStorageSync('userInfo')
        wx.removeStorageSync('getWxUserInfo')
        wx.removeStorageSync('tmp_storage')
        wx.reLaunch({
            url: '/pages/home/home',
        })
        wx.showToast({
            title: '注销成功',
            image: '../../images/msg/success.png',
            duration: 2000
        })
    },
    // 如果是企业用户就切换为管理员，如果是管理员就切换为普通用户
    changeRole() {
        let _this = this
        wx.showModal({
            title: '提示',
            content: _this.data.orgAdmin ? '您确定要从企业管理员切换为普通用户吗?' : '您确定要从普通用户切换为企业管理员吗?',
            success(res) {
                if (res.confirm) {
                    let tmp_userInfo = wx.getStorageSync('userInfo')
                    let param = {
                        userCode: tmp_userInfo.userCode
                    }

                    mineModel.changeUserRole(param, (res) => {
                        if (res.code == 0) { //0表示成功 
                            let tmp_orgAdmin = _this.data.orgAdmin
                            tmp_userInfo.orgAdmin = !tmp_orgAdmin
                            wx.setStorageSync('userInfo', tmp_userInfo)
                            _this.setData({
                                orgAdmin: tmp_userInfo.orgAdmin
                            })
                            wx.showToast({
                                title: '切换成功',
                                icon: 'none',
                                duration: 2000
                            })
                        } else {
                            wx.showToast({
                                title: res.msg,
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    })
                }
            }
        })
    },
    // 柜子页面
    gotoCabinetminiProgram() {
        wx.navigateTo({
            url: '/pages/mine/cab/index'
        })
    },
    gotoAddfood() {
        wx.navigateTo({
            url: '/pages/mine/orgAdminAddfood/orgAdminAddfood'
        })
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