import { home } from '../home/home-model.js'
let homeModel = new home()

import { base } from '../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imageWidth: wx.getSystemInfoSync().windowWidth,
        timer: null,
        canClick: true,
        showDaliFlag: false, //显示新人大礼的标志  默认不显示
        showCheckFlag: false, //显示审核状态框标志 默认不显示
        showUserAuthFlag: false, //显示用户授权框标志 默认不显示
        registered: false,

        imagesList: [],
        //
        homeOrderList: null, //首页取餐列表
        orderStatusMap: {
            NO_PAY: '未支付',
            PAYED_WAITINT_CONFIRM: '已支付',
            CONFIRM_WAITING_MAKE: '待制作',
            MAKING: '开始制作',
            MAKED_WAITING_DELIVERY: '待配送',
            DELIVERING: '配送中',
            DELIVERED_WAITING_PICK: '待取货',
            PICKED_WAITING_EVALUATE: '待评价',
            COMPLETED_EVALUATED: '已评价',
            NO_PICK_WAITING_BACK: '超时未取货待取回',
            USER_CANCEL: '已取消',
            SYSTEM_CANCEL: '系统取消'
        },
        mealTypeMap: {
            BREAKFAST: '早餐',
            LUNCH: '午餐',
            DINNER: '晚餐',
            NIGHT: '夜宵'
        },
        mapMenutypeIconName: {
            BREAKFAST: 'zao',
            LUNCH: 'wu1',
            DINNER: 'night',
            NIGHT: 'shenye'
        },

        //
        showLayerFlag: false, //弹出层（用于优惠券领取），默认不展示
        //
        swiperCurrentIndex: 0, //当前轮播图active的index 

        noticeData: null, //记录公告内容  
        hasNotice: false, //默认没有轮播公告
        showedNoticeData: [], //点击轮播公告时显示的一条公告的内容
        showOneNotice: false, //点击轮播公告时显示公告弹出框
        hasWindowNotice: false, //默认没有window公告
        showWindowNotice: false, //默认不显示window公告
        windowNoticeData: null, // window公告数据
        showMenuSelect: false,
        appointmention: 'today', //预约今天:today 预约明天：tomorrow 预约多天：week

        twoDaysName: ['today', 'tomorrow'],
        twoDaysMealName: ['breakfast', 'lunch', 'dinner', 'night'],
        mealTypeMapSmall: {
            breakfast: '早餐',
            lunch: '午餐',
            dinner: '晚餐',
            night: '夜宵'
        },

        twoDaysInfo: [],
        oneDayInfo: {}

    },
    // 选择今天
    handleSelectToday() {
        this.setData({
            appointmention: 'today',
            oneDayInfo: this.data.twoDaysInfo[0].mealTypeOrder
        })
    },
    handleSelectTomorrow() {
        this.setData({
            appointmention: 'tomorrow',
            oneDayInfo: this.data.twoDaysInfo[1].mealTypeOrder
        })
    },
    handleSelectWeek() {
        this.setData({
            appointmention: 'week'
        })
        wx.navigateTo({
            url: '/pages/menu/menu'
        })
        setTimeout(() => {
            this.setData({
                showMenuSelect: false
            })
            wx.showTabBar()
        }, 1000)

    },
    startOrderMenu(e) {

        let tmp_appointmention = this.data.appointmention
        let tmp_mealtype = e.currentTarget.dataset.mealtype
        wx.navigateTo({
            url: '/pages/menu/today/today?appointment=' + tmp_appointmention + '&mealtype=' + tmp_mealtype
        })

        setTimeout(() => {
            this.setData({
                showMenuSelect: false
            })
            wx.showTabBar() //咋感觉这个没执行呢 5/8
        }, 1000)
    },
    //监听轮播图切换图片，获取图片的下标
    onSwiperChange: function(e) {
        this.setData({
            swiperCurrentIndex: e.detail.current
        })
    },

    handleGotoLabel: function(e) {
        let _this = this
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        setTimeout(function() {
            _this.data.canClick = true
        }, 2000)
        let flag = e.currentTarget.dataset.type
        let url = ''
        if (flag == 'qianbao') {
            url = '/pages/mine/wallet/wallet'
        } else if (flag == 'youhuiquan') {
            url = '/pages/mine/discount/discount'
        } else if (flag == 'jifen') {
            url = '/pages/mine/integral/integral'
        }
        if (wx.getStorageSync('userCode')) {
            requestModel.getUserInfo(userInfo => {
                if (userInfo.userStatus == 'NO_CHECK') {
                    wx.showToast({
                        title: '审核中,请继续尝试',
                        icon: 'none',
                        duration: 2000
                    })
                } else {
                    wx.navigateTo({
                        url: url,
                    })
                }
            }, true)

        } else {
            wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
            })
        }
    },
    //获取首页图片
    initHome: function() {
        let param = {
            url: '/home/getHomeImage?userCode=' + wx.getStorageSync('userCode')
        }
        requestModel.request(param, data => {
            console.log('getHomeImage', data)
            this.setData({
                imagesList: data
            })
        })
    },
    handleGotoMenu: function() {
        let _this = this
        let param = {
            url: '/meal/getPreMealDateAndType?userCode=' + wx.getStorageSync('userCode')
        }
        requestModel.request(param, data => {

            // 处理日期
            let dayInfo = ['今天', '明天', '后天'] //最多也就是后天吧
            let durationInfo = ['凌晨', '上午', '下午', '晚上']

            // 今天的开始时间 如2019-05-15 00:00:00
            let todayBegin = new Date(new Date().toLocaleDateString() + ' 00:00:00').getTime()

            for (let x = 0; x < data.length; x++) {
                let one = data[x].mealTypeOrder
                for (let i = 0; i < _this.data.twoDaysMealName.length; i++) {
                    let meal = _this.data.twoDaysMealName[i]

                    if (one[meal + 'EndTime']) {
                        let deadDate = new Date(one[meal + 'EndTime']) //截止时间
                            // 判断是哪天 
                        let day = parseInt((deadDate.getTime() - todayBegin) / (1000 * 60 * 60 * 24))
                        let hour = deadDate.getHours()
                        let duration = parseInt(hour / 6)
                        let duration_hour = hour > 12 ? hour - 12 : hour

                        let minutes = deadDate.getMinutes()
                        if (minutes == 0) {
                            one[meal + 'deadlineDesc'] = dayInfo[day] + durationInfo[duration] + duration_hour + '点'
                        } else {
                            one[meal + 'deadlineDesc'] = dayInfo[day] + durationInfo[duration] + duration_hour + '点' + minutes + '分'
                        }
                    } else {
                        one[meal + 'deadlineDesc'] = '已截止订餐'
                    }

                }
                data[x].mealTypeOrder = one
            }

            wx.setStorageSync('twoDaysInfo', data)
            _this.setData({
                twoDaysInfo: data,
                showMenuSelect: true,
                appointmention: 'today',
                oneDayInfo: data[0].mealTypeOrder,
            })
            wx.hideTabBar()
        })
    },
    // 关闭选择预约弹框
    closeMenuSelect() {
        wx.showTabBar()
        this.setData({
            showMenuSelect: false
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */

    onLoad: function(options) {
        //首页很重要，这几个非常稳定几乎不变更数据的接口，放在onload，只有首页取餐放在onShow里面
        //wx.removeStorageSync('userCode')
        this.initHome()
        this.getNotice()

        // wx.loadFontFace({
        //     family: 'PingFangSC-Medium',
        //     source: 'url("https://www.your-server.com/PingFangSC-Medium.ttf")',
        //     success: function() { console.log('load font success') }
        // })
        const a = '预想肉丝双拼饭'
        console.log(a, a.length)
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        if (!wx.getStorageSync('userCode')) { //未登录状态，弹出授权框，隐藏底部状态栏
            this.setData({
                showUserAuthFlag: true
            })
            wx.hideTabBar()
        } else { //已登录状态，直接登录
            requestModel.getUserInfo(userInfo => {
                console.log('userInfo', userInfo)
                wx.showTabBar()
                let { userStatus, canTakeDiscount } = userInfo
                if (userStatus == 'NO_CHECK') { //企业用户的'审核中'状态
                    this.setData({
                        showCheckFlag: true
                    })
                    wx.hideTabBar()
                }
                if (canTakeDiscount == true) { //在登录状态下判断用户类型，企业用户的normal状态显示新人大礼，一般用户的登录状态显示新人大礼
                    this.setData({
                        showDaliFlag: true
                    })
                }
                /* 获取首页取餐信息 */
                this.getTakeMealInfo()
            })
        }
    },

    /* 获取公告信息 */
    getNotice() {
        let _this = this
        let url = '/home/getHomeNotice?userCode=' + wx.getStorageSync('userCode')
        let param = {
            url
        }

        requestModel.request(param, data => {
            console.log('getNotice', data)
            if (data && data.length > 0) { //后台是在没有公告的时候返回空数组
                let temp_noticeData = data

                _this.setData({
                    noticeData: temp_noticeData,
                    hasNotice: true
                })

                let window_noticeData = []
                temp_noticeData.forEach(item => {
                    if (item.window) {
                        window_noticeData.push(item)
                    }
                })

                if (window_noticeData.length > 0) {
                    _this.setData({
                            showedNoticeData: window_noticeData,
                            // showOneNotice: true,
                            showOneNotice: false,
                        })
                        // let windowNoticeStorage = wx.getStorageSync("windowNoticeCodeList")

                    // let windowNoticeCodeList = '' //本次公告的code
                    // window_noticeData.forEach(item => {
                    //     windowNoticeCodeList += item.noticeCode
                    // })


                    // //设置为当天第一次打开或者公告更新时在首页跳出
                    // if (windowNoticeStorage != (windowNoticeCodeList + (new Date()).toLocaleDateString())) {
                    //     wx.setStorageSync("windowNoticeCodeList", windowNoticeCodeList + (new Date()).toLocaleDateString())
                    //     _this.setData({
                    //         showWindowNotice: true
                    //     })
                    // }
                }
            }
        })

    },
    // 点击轮播公告显示公告详细信息
    handleshowOneNotice(e) {
        console.log(e.currentTarget.dataset)
        this.setData({
            showedNoticeData: [e.currentTarget.dataset.onenotice],
            showOneNotice: true
        })
        console.log('showedNoticeData', this.data.showedNoticeData)
    },
    // 轮播所有消息
    handleshowAllNotice() {
        this.setData({
            showedNoticeData: this.data.noticeData,
            showOneNotice: true
        })
    },
    // 点击页面除（显示公告外）关闭window公告和详细公告
    closeNotice() {
        console.log('closeNotice')
        this.setData({
            showWindowNotice: false,
            showOneNotice: false
        })
    },
    //显示window公告
    handleshowWindowNotice() {
        this.setData({
            showWindowNotice: true
        })
    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {
        if (this.data.timer) {
            clearTimeout(this.data.timer)
        }
    },

    /* 获取首页取餐信息 */
    getTakeMealInfo: function() {
        let _this = this
        let param = {
            url: '/home/getHomeOrderPick?userCode=' + wx.getStorageSync('userCode')
        }
        requestModel.request(param, (data) => {
            //先处理取餐信息, pickStatus==1表示待取
            let tmp_homeOrderList = []
            data.forEach(item => {
                if (item.pickStatus == 1 && item.status == 2) {
                    if (item.orderFoodList) {
                        item.orderFoodList.forEach(onefood => {
                            let a = {}
                            a.foodImage = onefood.foodImage //图片
                            a.mealTypeShow = _this.data.mealTypeMap[item.mealType] //餐时
                            a.foodName = onefood.foodName
                            a.foodQuantity = onefood.foodQuantity
                            a.orderCode = item.orderCode

                            if (onefood.takeMealStartTime) {
                                // 取餐时间
                                let start = new Date(onefood.takeMealStartTime)
                                let end = new Date(onefood.takeMealEndTime)

                                //取餐时间顶多是到明天吗？不管了，就是明天
                                let s = '今天' + start.getHours() + '点' + (start.getMinutes() > 0 ? (start.getMinutes() + '分') : '')
                                let endHours = end.getHours() == 0 ? 24 : end.getHours()
                                let e = endHours < start.getHours() ? ('明天' + endHours + '点') : (endHours + '点') + (end.getMinutes() > 0 ? (end.getMinutes() + '分') : '')
                                a.takeMealTimeDes = s + '到' + e
                            } else {
                                let b = item.mealDate.split('-')

                                a.takeMealTimeDes = b[1] + '月' + b[2] + '日'
                            }

                            //柜子还是箱子
                            if (onefood.cabinet && onefood.cabinet.length > 0) {
                                a.isBinding = true
                                a.bindDes = '柜子号'
                                let c = ''
                                onefood.cabinet.forEach((cabinet, index) => {
                                    c += cabinet.cabinetNumber + '-' + cabinet.cellNumber
                                    if (index < onefood.cabinet.length - 1) {
                                        c += ', '
                                    }
                                })
                                a.bindNumber = c
                            } else if (onefood.boxNumber && onefood.boxNumber.length > 0) {
                                a.isBinding = true
                                a.bindDes = '箱子号'
                                a.bindNumber = onefood.boxNumber
                            } else {
                                a.isBinding = false
                                a.bindDes = ''
                                a.bindNumber = ''
                            }
                            tmp_homeOrderList.push(a)
                        })
                    }
                }
            })
            console.log('tmp_homeOrderList', tmp_homeOrderList)
            _this.setData({
                homeOrderList: tmp_homeOrderList,
                gethomeOrderList: true
            })


        })
    },
    /* 取餐 */
    handleTakeOrder: function(e) {

        let _this = this
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        let tmp_content = ''
        if (e.currentTarget.dataset.isbinding) {
            let { bindnumber, binddes } = e.currentTarget.dataset
            tmp_content = '当前' + binddes + '为：' + bindnumber + ',请确认本人在' + binddes + '旁边'
        }

        wx.showModal({
            title: '是否取餐?',
            content: tmp_content,
            success(res) {
                if (res.confirm) {

                    let param = {
                        url: '/order/orderPick?userCode=' + wx.getStorageSync('userCode') + '&orderCode=' + e.currentTarget.dataset.ordercode
                    }
                    requestModel.request(param, () => {
                        wx.showToast({
                            title: '成功取餐',
                            image: '/images/msg/success.png',
                            duration: 2000
                        })

                    })
                }
            }
        })
        if (_this.data.timer) {
            clearTimeout(_this.data.timer)
        }
        _this.data.timer = setTimeout(function() {
            _this.data.canClick = true
        }, 2000)
    },

    closeDali: function() {
        this.setData({
            showDaliFlag: false
        })
    },
    /* 监听子组件：改变弹出层的展示状态 */
    onCloseLayer: function() {
        this.setData({
            showLayerFlag: false
        })
    },
    /* 领取新人大礼 */
    getNewUserGift: function() {
        let _this = this
        let param = {
            userCode: wx.getStorageSync('userCode')
        }
        homeModel.getNewUserGift(param, (res) => {
            console.log('获取新人礼包后台反馈:', res)
            if (res.code === 0) {
                // 需要修改5/18
                let tmp_userInfo = wx.getStorageSync('userInfo').userInfo
                tmp_userInfo.newUser = false
                tmp_userInfo.canTakeDiscount = false
                wx.setStorageSync('userInfo', tmp_userInfo)
                wx.showToast({
                    title: '领取成功',
                    image: '../../images/msg/success.png',
                    duration: 2000
                })
                _this.setData({
                    showDaliFlag: false
                })
            } else {
                wx.showToast({
                    title: res.msg,
                    image: '../../images/msg/error.png',
                    duration: 2000
                })
                if (_this.data.timer) {
                    clearTimeout(_this.data.timer)
                }
                _this.data.timer = setTimeout(function() {
                    _this.setData({
                        showDaliFlag: false
                    })
                }, 2000)
            }
        })
    },
    /* 刷新用户状态信息 用于用户注册登录后，此时后台还没有审核该企业用户，当前小程序home页最上面显示button“刷新用户”*/
    handleRefreshUser: function() {
        let _this = this
        requestModel.getUserInfo(userInfo => {
            if (userInfo.userStatus == 'NORMAL') {
                _this.setData({
                    showCheckFlag: false
                })
                wx.showToast({
                    title: '登录成功',
                    image: '/images/msg/success.png',
                    duration: 2000
                })
                wx.showTabBar()
            } else {
                wx.showToast({
                    title: '企业审核中',
                    image: '/images/msg/warning.png',
                    duration: 3000
                })
            }
        }, true)
    },
    /*   用户授权弹框-获取微信授权 */
    getWxUserInfo(e) {
        console.log(e)
        if (e.detail.iv) { //这个字段存在，代表授权成功
            wx.setStorageSync('getWxUserInfo', e.detail.userInfo)
            wx.redirectTo({
                url: '/pages/login/selectPhone/selectPhone',
            })
        }
    },
    //用于解决小程序的遮罩层滚动穿透
    preventTouchMove: function() {

    },


})