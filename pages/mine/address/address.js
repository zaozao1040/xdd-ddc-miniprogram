import { address } from './address-model.js'
let addressModel = new address()
import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        timer: null,
        frontPageFlag: null, //代表前一个页面的标志
        scrollTop: 0,
        buttonTop: 0,
        loading: false,
        location: {},
        addressList: [],
        addressDes: '',
        organizeCode: '',
        search: '',
        addressListNoResult: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let tmp_frontPageFlag = options.frontPageFlag
        if (tmp_frontPageFlag) {
            this.setData({
                frontPageFlag: tmp_frontPageFlag
            })
            console.log('oload......', options)
        }

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let _this = this
            //请求地址列表，以便选择后提交
        let param = {
            url: '/organize/getOrganizeDeliveryAddress?userCode=' + wx.getStorageSync('userCode'),
        }
        wx.showLoading({
            title: '地址列表加载中'
        })
        requestModel.request(param, data => {
                wx.hideLoading()
                _this.setData({
                    addressList: data
                })

                if (data.length == 0) {
                    _this.setData({
                        addressListNoResult: true //查到企业列表无结果，则相应视图
                    })
                } else {
                    _this.setData({
                        addressListNoResult: false
                    })
                }
            })
            //请求企业地址列表
            // addressModel.getaddressList(param, (res) => {
            //     console.log('收到请求(地址列表):', res)
            //     wx.hideLoading()
            //     if (res.code === 0) {
            //         _this.setData({
            //             addressList: res.data
            //         })
            //         if (res.data.length == 0) {
            //             _this.setData({
            //                 addressListNoResult: true //查到企业列表无结果，则相应视图
            //             })
            //         } else {
            //             _this.setData({
            //                 addressListNoResult: false
            //             })
            //         }
            //     }
            // })
    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {
        if (this.data.timer) {
            clearTimeout(this.data.timer)
        }
    },

    selectDefaultAddress: function(e) {
        this.setData({
            addressDes: e.currentTarget.dataset.addressdes
        })
        this.data.addressCode = e.currentTarget.dataset.addresscode
    },
    changeDefaultAddress: function() {
        let _this = this
        if (!_this.data.addressCode) {
            wx.showToast({
                title: "请先选择一个地址",
                image: '../../../images/msg/error.png',
                duration: 2000
            })
        } else {

            let param = {
                userCode: wx.getStorageSync('userCode'),
                deliveryAddressCode: _this.data.addressCode
            }

            let params = {
                data: param,
                url: '/user/userSetDefaultAddress',
                method: 'post'
            }
            wx.showLoading({ //【防止狂点2】
                title: '加载中',
                mask: true
            })
            requestModel.request(params, (data) => {
                // 刷新
                requestModel.getUserInfo(() => {}, true)

                if (_this.data.timer) {
                    clearTimeout(_this.data.timer)
                }
                _this.data.timer = setTimeout(function() {
                    if (_this.data.frontPageFlag == 'confirm') {
                        wx.navigateBack({
                            delta: 1, // 回退前 delta(默认为1) 页面
                        })
                    } else {
                        wx.switchTab({
                            url: '/pages/mine/mine',
                        })
                    }
                    wx.hideLoading()
                    wx.showToast({
                        title: '地址选择成功',
                        image: '../../../images/msg/success.png',
                        duration: 2000
                    })
                }, 2000)

            })
        }
    },
})