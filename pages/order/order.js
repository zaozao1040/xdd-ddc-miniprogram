// pages/order/order.js
import { order } from './order-model.js'
let orderModel = new order()
import moment from "../../comm/script/moment"
const baseUrl = getApp().globalData.baseUrl

import { base } from '../../comm/public/request'
let requestModel = new base()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        //
        timer: null,
        canClick: true,
        listCanGet: true,
        //分页
        page: 1, // 设置加载的第几次，默认是第一次
        limit: 10, // 每页条数
        hasMoreDataFlag: true, //是否还有更多数据  默认还有
        //
        showPayTypeFlag: false,

        payType: 'BALANCE_PAY',
        //评价
        showRatingsFlag: false,
        orderFoodList: null,
        starNum: [0, 1, 2, 3, 4],
        starActiveNum: 0,
        ratingsContent: '',
        currentUploadImgs: null,
        tempFilePaths: [],
        imagesArr: [], //评价上传图片时 存储参数
        foodCode: '',

        paramsData: [],
        //tmp_arr: [ '', '', '全部订单', 'xuan', '餐品赞', '12132', '餐品赞', '餐品赞', '餐品赞'],
        tmp_arr: [{
            labelcode: '001',
            labelName: '餐品赞',
            active: true
        }, {
            labelcode: '001',
            labelName: '餐餐品赞',
            active: false
        }, {
            labelcode: '001',
            labelName: '餐品赞',
            active: false
        }, {
            labelcode: '001',
            labelName: '全部订单',
            active: true
        }, {
            labelcode: '001',
            labelName: '餐品赞',
            active: false
        }, {
            labelcode: '001',
            labelName: '12132',
            active: false
        }, {
            labelcode: '001',
            labelName: '餐品赞',
            active: false
        }, {
            labelcode: '001',
            labelName: '12132',
            active: false
        }],
        //
        windowHeight: 0,
        scrollTop: 0,
        //
        itemStatusActiveFlag: 0, //0：全部订单，1：今日待取，2：待评价
        orderList: [],
        orderListNoResult: false,
        //
        orderStatusMap: {
            NO_PAY: '未支付', // status = 1，is_pay=0
            PAYED_WAITINT_CONFIRM: '已支付', // status 1，is_pay=1
            CONFIRM_WAITING_MAKE: '待制作', //status = 2， confirm_status=2 
            MAKED_WAITING_DELIVERY: '待配送', //status = 2， confirm_status=2，is_box=1
            DELIVERING: '配送中', //status = 2， confirm_status=2，is_box=!=0
            DELIVERED_WAITING_PICK: '待取货', //status = 2， confirm_status=2，cabinet_status!=0
            PICKED_WAITING_EVALUATE: '待评价', //status = 2， confirm_status=2，evaluate_status=1
            COMPLETED_EVALUATED: '已评价', //status = 2， confirm_status=2，evaluate_status=2 
            USER_CANCEL: '已取消', //status=4 取消类型看cancel_type 
        },

        mealTypeMap: {
            BREAKFAST: '早餐',
            LUNCH: '午餐',
            DINNER: '晚餐',
            NIGHT: '夜宵'
        },
        orderCode: '',
        doOnHideFlag: true, //是否执行生命周期函数onhide 默认当然是执行，只有在点击上传图片时，修改这个值为false不允许
        //订单状态
        status: { 0: '未下单', 1: '下单成功', 2: '已生效', 3: '已完成', 4: '已取消' },
        //付款
        is_pay: { 0: '未付款', 1: '已付款' },
        //付款方式：
        pay_method: { 0: '无', 1: '标准付款（企业付款）', 2: '非标准付款（全部用户付款）', 3: '混合付款（标准付款+另一种支付方式）' },
        //支付方式
        defray_type: { 0: '无（标准支付情况下无）', 1: '余额支付', 2: '微信支付', 3: '支付宝支付' },
        //确认状态
        confirm_status: { 0: '不可确认', 1: '待确认', 2: '已确认' },
        //绑箱状态：
        is_box: { 0: '无', 1: '已部分绑箱', 2: '已全部绑箱' },
        //配送状态：
        delivery_status: { 0: '无', 1: '待配送', 2: '配送中', 3: '已完成配送' },
        //投柜状态：
        cabinet_status: { 0: '无', 1: '已部分投柜', 2: '已投柜（全部）', 3: '已部分取餐', 4: ' 已取餐（全部取餐）' },
        //取餐：
        pick_status: { 0: '不可取餐', 1: '可取餐', 2: '已取餐' },
        //评价：
        evaluate_status: { 0: '不可评价', 1: '可评价', 2: '已评价' },
        //取消类型：
        cancel_type: { 0: '无取消类型', 1: '系统自动取消', 2: '用户取消', 3: '系统后台取消' },


    },
    /* 跳转订单详情 */
    handleGotoOrderDetail: function(e) {
        wx.navigateTo({
            url: '/pages/order/detail?orderCode=' + e.currentTarget.dataset.ordercode,
        })
    },
    getOrderDataByResponse: function() {
        let _this = this
            //获取后台数据
        let param = {
            userId: _this.data.userId
        }
        orderModel.getOrderData(param, (res) => {
            let resData = res.data
            let tmp_data = resData
            _this.setData({ //添加结束后，setData设置一下，模板就能同步刷新
                orderDataAll: tmp_data
            })
        })

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        if (options.content) {
            let content = options.content
            wx.showModal({
                title: '提示',
                content: content,
                showCancel: false
            })
        } else {

            this.setData({
                itemStatusActiveFlag: 0
            })
        }
        this.initOrder()
        this.data.page = 1
        this.setData({
            orderList: [] //列表必须清空，否则分页会无限叠加
        })
        this.getOrderList()
        wx.showTabBar()
    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {
        if (this.data.timer) {
            clearTimeout(this.data.timer)
        }
    },
    /* 手动点击触发下一页 */
    gotoNextPage: function() {
        if (this.data.hasMoreDataFlag) {
            this.getOrderList()
            wx.showLoading({
                title: '加载更多数据',
            })
        } else {
            wx.showToast({
                image: '../../images/msg/warning.png',
                title: '没有更多数据'
            })
        }
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },
    onHide: function() {
        if (this.data.doOnHideFlag) { //执行onhide前先判断一下这个标志，允许不允许执行清空
            this.data.ratingsContent = ''
            this.setData({
                showRatingsFlag: false,
                starActiveNum: 0,
                tempFilePaths: [],
            })
        }
    },
    changeItemStatusActiveFlag: function(e) {


        if (e.currentTarget.dataset.flag == 'jinridaiqu') {
            this.setData({
                itemStatusActiveFlag: 1
            })
        } else if (e.currentTarget.dataset.flag == 'quanbudingdan') {
            this.setData({
                itemStatusActiveFlag: 0
            })
        } else if (e.currentTarget.dataset.flag == 'pingjia') {
            this.setData({
                itemStatusActiveFlag: 2
            })
        }

        this.setData({
            orderList: [], // 这四个要重置，为了交易记录的分页，因为交易记录:'在线重置俩页面是通过点击按钮切换的
            page: 1,
            hasMoreDataFlag: true
        })
        this.getOrderList()
    },
    initOrder: function() {
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
    //获取订单状态
    getOrderStatus(element) {
        let a = { has: true }
        if (element.status == 1) {
            if (element.isPay == 0) {
                a.label = '未支付'
                a.has = false

            } else {
                a.label = '已支付'
                a.image = 'yizhifu'
            }
        } else if (element.status == 2) {
            if (element.confirmStatus == 2) {
                if (element.evaluateStatus == 1) {
                    a.label = '待评价'
                    a.image = 'daipingjia'
                } else if (element.pickStatus == 1) {
                    a.label = '待取餐'
                    a.image = 'daiqucan'

                } else if (element.deliveryStatus == 1) {
                    a.label = '待配送'
                    a.image = 'daipeisong'
                } else if (element.deliveryStatus == 2) {
                    a.label = '配送中'
                    a.image = 'peisongzhong'

                } else {
                    a.label = '制作中'
                    a.image = 'zhizuozhong'
                }
            } else {
                a.label = '已支付'
                a.image = 'yizhifu'
            }

        } else if (element.status == 3) {
            a.label = '已完成'
            a.image = 'yiwancheng'
        } else {
            a.label = '已取消'
            a.image = 'yiquxiao'
        }
        return a
    },


    /* 获取订单列表 */
    getOrderList: function() {
        let _this = this

        let page = _this.data.page
        let limit = _this.data.limit
        let param = {
            url: '/order/getOrderList?userCode=' + wx.getStorageSync('userCode') + '&page=' + page + '&limit=' + limit + '&type=' + _this.data.itemStatusActiveFlag
        }
        requestModel.request(param, (res) => {

            let tmp_orderList = res.list
            if (tmp_orderList) {
                tmp_orderList.forEach(element => {
                        element.mealTypeDes = _this.data.mealTypeMap[element.mealType] //类型
                        element.orderStatusDes = _this.getOrderStatus(element) //订单状态  

                        //取餐时间
                        if (element.pickStatus == 1) { //待取餐

                            // 取餐时间
                            let start = new Date(element.orderFoodList[0].takeMealStartTime)
                            let end = new Date(element.orderFoodList[0].takeMealEndTime)

                            //取餐时间顶多是到明天吗？不管了，就是明天
                            let s = '今天' + start.getHours() + '点' + (start.getMinutes() > 0 ? (start.getMinutes() + '分') : '')
                            let endHours = end.getHours() == 0 ? 24 : end.getHours()
                            let e = endHours < start.getHours() ? ('明天' + endHours + '点') : (endHours + '点') + (end.getMinutes() > 0 ? (end.getMinutes() + '分') : '')
                            element.takeMealTimeDes = s + '到' + e

                        } else {
                            let a = element.mealDate.split('-')

                            element.takeMealTimeDes = a[1] + '月' + a[2] + '日'
                        }


                    })
                    //下面开始分页
                if (page * limit >= res.amount) {
                    _this.setData({
                        hasMoreDataFlag: false
                    })

                } else {
                    _this.setData({
                        hasMoreDataFlag: true,
                        page: page + 1
                    })
                }
                _this.setData({
                    orderList: _this.data.orderList.concat(tmp_orderList)

                })
            }


            console.log('orderList', _this.data.orderList)

        })
    },
    /* 取消订单 */
    handleCancelOrder(e) {
        this.setData({
            cancelOrderCode: e.currentTarget.dataset.ordercode,
            cancelFlag: true
        })
    },
    /* 取消取消订单 */
    handleCancelOrderWait() {
        this.setData({
            cancelOrderCode: '',
            cancelFlag: false
        })
    },
    /* 确认取消订单 */
    handleCancelOrderConfirm() {
        if (this.data.cancelOrderCode) { // 防止出错
            this.setData({
                cancelFlag: false
            })
            let _this = this
            let param = {
                userCode: wx.getStorageSync('userCode'),
                orderCode: _this.data.cancelOrderCode
            }
            let params = {
                data: param,
                url: '/order/cancelOrder',
                method: 'post'
            }
            requestModel.request(params, () => {
                wx.showToast({
                    title: '成功取消订单',
                    duration: 2000
                })

                //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
                _this.setData({
                    page: 1,
                    orderList: []
                })
                _this.getOrderList()
            })

        }
    },

    /* radio选择支付方式 */
    radioChange() {
        this.setData({
            payType: this.data.payType == "WECHAT_PAY" ? "BALANCE_PAY" : 'WECHAT_PAY'
        })
    },
    /* 去付款的对话框的确定 */
    buttonClickYes: function() {

        if (this.data.payType == 'WECHAT_PAY') {
            this.payNowByWx()
        } else {
            this.payNowByBalance()
        }

        this.setData({
            showPayTypeFlag: false
        })
    },
    /* 去付款的对话框的取消 */
    buttonClickNo: function() {

        this.setData({
            showPayTypeFlag: false
        })
    },
    /* 去付款 */
    handleSecondpayOrder: function(e) {
        let _this = this;

        let payPrice = e.currentTarget.dataset.payprice
        let orderCode = e.currentTarget.dataset.ordercode
            // 判断余额够不够
        let param = {
            url: '/user/getUserFinance?userCode=' + wx.getStorageSync('userCode')
        }
        requestModel.request(param, data => {

            _this.setData({
                showPayTypeFlag: true,
                balanceEnough: data.balance < payPrice ? false : true,
                payOrderCode: orderCode,
                payType: data.balance < payPrice ? "WECHAT_PAY" : 'BALANCE_PAY'

            })
        })
    },
    /* 去付款-微信支付 */
    payNowByWx: function() {
        let _this = this
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        if (_this.data.timer) {
            clearTimeout(_this.data.timer)
        }
        _this.data.timer = setTimeout(function() {
            _this.data.canClick = true
        }, 2000)


        let param = {
            userCode: wx.getStorageSync('userCode'),
            orderCode: _this.data.payOrderCode,
            payType: 'WECHAT_PAY'
        }

        let params = {
            data: param,
            url: '/order/orderPay',
            method: 'post'
        }
        requestModel.request(params, resdata => {
            let data = resdata.payData
                // 如果需要支付。选择微信支付哪还有不要支付的5/18
            if (resdata.needPay) {
                if (data.timeStamp) {
                    wx.requestPayment({
                        'timeStamp': data.timeStamp.toString(),
                        'nonceStr': data.nonceStr,
                        'package': data.packageValue,
                        'signType': data.signType,
                        'paySign': data.paySign,
                        success: function(e) {

                            wx.showToast({
                                title: '成功支付订单',
                                image: '../../images/msg/success.png',
                                duration: 2000
                            })

                            //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
                            _this.setData({
                                page: 1,
                                orderList: []
                            })
                            _this.getOrderList()
                        },
                        fail: function(e) {
                            wx.showToast({
                                title: '已取消支付',
                                image: '../../images/msg/success.png',
                                duration: 4000
                            })
                        },
                        complete: function() {
                            wx.hideLoading()
                        }
                    })
                }
            }
        })
    },
    /* 去付款-余额支付 */
    payNowByBalance: function() {
        let _this = this
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        if (_this.data.timer) {
            clearTimeout(_this.data.timer)
        }
        _this.data.timer = setTimeout(function() {
            _this.data.canClick = true
        }, 2000)

        let param = {
            userCode: wx.getStorageSync('userCode'),
            orderCode: _this.data.payOrderCode,
            payType: 'BALANCE_PAY'
        }

        let params = {
            data: param,
            url: '/order/orderPay',
            method: 'post'
        }
        requestModel.request(params, data => {
            wx.showToast({
                    title: '成功支付订单',
                    image: '../../images/msg/success.png',
                    duration: 2000
                })
                //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18
            _this.setData({
                page: 1,
                orderList: []
            })
            _this.getOrderList()
        })

    },
    /* 去取餐 */
    handleTakeOrder: function(e) {
        //console.log(e)
        let _this = this
        if (!_this.data.canClick) {
            return
        }
        _this.data.canClick = false
        let tmp_content = '请确定在柜子前'
            // if (e.currentTarget.dataset.cabinet != null) {
            //     tmp_content = '当前柜号为：' + e.currentTarget.dataset.cabinet + ',请确认本人在柜子旁边'
            // }
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
    /* 去评价 */
    handleEvaluateOrder: function(e) {
        let _this = this
        this.data.ratingsContent = ''

        wx.setNavigationBarColor({
            frontColor: '#ffffff',
            backgroundColor: '#969696',
            animation: {
                duration: 400,
                timingFunc: 'easeIn'
            }
        })
        let orderFoodList = e.currentTarget.dataset.orderfoodlist
        let orderFoodListLength = orderFoodList.length
        let tmp_paramsData = []


        for (let i = 0; i < orderFoodListLength; i++) {
            tmp_paramsData.push({
                star: 5,
                /*       labels: orderFoodList   ---------  */
            })
        }
        _this.setData({
            showRatingsFlag: true,
            starActiveNum: 0, //这三个都要清空

            tempFilePaths: [],
            orderCode: e.currentTarget.dataset.ordercode,
            orderFoodList: orderFoodList,

            paramsData: tmp_paramsData

        })
        console.log('999999', tmp_paramsData, e.currentTarget.dataset.ordercode, e.currentTarget.dataset.orderfoodlist)

    },

    /* 去评价的对话框的确定 */
    buttonClickYes_ratings: function(e) {
        let _this = this
        if (!_this.data.starActiveNum) {
            wx.showToast({
                title: '请选择星级',
                image: '../../images/msg/warning.png',
                duration: 2000
            })
        } else if (_this.data.tempFilePaths != [] && _this.data.ratingsContent == '') {
            console.log(_this.data.tempFilePaths, _this.data.ratingsContent, _this.data.tempFilePaths && !_this.data.ratingsContent)
            wx.showToast({
                title: '请填写评价',
                image: '../../images/msg/warning.png',
                duration: 2000
            })
        } else {
            let param = {
                order: {
                    orderCode: _this.data.orderCode,
                    star: 0,
                    images: [],
                    wechatFormId: ''
                },
                foods: [{
                    foodCode: _this.data.foodCode,
                    star: _this.data.starActiveNum,
                    content: _this.data.ratingsContent,
                    wechatFormId: e.detail.formId,
                    images: _this.data.imagesArr
                }]
            }
            console.log('评价请求的参数：', param)
            wx.showLoading({ //【防止狂点2】
                title: '加载中',
                mask: true
            })
            orderModel.evaluateOrder(param, (res) => {
                console.log('收到请求(评价):', res)
                if (res.code === 0) {
                    wx.hideLoading()
                    wx.reLaunch({
                        url: '/pages/order/order',
                        success: function(res) {
                            wx.showToast({
                                title: '成功评价,已送您' + res.data + '积分',
                                image: '../../images/msg/success.png',
                                duration: 2000
                            })
                        }
                    })
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
    },
    /* 去评价的对话框的取消 */
    buttonClickNo_ratings: function() {
        let _this = this;
        _this.setData({
            showRatingsFlag: !_this.data.showRatingsFlag
        })
    },

    ratingsInput: function(e) {
        /*     this.setData({
              ratingsContent: e.detail.value
            }) */
        this.data.ratingsContent = e.detail.value
    },
    /* 点击星星 */
    handleClickStar: function(e) {
        let _this = this
        let starWillBeNum = 0
        if (e.currentTarget.dataset.starflag === 'yes') { //黄星
            starWillBeNum = e.currentTarget.dataset.allstarindex
        }
        if (e.currentTarget.dataset.starflag === 'no') { //灰星
            starWillBeNum = e.currentTarget.dataset.yellowstar + e.currentTarget.dataset.allstarindex
        }
        let temp_paramsData = _this.data.paramsData
        temp_paramsData[e.currentTarget.dataset.foodindex].star = starWillBeNum
        this.setData({
            paramsData: temp_paramsData
        })
    },
    /* 点击标签 */
    handleClickLabel: function(e) {
        let _this = this
        _this.data.tmp_arr[e.currentTarget.dataset.labelindex].active = !tmp_arr[e.currentTarget.dataset.labelindex].active
        let tmp_labelCodes = []
        tmp_labelCodes.push(e.currentTarget.dataset.labelindex)
        this.setData({
            paramsData: temp_paramsData
        })
    },
    /* 点击预览图片 */
    handlePreviewImage: function(e) {
        let _this = this
        let index = e.currentTarget.dataset.index; //预览图片的编号
        wx.previewImage({
            current: _this.data.tempFilePaths[index], //预览图片链接
            urls: _this.data.tempFilePaths, //图片预览list列表
            success: function(res) {
                console.log(res);
            },
            fail: function() {
                console.log('fail')
            }
        })
    },
    /* 点击上传图片 */
    handleClickAddImg: function() {
        let _this = this
        _this.data.doOnHideFlag = false
            /*     _this.setData({ //置为false，onhide里面的代码不允许执行
                  doOnHideFlag: false
                }) */
        wx.chooseImage({
            count: 1, //最多可以选择的图片数，默认为9
            sizeType: ['orignal', 'compressed'], //original 原图，compressed 压缩图，默认二者都有
            sourceType: ['album', 'camera'], //album 从相册选图，camera 使用相机，默认二者都有
            success: function(res_0) {
                wx.showToast({
                    title: '正在上传...',
                    icon: 'loading',
                    mask: true,
                    duration: 1000
                })
                wx.uploadFile({
                    url: baseUrl + '/file/uploadFile', //开发者服务器 url
                    filePath: res_0.tempFilePaths[0], //要上传文件资源的路径
                    name: 'file', //文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
                    formData: { //HTTP 请求中其他额外的 form data
                        orderCode: _this.data.orderCode,
                        userCode: wx.getStorageSync('userCode'),
                        type: 'EVALUATE'
                    },
                    success: function(res) {
                        let tmp_data = JSON.parse(res.data)
                        if (tmp_data.code == 0) {
                            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                            let tmp_tempFilePaths = _this.data.tempFilePaths
                            tmp_tempFilePaths.push(res_0.tempFilePaths[0])
                            _this.setData({
                                tempFilePaths: tmp_tempFilePaths //预览图片响应式
                            })
                            _this.data.imagesArr.push(tmp_data.data)
                        } else {
                            wx.showToast({
                                title: tmp_data.msg,
                                image: '../../images/msg/error.png',
                                duration: 2000
                            })
                        }
                    }
                })
            },
            fail: function() {}, //接口调用失败的回调函数
            complete: function() {
                    _this.data.doOnHideFlag = false
                        /*         _this.setData({ //还原为true，onhide里面的代码允许执行
                                  doOnHideFlag: true
                                }) */
                } //接口调用结束的回调函数（调用成功:'失败都会执行）
        })
    },
    //用于解决小程序的遮罩层滚动穿透
    preventTouchMove: function() {

    }

})