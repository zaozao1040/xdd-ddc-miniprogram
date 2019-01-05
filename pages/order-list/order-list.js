var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
import { myPublic } from '../public/public-model.js'
let myPublicModel = new myPublic()
Page({
    data: {
        tabs: ["今日待取", "全部订单"],
        activeIndex: 1,
        sliderOffset: 0,
        sliderLeft: 0,
        contentHeight: 0,//主体内容高度
        page:1,//页数
        limit:10,//加载个数
        emptyOrders: true,//orders 是否为空
        searchLoadingComplete: false,
        searchLoading: false, //"上拉加载"的变量，默认false，隐藏
        orders: [],
        loading:false,
        todayOrders: []
    },
    /**
     * 取消订单
     */
    cancelOrder: function(e){
        let that = this;
        let orderCode = e.target.dataset.orderCode;
        let payPrice = e.target.dataset.payPrice;
        let orderStatus = e.target.dataset.orderStatus;
        let tipsContent = "确认取消订单";
        if (payPrice > 0 && orderStatus != "NO_PAY") {
            console.log(111);
            tipsContent = tipsContent + ",实际付款金额将会退到到用户余额"
        }
        let userCode = "USER530120044101763072";
        wx.showModal({
            title: '提示',
            content: tipsContent,
            confirmText: "取消订单",
            success: function(smRes){
                if(smRes.confirm){
                    wx.request({
                        url: 'http://192.168.1.123:8080/order/cancelOrder',
                        data: {},
                        method: "PUT",
                        header: {
                            'content-type': 'application/json'
                        },
                        data: {
                            "userCode": userCode,
                            "orderCode": orderCode
                        },
                        success: function (res) {
                            if(res.data.data){
                                wx.showToast({
                                    title: '取消成功',
                                    icon: "none"
                                })
                                that.setData({
                                    orders: [],
                                    todayOrders: [],
                                    searchLoadingComplete: false,
                                })
                                that.onShow();
                            }
                        },
                        fail: function (res) {
                            console.log("fail");
                            console.log(res);
                        }
                    })
                }
            }
        })
    },
    /**
     * 订单再次支付
     */
    goPay: function(e){
        let orderCode = e.target.dataset.orderCode;
        let userCode = "USER530120044101763072";
        wx.request({
            url: 'http://192.168.1.123:8080/order/orderPayOnceAgain',
            data: {},
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            data: {
                "userCode": userCode,
                "orderCode": orderCode
            },
            success: function (res) {
                let data = res.data.data;
                if (data.timeStamp) {
                    wx.requestPayment({
                        'timeStamp': data.timeStamp.toString(),
                        'nonceStr': data.nonceStr,
                        'package': data.packageValue,
                        'signType': data.signType,
                        'paySign': data.paySign,
                        success: function (e) {
                            console.log("success");
                            console.log(e);
                        },
                        fail: function (e) {
                            console.log("error");
                            console.log(e);
                        }
                    });
                }
            },
            fail: function (res) {
                console.log("fail");
                console.log(res);
            }
        })

    },
    /**
     * 上拉加载更多
     */
    searchScrollLower: function() {
        let that = this;
        if (!that.data.searchLoadingComplete) {
            that.setData({
                page: that.data.page + 1,  //每次触发上拉事件，把searchPageNum+1
                emptyOrders: false  //触发到上拉事件，把isFromSearch设为为false
            });
            that.getOrderList();
        }else{
            that.setData({
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏
            });
        }
    },
    refresh: function(){
        this.setData({
            loading: false,
            orders: [],
            todayOrders: [],
        })
        this.onShow();
    },
    onShow: function(){
/*         let userStatus = myPublicModel.getUserStatus()
        console.log(userStatus)
        if(userStatus!=0){
            wx.switchTab({
                url: '/pages/home/home',
            })
            return
        } */

        this.setData({
            page:1,
        })
        this.getOrderList();
    },
    /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
    onPullDownRefresh: function () {
        console.log(111);
    },
    /**
     * 获取订单列表
     */
    getOrderList: function(){
        let that = this;
        let page = that.data.page;
        let limit = that.data.limit;
        let activeIndex = that.data.activeIndex;
        let today = false;
        if (activeIndex == 0) {
            today = true;
        }
        wx.request({
            url: 'http://192.168.1.123:8080/order/orderList',
            method: "GET",
            header: {
                'content-type': 'application/json'
            },
            data: {
                "userCode": "USER530120044101763072",
                "orderStatus": "",
                "today": today,
                "page": page,
                "limit": limit
            },
            success: function (res) {
                let data = res.data.data;
                let ordersBack = [];
                let todayBack = [];
                that.data.isFromSearch ? ordersBack = data.list : ordersBack = that.data.orders.concat(data.list);
                that.data.isFromSearch ? todayBack = data.list : todayBack = that.data.todayOrders.concat(data.list);
                if (data.list.length > 0) {
                    if (today) {
                        that.setData({
                            todayOrders: ordersBack,
                            searchLoading: true,
                            loading: true
                        })
                    }else{
                        that.setData({
                            orders: ordersBack,
                            searchLoading: true,
                            loading: true
                        })
                    }
                }else{
                    that.setData({
                        searchLoadingComplete: true, //把“没有数据”设为true，显示
                        searchLoading: false,  //把"上拉加载"的变量设为false，隐藏
                        loading: true
                    });
                }
            },
            fail: function (res) {
                console.log("fail");
                console.log(res);
            }
        })
    },
    onLoad: function () {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
                    sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex,
                    contentHeight: res.screenHeight
                });
            }
        });
    },
    /**
     * tab切换
     */
    tabClick: function (e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.id,
            searchLoadingComplete: false,
            page: 1,
            orders: [],
            todayOrders: [],
            loading: false
        });
        this.onShow();
    }
});