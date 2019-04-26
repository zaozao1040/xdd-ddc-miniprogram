import {
    cab
} from 'cab-model.js';
let cabModel = new cab();
let sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
Page({

    /**
     * 页面的初始数据
     */
    data: {
        //tabs: [1, 2, 3, 4, 5, 6],//122
        tabs: [1],
        activeIndex: 0,
        sliderOffset: 0,
        sliderLeft: 0, //tabs结束
        grids: [0, 1, 2, 3, 4, 5, 6, 7, 8],
        cabinetList: [],
        deviceNum: '',
        orderSn: '',
        currentOrdersn: '',
        currentcabinetId: '',
        loadingHidden: false,
        pageone_one: [],
        pageone_two: [],
        pageone_three: [],
        pageone_four: [],
        page: 5,
        ee: 0,
        showModal: false,
        radioItems: [],
        cabNumList: [],
        selectDeviceNum: true,
        deviceIndex: 0,
        cabNum: '',
        cabNumListHeight: '300rpx',
        hasCabinet: false
    },
    getSystemInfo: function() {
        let that = this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
                });
            }
        });
    },

    radioChange: function(e) {
        var radioItems = this.data.radioItems;
        for (var i = 0, len = radioItems.length; i < len; ++i) {
            radioItems[i].checked = radioItems[i].goodsId == e.detail.value;
        }
        this.setData({
            goodsId: e.detail.value,
            radioItems: radioItems
        });
    },
    tabClick: function(e) {
        this.setData({
            // sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id,
            pageone_one: [],
            pageone_two: [],
            pageone_three: [],
            pageone_four: [],
        });
        this.getGrid(this.data.cabNum);
    },
    pageNum: function() {
        let activeIndex = this.data.activeIndex;
        let letter = '';
        switch (activeIndex) {
            case 0:
            case "0":
                letter = "A";
                break;
            case 1:
            case "1":
                letter = "B";
                break;
            case 2:
            case "2":
                letter = "C";
                break;
            case 3:
            case "3":
                letter = "D";
                break;
            case 4:
            case "4":
                letter = "E";
                break;
            case 5:
            case "5":
                letter = "F";
                break;
            case 6:
            case "6":
                letter = "G";
                break;
            case 7:
            case "7":
                letter = "H";
                break;
            default:
                "A"
        }
        return letter;
    },

    goMore: function() {
        let devNum = this.data.cabNum
        wx.navigateTo({
            url: '/pages/mine/more/more?cabNum=' + devNum,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        // let tmp_cabNumList = wx.getStorageSync('cabNumList')
        // this.setData({
        //     cabNumList: tmp_cabNumList,
        //     cabNum: tmp_cabNumList[0]
        // })
        // if (tmp_cabNumList.length < 6) {
        //     this.setData({
        //         cabNumListHeight: tmp_cabNumList.length * '50rpx'
        //     })
        // }
        //this.getSystemInfo();
    },

    clickDevice() {
        var selectDeviceNum = this.data.selectDeviceNum;
        this.setData({
            selectDeviceNum: !selectDeviceNum
        })
    },
    toUser: function(order_sn) {
        let params = {
            order_sn: order_sn,
            form_id: 123
        };
        cabModel.sendTemplate(params, (res) => {
            // console.log(res);
        });
    },
    /**
     * 当状态为2的时候，提示更多操作
     */
    open: function(cabinetNum, id) {
        let that = this;
        let deviceNum = this.data.deviceNum;
        wx.showActionSheet({
            itemList: ['开柜', '加热', '取消加热', '取餐'],
            itemColor: "#007500",
            success: function(res) {
                if (!res.cancel) {
                    let tapIndex = res.tapIndex;
                    switch (tapIndex) {
                        case 0:
                            that.actionOpenCab(deviceNum, cabinetNum);
                            break;
                        case 1:
                            that.addHot(deviceNum, cabinetNum);
                            break;
                        case 2:
                            that.cancalHot(deviceNum, cabinetNum);
                            break;
                        case 3:
                            that.takeMeal(deviceNum, id);
                            break;
                    }
                }
            }
        });
    },

    actionOpenCab: function(deviceNum, cabinetNum) {
        let params = {
            cabinetNum: cabinetNum,
            deviceNum: deviceNum
        };
        cabModel.actionOpenCab(params, (res) => {
            if (res == 200) {
                wx.showToast({
                    title: '开柜成功',
                    icon: "none",
                    duration: 1000,
                })
            }
        })
    },

    addHot: function(deviceNum, cabinetNum) {
        let params = {
            cabinetNum: cabinetNum,
            deviceNum: deviceNum
        };
        cabModel.addHot(params, (res) => {
            if (res == 200) {
                wx.showToast({
                    title: '加热成功',
                    icon: "none",
                    duration: 1000,
                })
            }
        })
    },

    cancalHot: function(deviceNum, cabinetNum) {
        let params = {
            cabinetNum: cabinetNum,
            deviceNum: deviceNum
        };
        cabModel.cancalHot(params, (res) => {
            if (res == 200) {
                wx.showToast({
                    title: '已取消加热',
                    icon: "none",
                    duration: 1000,
                })
            }
        })
    },

    takeMeal: function(deviceNum, id) {
        let that = this;
        let user = wx.getStorageSync("userInfo_b");
        let params = {
            cabinetId: id,
            deliveryId: user.deliveryId
        }
        cabModel.takeMeal(params, (res) => {
            if (res.code == 200) {
                wx.showToast({
                    title: res.msg,
                    icon: "none",
                    duration: 1000,
                })
                that.onShowNew();
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: "none",
                    duration: 1000,
                })
            }
        })
    },

    /**
     * 开柜
     */
    openCab: function(e) {
        this.setData({
            loadingHidden: false
        })
        let that = this;
        let ee = this.data.ee;
        if (this.data.ee == 1) {
            this.setData({
                loadingHidden: true
            })
            return;
        }
        this.setData({
            ee: 1
        })
        setTimeout(() => {
            that.setData({
                ee: 0
            });
        }, 1000);
        let cabinetNum = e.currentTarget.dataset.cabinetNum;
        let id = e.currentTarget.dataset.id;
        let cabNums = e.currentTarget.dataset.cabNum;
        if (cabNums != 1 && cabNums != 2) {
            wx.showToast({
                title: '柜子故障',
                icon: "none"
            })
            that.setData({
                loadingHidden: true
            })
            return;
        }
        if (cabNums == 2) {
            that.setData({
                loadingHidden: true,
            })
            this.open(cabinetNum, id);
            return;
        }
        let params = {
            cabinetNum: cabinetNum,
            deviceNum: that.data.deviceNum
        }
        that.setData({
            currentcabinetId: id
        })
        cabModel.openCab(params, (res) => {
            if (res = 200) {
                wx.scanCode({
                    success: function(orderSnRes) {
                        let orderSn = orderSnRes.result;
                        if (orderSn.charAt(0) != 'D') {
                            wx.showToast({
                                title: '非法订单号',
                                icon: 'none',
                                duration: 1500,
                                mask: true
                            });
                            that.setData({
                                loadingHidden: true,
                            })
                            return;
                        }
                        that.setData({
                            currentOrdersn: orderSn,
                        })
                        let bindParams = {
                            orderSn: orderSn,
                            cabinetId: id
                        }
                        cabModel.bindFood(bindParams, (bindFoodOrginRes) => {
                            let bindFoodRes = bindFoodOrginRes.code;
                            if (bindFoodRes === 200) {
                                that.toUser(orderSn)
                                that.setData({
                                    loadingHidden: true,
                                })
                                wx.showToast({
                                    title: bindFoodOrginRes.msg,
                                    icon: 'none',
                                    duration: 2000,
                                    mask: true
                                });
                                that.onShowNew();
                            } else if (bindFoodRes === 20000) {
                                that.setData({
                                    radioItems: bindFoodOrginRes.data,
                                    showModal: true,
                                    loadingHidden: true,
                                })
                                console.log(bindFoodRes);
                                console.log(bindFoodOrginRes.data);
                            } else {
                                wx.showToast({
                                    title: bindFoodOrginRes.msg,
                                    icon: 'none',
                                    duration: 1500,
                                    mask: true
                                });
                                that.setData({
                                    loadingHidden: true
                                })
                                return;
                            }
                        })
                    }
                })
            } else {
                wx.showToast({
                    title: '开柜失败',
                    icon: 'none',
                    duration: 2000,
                    mask: true
                });
            }
        })
    },

    onCancel: function() {
        this.setData({
            showModal: false,
        })
    },

    openCabByChoose: function(e) {
        let that = this;
        let cabinetId = e.currentTarget.dataset.cabinetId;
        let id = e.currentTarget.dataset.id;
        let deviceNum = this.data.deviceNum;
        let params = {
            cabinetNum: cabinetId,
            deviceNum: deviceNum
        };
        cabModel.actionOpenCab(params, (res) => {
            if (res == 200) {
                wx.showToast({
                    title: '开柜成功',
                    icon: "none",
                    duration: 1000,
                })
            } else {
                wx.showToast({
                    title: '开柜失败',
                    icon: "none",
                    duration: 1000,
                })
            }
            that.setData({
                showModal: false,
            })
        })
    },

    onConfirm: function() {
        let that = this;
        let orderSn = this.data.currentOrdersn;
        let currentcabinetId = this.data.currentcabinetId;
        let deviceNum = this.data.deviceNum;
        let params = {
            cabinetNum: currentcabinetId,
            deviceNum: deviceNum
        };
        cabModel.openCab(params, (res) => {
            if (res = 200) {
                let bindParams = {
                    orderSn: orderSn,
                    cabinetId: currentcabinetId,
                    bindOther: "yes"
                }
                cabModel.bindFood(bindParams, (bindFoodOrginRes) => {
                    let bindFoodRes = bindFoodOrginRes.code;
                    if (bindFoodRes === 200) {
                        that.toUser(orderSn)
                        that.setData({
                            loadingHidden: true,
                            showModal: false,
                        })
                        wx.showToast({
                            title: bindFoodOrginRes.msg,
                            icon: 'none',
                            duration: 2000,
                            mask: true
                        });
                        that.onShowNew();
                    } else if (bindFoodRes === 20000) {
                        that.setData({
                            radioItems: bindFoodOrginRes.data,
                            showModal: true,
                            loadingHidden: true,
                        })

                    } else {
                        wx.showToast({
                            title: '未知错误',
                            icon: 'none',
                            duration: 1500,
                            mask: true
                        });
                        that.setData({
                            loadingHidden: true
                        })
                        return;
                    }
                })
            } else {
                wx.showToast({
                    title: '开柜失败',
                    icon: 'none',
                    duration: 2000,
                    mask: true
                });
            }
        })
    },




    /**
     * 获取柜子信息
     */
    getGrid: function(dev) {
        let currentPage = this.pageNum();
        let params = {
            deviceNum: dev,
            cabinetOrder: currentPage,
            orderNum: parseInt(this.data.activeIndex) + 1
        }
        cabModel.getGrids(params, (res) => {
            let cabinetList = res.cabinetList;
            let cabinetLists = this.getGrideStatus(cabinetList);
            if (cabinetLists == undefined) {
                return;
            }
            let pageone_one = [],
                pageone_two = [],
                pageone_three = [],
                pageone_four = [];
            // 第一页
            for (let i = 0; i < 9; i++) {
                if (cabinetLists[i] == undefined) {
                    break;
                }
                pageone_one.push(cabinetLists[i]);
            }
            for (let i = 9; i < 18; i++) {
                if (cabinetLists[i] == undefined) {
                    break;
                }
                pageone_two.push(cabinetLists[i]);
            }
            for (let i = 18; i < 27; i++) {
                if (cabinetLists[i] == undefined) {
                    break;
                }
                pageone_three.push(cabinetLists[i]);
            }
            for (let i = 27; i < 36; i++) {
                if (cabinetLists[i] == undefined) {
                    break;
                }
                pageone_four.push(cabinetLists[i]);
            }
            let tmp_cascadeNum = res.cascadeNum
            let tmp_tabs = []
            while (tmp_cascadeNum > 0) {
                tmp_tabs.unshift(tmp_cascadeNum--)
            }
            console.log('tabs=', tmp_tabs)
            this.setData({
                cabinetList: cabinetList,
                pageone_one: pageone_one,
                pageone_two: pageone_two,
                pageone_three: pageone_three,
                pageone_four: pageone_four,
                deviceNum: dev,
                loadingHidden: true,
                tabs: tmp_tabs
            })
        })
    },

    /**
     * cabinetNumStatus 1
     * 0 表示该锁地址没有连接锁
     * 1 表示该锁地址上的锁已关闭
     * 2 表示已存
     * 3 表示该锁地址上的锁已打开
     * 4 控制板连接超时(一般硬件有问题出现)
     * 6 目前有物品，只能借/取
     * 7 目前没物品，只能还/存
     * 12 指令超时无效
     * 14 不支持该功能指令
     * 15 终端忙，无效
     */
    getGrideStatus: function(cabinetList) {
        if (cabinetList == undefined) {
            return;
        }
        for (let i = 0; i < cabinetList.length; i++) {
            switch (cabinetList[i].cabinetNumStatus) {
                case '0':
                    cabinetList[i].cabinetNumStatusName = '没有连接锁';
                    cabinetList[i].style = 'status_error';
                    break;
                case '1':
                    cabinetList[i].cabinetNumStatusName = '未存餐';
                    cabinetList[i].style = '';
                    break;
                case '2':
                    cabinetList[i].cabinetNumStatusName = '已存餐';
                    cabinetList[i].style = 'status_ok';
                    break;
                case '3':
                    cabinetList[i].cabinetNumStatusName = '锁已打开';
                    cabinetList[i].style = '';
                    break;
                case '4':
                    cabinetList[i].cabinetNumStatusName = '故障';
                    cabinetList[i].style = 'status_error';
                    break;
                case '6':
                    cabinetList[i].cabinetNumStatusName = '目前有物品';
                    cabinetList[i].style = '';
                    break;
                case '7':
                    cabinetList[i].cabinetNumStatusName = '目前没物品';
                    cabinetList[i].style = '';
                    break;
                case '12':
                    cabinetList[i].cabinetNumStatusName = '指令超时';
                    cabinetList[i].style = 'status_error';
                    break;
                case '14':
                    cabinetList[i].cabinetNumStatusName = '不支持的指令';
                    cabinetList[i].style = 'status_warn';
                    break;
                case '15':
                    cabinetList[i].cabinetNumStatusName = '显示屏';
                    cabinetList[i].style = 'status_warn';
                    break;
                default:
                    cabinetList[i].cabinetNumStatusName = '显示屏';
                    break;
            }
        }
        return cabinetList;
    },

    //1.未存餐



    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let _this = this

        let params = {
            userCode: wx.getStorageSync('userInfo').userCode
                //userCode: 'USER532153350460801101'
        };
        cabModel.getDeviceNumByUserCode(params, (res) => {
            if (res.status == 'success') {
                if (res.data && res.data.length > 0) {
                    _this.setData({
                        cabNumList: res.data,
                        cabNum: res.data[0],
                        hasCabinet: true
                    })

                    if (res.data.length < 6) {
                        this.setData({
                            cabNumListHeight: res.data.length * '80rpx'
                        })
                    }
                    _this.getGrid(_this.data.cabNum);
                } else {

                    wx.showToast({
                        title: '贵公司没有安装柜子！',
                        icon: 'none'
                    })
                }
            }
        });
    },
    handleSelectNewDeviceNum(e) {
        console.log(e.currentTarget.dataset)
        let tmp_dataset = e.currentTarget.dataset
        let devicenum = tmp_dataset.devicenum
        let deviceindex = tmp_dataset.deviceindex
        this.setData({
            cabNum: devicenum,
            deviceNum: devicenum,
            deviceIndex: deviceindex,
            selectDeviceNum: true,
            activeIndex: 0
        })
        this.getGrid(this.data.cabNum);
    },
    onShowNew: function() {
        this.getGrid(this.data.cabNum);
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
        this.getGrid(this.data.cabNum)
        wx.stopPullDownRefresh();
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

    },


})