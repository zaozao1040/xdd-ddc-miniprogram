import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        scrollTop: 0,
        buttonTop: 0,
        location: {},
        organizeList: [],
        organize: '',
        showNameFlag: '', //这个标志表示选择绑定企业时，展示不展示需要输入姓名
        name: '',
        employeeNumber: '', //是否需要填写企业员工的工号  true需要 false不需要
        usernumber: '', //工号
        organizeCode: '',
        search: '',
        organizeListNoResult: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.initAddress()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let _this = this
        requestModel.getUserInfo(userInfo => {
            _this.setData({
                showNameFlag: userInfo.name
            })
        })

        wx.getLocation({
            type: 'gcj02',
            success: function(res) {
                let param = {
                        url: '/organize/getOrganizeListByLocationNoDefault?userCode=' + wx.getStorageSync('userCode') + '&longitude=' + res.longitude + '&latitude=' + res.latitude
                    }
                    //请求企业列表
                requestModel.request(param, (data) => {
                    _this.setData({
                        organizeList: data
                    })

                })
            }
        })
    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {},
    initAddress: function() {
        let _this = this;
        const query = wx.createSelectorQuery()
        query.select('.c_scrollPosition_forCalculate').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
            _this.setData({
                scrollTop: res[0].top // #the-id节点的上边界坐标
            })
        })
        const query_1 = wx.createSelectorQuery()
        query_1.select('.c_buttonPosition_forCalculate').boundingClientRect()
        query_1.selectViewport().scrollOffset()
        query_1.exec(function(res) {
            _this.setData({
                buttonTop: res[0].top // #the-id节点的上边界坐标
            })
        })
    },
    selectOrganize: function(e) {
        this.setData({
            organize: e.currentTarget.dataset.organizename,
            employeeNumber: e.currentTarget.dataset.employeenumber
        });
        this.data.organizeCode = e.currentTarget.dataset.organizecode
        console.log(this.data.employeeNumber)
        wx.showToast({
            title: '选择成功',
            image: '../../../images/msg/success.png',
            duration: 2000
        })
    },
    nameInput: function(e) {
        this.setData({
            name: e.detail.value
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

        wx.getLocation({
            type: 'gcj02',
            success: function(res) {
                let urlP = encodeURI('userCode=' + wx.getStorageSync('userCode') + '&longitude=' + res.longitude + '&latitude=' + res.latitude + '&organizeName=' + e.detail.value)
                let param = {
                    url: '/organize/getOrganizeListByLocationNoDefault?' + urlP
                }

                //请求企业列表
                requestModel.request(param, (data) => {
                    _this.setData({
                        organizeList: data
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
        })
    },

    /* button的绑定企业 */
    changeOrganize: function() {
        let _this = this
        if ((_this.data.showNameFlag == null) && (_this.data.name == '')) {
            wx.showToast({
                title: "请输入姓名",
                image: '../../../images/msg/error.png',
                duration: 2000
            })
        } else if (_this.data.organize == '') {
            wx.showToast({
                title: "请选择企业",
                image: '../../../images/msg/error.png',
                duration: 2000
            })
        } else if (_this.data.employeeNumber == true && _this.data.usernumber == '') {
            wx.showToast({
                title: "请输入工号",
                image: '../../../images/msg/error.png',
                duration: 2000
            })
        } else {
            let param = {
                userCode: wx.getStorageSync('userCode'),
                userName: _this.data.name,
                organizeCode: _this.data.organizeCode
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
                    image: '../../images/msg/success.png',
                    duration: 2000
                })
            })

        }
    },
})