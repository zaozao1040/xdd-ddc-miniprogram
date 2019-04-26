import { mine } from './mine-model.js'
let mineModel = new mine()

import {
    cab
} from './cab/cab-model.js';
let cabModel = new cab();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        //
        windowHeight: 0,
        scrollTop: 0,
        //用户信息
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        userInfo: null,
        //
        //labelList:['换绑手机','绑定企业','地址管理','浏览记录','下单闹钟','客户服务','推荐有奖','更多'],
        //labelIconArr: ['shouji1','qiye1','dizhi','zuji','naozhong','kefu','bajiefuli','gengduo'],
        labelList: ['加班餐/补餐', '换绑手机', '绑定企业', '地址管理', '客户服务'],
        labelIconArr: ['canting', 'shouji1', 'qiye1', 'dizhi', 'kefu'],
        navigatorUrl: [
            '/pages/mine/addfood/addfood',
            '/pages/mine/phone/phone',
            '/pages/mine/organize/organize',
            '/pages/mine/address/address',
            '/pages/mine/service/service'
        ],
        //客服电话
        servicePhone: null,
        orgAdmin: false,
        canExchangeOrgAdmin: false,
        cc: 1,
        cabNumList: [] //柜子列表，如果柜子列表为空，就不显示‘打开柜子页面’
    },
    initMine: function() {
        let _this = this

        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        const query = wx.createSelectorQuery()
        query.select('.c_scrollPosition_forCalculate').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
            _this.setData({
                scrollTop: res[0].top // #the-id节点的上边界坐标
            })


        })

    },
    /* 跳转 */
    handleClickLabel: function(e) {
        let _this = this
        let url = _this.data.navigatorUrl[e.currentTarget.dataset.labelindex]
        if (e.currentTarget.dataset.labelitem == '绑定企业') {
            if (wx.getStorageSync('userInfo').bindOrganized == true) {
                wx.showToast({
                    title: '已绑定过企业',
                    image: '../../images/msg/warning.png',
                    duration: 3000
                })
            } else {
                wx.navigateTo({
                    url: url
                })
            }
        } else if (e.currentTarget.dataset.labelitem == '客户服务') {
            //请求客服电话
            let param = {

            }
            wx.showLoading({ //【防止狂点2】
                title: '获取电话中',
                mask: true
            })
            mineModel.getServicePhoneData(param, (res) => {
                if (res.code === 0) {
                    wx.hideLoading()
                    _this.data.servicePhone = res.data.contactPhone
                        /*           _this.setData({
                                    servicePhone: res.data.contactPhone
                                  }) */
                    wx.showModal({
                        title: '是否拨打客户电话?',
                        content: res.data.contactPhone,
                        confirmText: '拨打',
                        cancelText: '返回',
                        success(res) {
                            if (res.confirm) {
                                wx.makePhoneCall({
                                    phoneNumber: _this.data.servicePhone
                                })
                            }
                        }
                    })
                }
            })
        } else {
            wx.navigateTo({
                url: url
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        let _this = this

        let tmp_userInfo = wx.getStorageSync('userInfo')
        _this.setData({
            userInfo: tmp_userInfo,
            orgAdmin: tmp_userInfo.orgAdmin,
            canExchangeOrgAdmin: tmp_userInfo.canExchangeOrgAdmin
        })

        // if (tmp_userInfo.orgAdmin) {
        //     let params = {
        //         //userCode: tmp_userInfo.userCode
        //         userCode: 'USER532153350402080775'
        //     };
        //     cabModel.getDeviceNumByUserCode(params, (res) => {
        //         if (res.status == 'success') {
        //             if (res.data && res.data.length > 0) {
        //                 _this.setData({
        //                     cabNumList: res.data
        //                 })

        //             }
        //         }
        //     });
        // }
        _this.initMine()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

        let _this = this
        if (wx.getStorageSync('refreshUserInfoFlag')) {
            _this.onPullDownRefresh()
            wx.setStorageSync('refreshUserInfoFlag', false)
        } else {
            let tmp_userInfo = wx.getStorageSync('userInfo')
            _this.setData({
                userInfo: tmp_userInfo,
                orgAdmin: tmp_userInfo.orgAdmin,
                canExchangeOrgAdmin: tmp_userInfo.canExchangeOrgAdmin
            })
        }
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

    gotoCabinetminiProgram() {
        // wx.navigateToMiniProgram({
        //     appId: 'wxeab88f3400bf4937',
        //     path: 'pages/cab/index?cabNum=1100010341',
        //     success(res) {
        //         // 打开成功
        //     }
        // })

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
        let _this = this
            //初始化，获取一些必要参数，如高度
            //_this.initMine()
        wx.showNavigationBarLoading();
        wx.login({
            success: function(res) {
                if (res.code) {
                    let param = {
                        code: res.code, //微信code
                        userCode: wx.getStorageSync('userInfo').userCode
                    }
                    wx.showLoading({ //【防止狂点2】
                        title: '加载中',
                        mask: true
                    })

                    mineModel.getMineData(param, (res) => {
                        if (res.code === 0) {
                            wx.setStorageSync('userInfo', res.data) //更新缓存的userInfo
                            _this.setData({
                                userInfo: res.data,
                                orgAdmin: res.data.orgAdmin,
                                canExchangeOrgAdmin: res.data.canExchangeOrgAdmin
                            })
                            wx.hideLoading() //【防止狂点3】
                            wx.hideNavigationBarLoading();
                            wx.stopPullDownRefresh()
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