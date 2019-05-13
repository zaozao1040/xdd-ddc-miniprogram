import { home } from '../home/home-model.js'
let homeModel = new home()
import { mine } from '../mine/mine-model.js'
let mineModel = new mine()
import { order } from '../order/order-model.js'
let orderModel = new order()

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
        allFoodtype: {},
        timeInfo: [],
        organizeMealTypeFlag: null,
        mealTypeInfo: null


    },
    // 选择今天
    handleSelectToday() {
        this.setData({
            appointmention: 'today'
        })
    },
    handleSelectTomorrow() {
        this.setData({
            appointmention: 'tomorrow'
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

    /* 获取七天日期 */
    getTimeDataByResponse: function() {
        let _this = this
        let tmp_userCode = wx.getStorageSync('userCode')
        let url = '/food/' + tmp_userCode + '/date'
        homeModel.getTimeData({}, url, function(res) { //回调获取七天列表，赋给本地timeInfo
            let resData = res
            console.log('获取七天日期resData', resData)
            _this.setData({ //首次进入的active的日期信息，保存下来 
                    timeInfo: resData
                })
                // 点击预约多天，还需要再调用一遍获取七天日期的这个接口吗
            wx.setStorageSync('timeInfo', resData)


            let tmp_allFoodType = ["BREAKFAST", "LUNCH", "DINNER", "NIGHT"]

            let tmp_organizeMealTypeFlag = []
            tmp_allFoodType.forEach(item => {
                if (resData[item]) {
                    tmp_organizeMealTypeFlag.push(item)
                }
            })

            let tmp_allFoodTypeName = { "BREAKFAST": '早餐', "LUNCH": '午餐', "DINNER": '晚餐', "NIGHT": '夜宵' }
            let todaytomorrow = ['today', 'tomorrow']
            let tmp_mealTypeInfo = {}
            for (let day = 0; day < 2; day++) { //这里可以这么写吗？根据序号做判断总觉得有些不妥，应该根据日期啊
                let tmp_today = {}
                let dateFlag_f = resData.dateFlag[day]
                tmp_today.mealDate = dateFlag_f.mealDate
                let dateFlag_mealType = dateFlag_f.mealType
                for (let i = 0; i < dateFlag_mealType.length; i++) {
                    let tmp_foodtype = {}
                    if (dateFlag_mealType[i].mealTypeFlag) {
                        tmp_foodtype.flag = true
                    } else {
                        tmp_foodtype.flag = false
                    }
                    tmp_foodtype.name = tmp_allFoodTypeName[dateFlag_mealType[i].mealType]

                    let tmp_deadline = dateFlag_mealType[i].deadline
                    if (!tmp_deadline) {
                        tmp_foodtype.deadline = '已截止订餐'
                    } else {
                        let dayInfo = ['今天', '明天', '后天'] //最多也就是后天吧
                        let durationInfo = ['凌晨', '上午', '下午', '晚上']
                        let deadTime = new Date(tmp_deadline) //截止时间

                        // 判断是哪天 error
                        let day = deadTime.getDate() - new Date().getDate() //如果是月末减去月初，就有问题了 这里有问题，还要再修改
                        let hour = deadTime.getHours()
                        let duration = parseInt(hour / 6)
                        let duration_hour = hour > 12 ? hour - 12 : hour

                        let minutes = deadTime.getMinutes()
                            //  let second = deadTime.getSeconds()
                        if (minutes == 0) {
                            tmp_foodtype.deadline = dayInfo[day] + durationInfo[duration] + duration_hour + '点'
                        } else {
                            tmp_foodtype.deadline = dayInfo[day] + durationInfo[duration] + duration_hour + '点' + minutes + '分'
                        }

                    }
                    // tmp_foodtype.deadline = dateFlag_mealType[i].deadline
                    tmp_today[dateFlag_mealType[i].mealType] = tmp_foodtype
                }

                tmp_mealTypeInfo[todaytomorrow[day]] = tmp_today
            }

            // 是应该放在缓存吗？还是在wx.navigate的时候，将信息添加到url中----待定
            wx.setStorageSync('mealTypeInfo', tmp_mealTypeInfo)
            wx.setStorageSync('organizeMealTypeFlag', tmp_organizeMealTypeFlag)

            wx.hideTabBar()
            _this.setData({
                showMenuSelect: true,
                mealTypeInfo: tmp_mealTypeInfo,
                organizeMealTypeFlag: tmp_organizeMealTypeFlag
            })



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
            })

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
            // homeModel.getImages(param, (res) => {
            //     console.log('获取首页图片:', res)
            //     if (res.code === 0) {
            //         this.setData({
            //             imagesList: res.data
            //         })
            //     } else {
            //         wx.showToast({
            //             title: res.msg,
            //             icon: 'none',
            //             duration: 2000
            //         })
            //     }
            // })
    },
    handleGotoMenu: function() {

        this.getTimeDataByResponse();
        // 应该是在获取7天日期执行完后，再显示

        // let tmp_timeInfo2 = {
        //     "organizeMealTypeFlag": {
        //         "BREAKFAST": false,
        //         "LUNCH": true,
        //         "DINNER": true,
        //         "NIGHT": false
        //     },
        //     "dateFlag": [{
        //             "mealDate": "2019-04-03",
        //             "mealType": [{
        //                     "BREAKFAST": false,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //                 {
        //                     "LUNCH": false,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //                 {
        //                     "DINNER": true,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //                 {
        //                     "NIGHT": false,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //             ]
        //         },
        //         {
        //             "mealDate": "2019-04-04",
        //             "mealType": [{
        //                     "BREAKFAST": false,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //                 {
        //                     "LUNCH": true,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //                 {
        //                     "DINNER": true,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //                 {
        //                     "NIGHT": false,
        //                     "deadline": "2019-04-04T04:00:00+08:00"
        //                 },
        //             ]
        //         }
        //     ]
        // }

        // let tmp_organizeMealTypeFlag = ['LUNCH', "DINNER"]
        // let tmp_mealTypeInfo = {
        //     today: {
        //         mealDate: '2019-04-03',
        //         "BREAKFAST": {
        //             flag: false,
        //             name: '早餐',
        //             "deadline": "明天凌晨1点"
        //         },
        //         "LUNCH": {
        //             flag: false,
        //             name: '午餐',
        //             "deadline": "已截止订餐"
        //         },
        //         "DINNER": {
        //             flag: true,
        //             name: '晚餐',
        //             "deadline": "明天凌晨3点"
        //         },
        //         "NIGHT": {
        //             flag: false,
        //             name: '夜宵',
        //             "deadline": "明天凌晨4点"
        //         }
        //     },
        //     tomorrow: {
        //         "mealDate": "2019-04-04",
        //         "BREAKFAST": {
        //             flag: false,
        //             name: '早餐',
        //             "deadline": "明天凌晨11点"
        //         },
        //         "LUNCH": {
        //             flag: true,
        //             name: '午餐',
        //             "deadline": "明天凌晨12点"
        //         },
        //         "DINNER": {
        //             flag: true,
        //             name: '晚餐',
        //             "deadline": "明天凌晨13点"
        //         },
        //         "NIGHT": {
        //             flag: false,
        //             name: '夜宵',
        //             "deadline": "明天凌晨14点"
        //         }
        //     }
        // }



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

        this.initHome()
        this.getNotice()

        wx.loadFontFace({
            family: 'PingFangSC-Medium',
            source: 'url("https://www.your-server.com/PingFangSC-Medium.ttf")',
            success: function() { console.log('load font success') }
        })
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

                wx.showTabBar()
                let { userStatus, canTakeDiscount } = userInfo
                if (userStatus == 'NO_CHECK') { //企业用户的'审核中'状态,而其他的状态无需隐藏
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

        let url = '/home/getHomeNotice?userCode=' + wx.getStorageSync('userCode')
        let param = {
            url
        }

        requestModel.request(param, data => {
                console.log('getNotice', data)
                if (!data && data.length > 0) { //后台是在没有公告的时候返回空数组
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
                            windowNoticeData: window_noticeData,
                            hasWindowNotice: true
                        })
                        let windowNoticeStorage = wx.getStorageSync("windowNoticeCodeList")
                        console.log('windowNoticeStorage', windowNoticeStorage)
                        let windowNoticeCodeList = '' //本次公告的code
                        window_noticeData.forEach(item => {
                            windowNoticeCodeList += item.noticeCode
                        })

                        console.log('日期', (new Date()).toLocaleDateString() + (new Date().getHours()))
                            //设置为当天第一次打开或者公告更新时在首页跳出
                        if (windowNoticeStorage != (windowNoticeCodeList + (new Date()).toLocaleDateString())) {
                            wx.setStorageSync("windowNoticeCodeList", windowNoticeCodeList + (new Date()).toLocaleDateString())
                            _this.setData({
                                showWindowNotice: true
                            })

                            console.log('windowNoticeStorage', windowNoticeStorage)
                        }
                    }
                }
            })
            // homeModel.getNotice(param, (res) => {

        //     if (res.code == 0) {
        //         if (res.data != null && res.data.length > 0) { //后台是在没有公告的时候返回空数组
        //             let temp_noticeData = res.data
        //             _this.setData({
        //                 noticeData: temp_noticeData,
        //                 hasNotice: true
        //             })

        //             let window_noticeData = []
        //             temp_noticeData.forEach(item => {
        //                 if (item.window) {
        //                     window_noticeData.push(item)
        //                 }
        //             })

        //             if (window_noticeData.length > 0) {
        //                 _this.setData({
        //                     windowNoticeData: window_noticeData,
        //                     hasWindowNotice: true
        //                 })
        //                 let windowNoticeStorage = wx.getStorageSync("windowNoticeCodeList")
        //                 console.log('windowNoticeStorage', windowNoticeStorage)
        //                 let windowNoticeCodeList = '' //本次公告的code
        //                 window_noticeData.forEach(item => {
        //                         windowNoticeCodeList += item.noticeCode
        //                     })
        //                     //wx.setStorageSync("windowNoticeCodeList", '')
        //                 console.log('日期', (new Date()).toLocaleDateString() + (new Date().getHours()))
        //                     //设置为当天第一次打开或者公告更新时在首页跳出
        //                 if (windowNoticeStorage != (windowNoticeCodeList + (new Date()).toLocaleDateString())) {
        //                     wx.setStorageSync("windowNoticeCodeList", windowNoticeCodeList + (new Date()).toLocaleDateString())
        //                     _this.setData({
        //                         showWindowNotice: true
        //                     })

        //                     console.log('windowNoticeStorage', windowNoticeStorage)
        //                 }
        //             }
        //         }
        //     }
        // })
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
            userCode: wx.getStorageSync('userCode')
        }
        homeModel.getTakeMealInfo(param, (res) => {
            console.log('获取首页取餐信息后台反馈:', res)
            if (res.code === 0 && res.data) {
                let tmp_homeOrderList = res.data
                tmp_homeOrderList.forEach(element => {
                    element.mealTypeDes = _this.data.mealTypeMap[element.mealType]
                    element.orderStatusDes = _this.data.orderStatusMap[element.orderStatus]

                    let start = new Date(element.takeMealStartTime).getHours()
                    let end = new Date(element.takeMealEndTime).getHours()
                    element.takeMealStartTimeDes = start
                    element.takeMealEndTimeDes = end == 0 ? 24 : end

                })
                _this.setData({
                    homeOrderList: tmp_homeOrderList
                })

                console.log('homeOrderList', tmp_homeOrderList)
            }
        })
    },
    /* 取餐 */
    handleTakeOrder: function(e) {
        console.log(e.currentTarget.dataset)
        let _this = this
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        let tmp_content = ''
        if (e.currentTarget.dataset.cabinet.length > 0) {
            let item = ''
            e.currentTarget.dataset.cabinet.forEach(element => {
                item = item + element.cabinetOrder + element.serialNum + ' '
            })
            tmp_content = '当前柜号为：' + item + ',请确认本人在柜子旁边'
        }
        console.log(tmp_content)
        wx.showModal({
            title: '是否取餐?',
            content: tmp_content,
            success(res) {
                if (res.confirm) {
                    let param = {
                        userCode: wx.getStorageSync('userCode'),
                        orderCode: e.currentTarget.dataset.ordercode
                    }
                    wx.showLoading({ //【防止狂点2】
                        title: '加载中',
                        mask: true
                    })
                    orderModel.takeOrder(param, (res) => {
                        console.log('收到请求(取餐):', res)
                        if (res.code === 0) {
                            wx.hideLoading()
                            wx.showToast({
                                    title: '成功取餐',
                                    image: '../../images/msg/success.png',
                                    duration: 2000
                                })
                                /* wx.reLaunch({  //注释掉，取餐后不刷新，减少请求
                                    url: '/pages/home/home'
                                }) */
                        } else {
                            wx.hideLoading()
                            wx.showToast({
                                title: res.msg,
                                image: '../../images/msg/error.png',
                                duration: 2000
                            })
                        }
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
                let tmp_userInfo = wx.getStorageSync('userInfo')
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
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        wx.login({
            success: function(res) {
                if (res.code) {
                    if (wx.getStorageSync('userCode')) { //已经登录
                        let param = {
                            code: res.code, //微信code
                            userCode: wx.getStorageSync('userCode')
                        }
                        mineModel.getMineData(param, (res) => { //刷新用户信息后再跳转到首页
                            if (res.code == 0) {
                                if (res.data.userStatus == 'NORMAL') {
                                    wx.setStorageSync('userInfo', res.data)
                                    wx.reLaunch({ //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
                                        url: '/pages/home/home',
                                    })
                                    wx.showToast({
                                        title: '登录成功',
                                        image: '../../images/msg/success.png',
                                        duration: 2000
                                    })
                                } else {
                                    wx.showToast({
                                        title: '企业审核中..',
                                        image: '../../images/msg/warning.png',
                                        duration: 3000
                                    })
                                }
                            }
                        })
                    }
                }
            }
        })
        if (_this.data.timer) {
            clearTimeout(_this.data.timer)
        }
        _this.data.timer = setTimeout(function() {
            _this.data.canClick = true
        }, 500)
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

    }

})