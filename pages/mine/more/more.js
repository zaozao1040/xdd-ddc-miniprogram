import {
    more
} from 'more-model.js';
let moreModel = new more();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loadingHidden: true,
        deviceNum: "",
        cabNumInputSigleOpen: "",
        cabNumInputSigleCancel: "",
        cabNumInputSigleHat: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            deviceNum: options.cabNum
        })
    },

    openAllCab: function() {
        let params = {
            deviceNum: this.data.deviceNum
        }
        wx.showModal({
            title: '确认',
            content: '是否确认全部打开',
            success: function(res) {
                if (res.confirm) {
                    moreModel.openAllCab(params, (res) => {
                        if (res == 200) {
                            wx.showToast({
                                title: "已全部打开",
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                        } else {
                            wx.showToast({
                                title: "打开失败",
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                        }
                    })
                }
            }
        })
    },
    cabNumInputSigleOpen: function(e) {
        this.data.cabNumInputSigleOpen = e.detail.value;
    },
    cabNumInputSigleHat: function(e) {
        this.data.cabNumInputSigleHat = e.detail.value;
    },
    cabNumInputSigleCancel: function(e) {
        this.data.cabNumInputSigleCancel = e.detail.value;
    },

    openSigleCab: function() {
        let params = {
            deviceNum: this.data.deviceNum,
            cabinetOrder: this.data.cabNumInputSigleOpen,
        }
        if (params.cabinetOrder == "") {
            wx.showModal({
                title: '提示',
                content: '请选择柜子',
                showCancel: false
            })
            return;
        }
        wx.showModal({
            title: '确认',
            content: '是否确认打开' + params.cabinetOrder + '下的柜子',
            success: function(res) {
                if (res.confirm) {
                    moreModel.openAllCab(params, (res) => {
                        if (res == 200) {
                            wx.showToast({
                                title: "已全部打开",
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                        } else {
                            wx.showToast({
                                title: "打开失败",
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                        }
                    })
                }
            }
        })
    },



    hotOrCancerHot: function(e) {
        let onOff = e.currentTarget.dataset.of;
        let cabinetOrder = "";
        let title = "";
        let content = "";
        if (onOff == "S") {
            title = "加热成功";
            content = "是否确认全部加热";
        }
        if (onOff == "C") {
            title = "取消成功";
            content = "是否确认全部取消加热";
        }
        if (onOff == "SO") {
            cabinetOrder = this.data.cabNumInputSigleHat;
            if (cabinetOrder == "") {
                wx.showModal({
                    title: '提示',
                    content: '请选择柜子',
                    showCancel: false
                })
                return;
            }
            onOff = "S";
            title = "加热成功";
            content = "是否确认" + cabinetOrder + "全部加热";
        }
        if (onOff == "SC") {
            cabinetOrder = this.data.cabNumInputSigleCancel;
            if (cabinetOrder == "") {
                wx.showModal({
                    title: '提示',
                    content: '请选择柜子',
                    showCancel: false
                })
                return;
            }
            onOff = "C";
            title = "取消成功";
            content = "是否确认" + cabinetOrder + "全部取消加热";
        }
        let params = {
            deviceNum: this.data.deviceNum,
            onOff: onOff
        }
        if (cabinetOrder != "") {
            params.cabinetOrder = cabinetOrder;
        }
        wx.showModal({
            title: '确认',
            content: content,
            success: function(res) {
                if (res.confirm) {
                    moreModel.hotOrCancerHot(params, (res) => {
                        if (res.code == 200) {
                            wx.showToast({
                                title: title,
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                        } else {
                            wx.showToast({
                                title: "操作失败",
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                        }
                    })
                }
            }
        })

    },

    cancelOrderSn: function() {
        let that = this;
        this.setData({
            loadingHidden: false,
        })
        wx.scanCode({
            success: function(res) {
                let params = {
                    orderSn: res.result
                }
                moreModel.cancalBindFood(params, (res) => {
                    if (res.code) {
                        wx.showToast({
                            title: res.msg,
                            icon: 'none',
                            duration: 1500,
                            mask: true
                        });
                        that.setData({
                            loadingHidden: true,
                        })
                        return;
                    } else {
                        wx.showToast({
                            title: "发生了一个错误",
                            icon: 'none',
                            duration: 1500,
                            mask: true
                        });
                        that.setData({
                            loadingHidden: true,
                        })
                        return;
                    }
                })
            },
            fail: function() {
                wx.showToast({
                    title: '取消了扫码',
                    icon: 'none',
                    duration: 1500,
                    mask: true
                });
                that.setData({
                    loadingHidden: true,
                })
                return;
            }
        })
    }


})