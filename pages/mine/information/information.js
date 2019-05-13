// pages/mine/information/information.js

import { mine } from '../mine-model.js'
let mineModel = new mine()
import { base } from '../../../comm/public/request'
let requestModel = new base()
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
        let _this = this
        wx.getSystemInfo({
            success(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })

            }
        })
        _this.getUserDetailInfo()
    },
    getUserDetailInfo() {
        let param = {
            url: '/user/getUserDetailInfo?userCode=' + wx.getStorageSync('userCode')
        }
        requestModel.request(param, data => {
            this.setData({
                userInfo: data
            })
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
                    let param = {
                        url: '/user/orgAdminChange',
                        method: 'post',
                        data: {
                            userCode: wx.getStorageSync('userCode')
                        }
                    }

                    requestModel.request(param, () => {
                        _this.data.userInfo.orgAdmin = !_this.data.userInfo.orgAdmin
                        _this.setData({
                            userInfo: _this.data.userInfo
                        })
                        wx.showToast({
                            title: '切换成功',
                            icon: 'none',
                            duration: 2000
                        })
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