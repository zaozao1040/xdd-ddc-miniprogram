import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        scrollTop: 0,
        buttonTop: 0,
        location: {},
        organizeList: [],
        organize: '',

        userName: '',
        employeeNumber: '', //是否需要填写企业员工的工号  true需要 false不需要
        usernumber: '', //工号
        organizeCode: '',
        search: '',
        organizeListNoResult: false,
        organizeSelected: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    getBindStatus() {
        let _this = this
        requestModel.getUserInfo(userInfo => {

            let { userName, userType, userStatus, organizeName } = userInfo
            _this.setData({
                userName: userName,
                userType: userType,
                userStatus: userStatus,
                organizeName: organizeName
            })
            // 企业用户
            if (userType == 'B_USER') {
                if (userStatus == 'NORMAL') {
                    _this.setData({
                        bindAlready: true, //已经绑定
                        bindUncheck: false, //审核未通过
                        canBinding: false, //可绑定
                        bindChecking: false //审核中
                    })
                } else if (userStatus == 'NO_CHECK') {
                    _this.setData({
                        bindAlready: false, //已经绑定
                        bindUncheck: false, //审核未通过
                        canBinding: false, //可绑定
                        bindChecking: true //审核中
                    })
                } else if (userStatus == 'CHECK_NO_PASS') {
                    _this.setData({
                        bindAlready: false, //已经绑定
                        bindUncheck: true, //审核未通过
                        canBinding: false, //可绑定
                        bindChecking: false //审核中
                    })
                }
                //超级管理员

            } else if (userType == 'ADMIN') {

                _this.setData({
                    bindAlready: false, //已经绑定
                    bindUncheck: false, //审核未通过
                    canBinding: true, //可绑定
                    bindChecking: false //审核中
                })

                let param = {
                    url: '/organize/organizeSimpleList?userCode=' + _this.data.userCode
                }
                //请求企业列表
                requestModel.request(param, (data) => {
                    _this.setData({
                        organizeList: data
                    })

                })

                _this.initAddress()
            } else if (userType == 'VISITOR') {
                _this.setData({
                    bindAlready: false, //已经绑定
                    bindUncheck: false, //审核未通过
                    canBinding: true, //可绑定
                    bindChecking: false //审核中
                })
                _this.initAddress()
                //企业管理员
            } else if (userType == 'ORG_ADMIN') {
                _this.setData({
                    bindAlready: true, //已经绑定
                    bindUncheck: false, //审核未通过
                    canBinding: false, //可绑定
                    bindChecking: false //审核中
                })
            }
        }, true)
    },
    //再次绑定
    goBindAgain() {
        this.setData({
            bindAlready: false, //已经绑定
            bindUncheck: false, //审核未通过
            canBinding: true, //可绑定
            bindChecking: false //审核中
        })
        this.initAddress()
    },
    onShow: function () {
        let _this = this
        requestModel.getUserCode(userCode => {
            _this.getBindStatus()
            _this.setData({
                userCode: userCode
            })
        })

    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function () { },
    initAddress: function () {
        let _this = this;
        const query = wx.createSelectorQuery()
        query.select('.c_scrollPosition_forCalculate').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function (res) {
            _this.setData({
                scrollTop: res[0].top // #the-id节点的上边界坐标
            })
        })
        const query_1 = wx.createSelectorQuery()
        query_1.select('.c_buttonPosition_forCalculate').boundingClientRect()
        query_1.selectViewport().scrollOffset()
        query_1.exec(function (res) {
            _this.setData({
                buttonTop: res[0].top // #the-id节点的上边界坐标
            })
        })
        console.log('bindChecking', _this.data.bindChecking)
        console.log('canBinding', _this.data.canBinding)
    },
    selectOrganize: function (e) {
        console.log('aaa')
        this.setData({
            organize: e.currentTarget.dataset.organizename,
            employeeNumber: e.currentTarget.dataset.employeenumber,
            organizeList: [],
            organizeSelected: true
        });
        this.data.organizeCode = e.currentTarget.dataset.organizecode

        wx.showToast({
            title: '选择成功',
            image: '/images/msg/success.png',
            duration: 2000
        })

    },
    nameInput: function (e) {
        this.setData({
            userName: e.detail.value
        });
    },
    usernumberInput: function (e) {
        this.setData({
            usernumber: e.detail.value
        });
    },
    organizeInput: function (e) {
        this.setData({
            organize: e.detail.value
        });
    },
    searchInput: function (e) {
        let _this = this
        _this.handleSearchOrganizes(e.detail.value)
    },
    handleSearchOrganizes(organizeName) {

        let _this = this

        if (_this.data.userType == 'ADMIN') {
            let urlp = encodeURI('userCode=' + _this.data.userCode + '&organizeName=' + organizeName)
            let param = {
                url: '/organize/getOrganizeList?' + urlp
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
        } else if (organizeName.length >= 2) {

            let urlP = encodeURI('userCode=' + _this.data.userCode + '&longitude=0&latitude=0&organizeName=' + organizeName)
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
        }
    },
    /* button的绑定企业 */
    changeOrganize: function () {
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
            let param = {
                userCode: _this.data.userCode,
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

                requestModel.getUserInfo((userInfo) => {

                    if (_this.data.userType == 'ADMIN') {
                        _this.setData({
                            bindAlready: true, //已经绑定
                            bindUncheck: false, //审核未通过
                            canBinding: false, //可绑定
                            bindChecking: false //审核中
                        })
                    } else {
                        _this.setData({
                            bindAlready: false, //已经绑定
                            bindUncheck: false, //审核未通过
                            canBinding: false, //可绑定
                            bindChecking: true //审核中
                        })
                        wx.reLaunch({ url: '/pages/home/home' })
                    }
                    _this.setData({
                        organizeName: userInfo.organizeName
                    })
                }, true)
                // 关闭所有页面 ，这里为了容错
                setTimeout(()=>{
                  wx.reLaunch({
                    url: '/pages/home/home',
                  })
                },2000)
            })

        }
    },

    goback() {
        wx.switchTab({
            url: '/pages/mine/mine',
        })
    }
})