import { base } from '../../comm/public/request'
let requestModel = new base()
Page({

    data: {
        //
        timer: null,
        canClick: true,
        //
        windowHeight: 0,
        loading: false,
        showAddressFlag: false,
        showGobackFlag: false,
        location: {},
        organizeList: [],
        organize: '',
        employeeNumber: '', //是否需要填写企业员工的工号  true需要 false不需要
        usernumber: '', //工号
        organizeCode: '',
        code: '',
        userName: '',
        /*     target:'', */
        firstCode: true,
        waitTime: -1,
        action: "",
        userInfo: {},
        organizeListNoResult: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let _this = this
        requestModel.getUserInfo(userInfo => {
            _this.setData({
                userName: userInfo.userName,
                userType: userInfo.userType,

            })
        })
    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {},
    initRegister: function() {
        let _this = this;
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
    showAddress: function() {

        this.setData({
            showAddressFlag: true
        })
        this.initRegister()
    },
    closeAddress() {
        this.setData({
            showAddressFlag: false
        })
    },
    changeShowAddressFlag: function() {
        this.setData({
            showAddressFlag: !this.data.showAddressFlag
        });
    },
    selectOrganize: function(e) {
        this.setData({
            organize: e.currentTarget.dataset.organizename,
            employeeNumber: e.currentTarget.dataset.employeenumber
        });
        this.data.organizeCode = e.currentTarget.dataset.organizecode
        this.changeShowAddressFlag()
    },
    nameInput: function(e) {
        this.setData({
            userName: e.detail.value
        });
    },
    usernumberInput: function(e) {
        this.setData({
            usernumber: e.detail.value
        });
    },
    organizeInput: function(e) {
        this.setData({
            organize: e.detail.value
        });
    },
    searchInput: function(e) {
        let _this = this
        if (_this.data.userType == 'VISITOR' && e.detail.value.length >= 2) {
            wx.getLocation({
                type: 'gcj02',
                success: function(res) {
                    requestModel.getUserCode(userCode => {
                        let urlP = encodeURI('userCode=' + userCode + '&longitude=' + res.longitude + '&latitude=' + res.latitude + '&organizeName=' + e.detail.value)
                        let param = {
                            url: '/organize/getOrganizeListByLocationNoDefault?' + urlP
                        }

                        //请求企业列表
                        requestModel.request(param, (data) => {
                            _this.setData({
                                employeeNumber: false,
                                organizeList: data,
                                organizeSelected: false,
                                organizeCode: ''
                            })
                            if (data.length == 0) {
                                _this.setData({
                                    organizeListNoResult: true //查到企业列表无结果，则相应视图
                                })
                            } else {
                                _this.setData({
                                    organizeListNoResult: false
                                })
                            }
                        })
                    })

                },
                fail: function() {
                    requestModel.getUserCode(userCode => {
                        let urlP = encodeURI('userCode=' + userCode + '&longitude=1&latitude=1&organizeName=' + e.detail.value)
                        let param = {
                            url: '/organize/getOrganizeListByLocationNoDefault?' + urlP
                        }

                        //请求企业列表
                        requestModel.request(param, (data) => {
                            _this.setData({
                                employeeNumber: false,
                                organizeList: data,
                                organizeSelected: false,
                                organizeCode: ''
                            })
                            if (data.length == 0) {
                                _this.setData({
                                    organizeListNoResult: true //查到企业列表无结果，则相应视图
                                })
                            } else {
                                _this.setData({
                                    organizeListNoResult: false
                                })
                            }
                        })
                    })

                }
            })
        } else if (_this.data.userType == 'ADMIN') {
            requestModel.getUserCode(userCode => {
                let param = {
                        url: '/organize/getOrganizeList?userCode=' + userCode + '&organizeName=' + e.detail.value
                    }
                    //请求企业列表
                requestModel.request(param, (data) => {
                    _this.setData({
                        organizeList: data,
                        employeeNumber: false,
                    })
                    if (data.length == 0) {
                        _this.setData({
                            organizeListNoResult: true //查到企业列表无结果，则相应视图
                        })
                    } else {
                        _this.setData({
                            organizeListNoResult: false
                        })
                    }
                })
            })



        }
    },


    /* 绑定企业 */
    bindOrganize: function() { //点击注册，先获取个人信息，这个是微信小程序的坑，只能通过这个button来实现
        let _this = this
        if (!_this.data.userName) {
            wx.showToast({
                title: "请输入姓名",
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else if (!_this.data.organize || !_this.data.organizeCode) {
            wx.showToast({
                title: "请选择企业",
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else if (_this.data.employeeNumber == true && !_this.data.usernumber) {
            wx.showToast({
                title: "请输入工号",
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else {
            requestModel.getUserCode(userCode => {
                let param = {
                    userCode: userCode,
                    userName: _this.data.userName,
                    organizeCode: _this.data.organizeCode,
                    userOrganizeCode: _this.data.employeeNumber ? _this.data.usernumber : null
                }
                let params = {
                    data: param,
                    url: '/user/bindOrganize',
                    method: 'post'
                }

                requestModel.request(params, () => {

                    requestModel.getUserInfo(() => {}, true)
                    wx.reLaunch({ //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
                        url: '/pages/home/home',
                    })

                    wx.showToast({
                        title: '登录成功',
                        image: '/images/msg/success.png',
                        duration: 2000
                    })
                })
            })

        }
    },


})