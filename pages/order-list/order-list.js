var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
const baseUrl = getApp().globalData.baseUrl
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
        todayOrders: [],
        disable: false
    },
    /**
     * 取消订单
     */
    cancelOrder: function(e){
        let that = this;
        let index = e.target.dataset.index;
        let orderCode = e.target.dataset.orderCode;
        let payPrice = e.target.dataset.payPrice;
        let orderStatus = e.target.dataset.orderStatus;
        let tipsContent = "确认取消订单";
        if (payPrice > 0 && orderStatus != "NO_PAY") {
            console.log(111);
            tipsContent = tipsContent + ",实际付款金额将会退到到用户余额"
        }
        let orders = this.data.orders;
        let todayOrders = this.data.todayOrders;
        let activeIndex = this.data.activeIndex;
        let userCode = wx.getStorageSync('userInfo').userCode
        // let userCode = "USER531912225330429952";
        wx.showModal({
            title: '提示',
            content: tipsContent,
            confirmText: "取消订单",
            success: function(smRes){
                if(smRes.confirm){
                    wx.showLoading({
                        title: '操作中',
                    })
                    wx.request({
                        //url: 'https://ddc.vpans.cn/order/cancelOrder',
                        url: baseUrl + '/order/cancelOrder',
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
                            console.log(res);
                            if(res.data){
                                if (res.data.code == 0) {
                                    wx.showToast({
                                        title: '取消成功',
                                        icon: "none"
                                    })
                                    if (activeIndex == 1) {//全部订单
                                        orders[index].orderStatus = "USER_CANCEL";
                                    } else {//今日订单
                                        todayOrders[index].orderStatus = "USER_CANCEL";
                                    }
                                    that.setData({
                                        orders: orders,
                                        todayOrders: todayOrders,
                                        searchLoadingComplete: false,
                                    })
                                }else{
                                    wx.showToast({
                                        title: res.data.msg,
                                        icon: 'none'
                                    })
                                }
                                
                            }
                        },
                        fail: function (res) {
                            console.log("fail");
                            console.log(res);
                        },
                        complete: function(){
                            wx.hideLoading();
                        }
                    })
                }
            }
        })
    },
    takeMeal: function (e) {
        let orderCode = e.target.dataset.orderCode;
        let userCode = wx.getStorageSync('userInfo').userCode
        //let userCode = "USER530120044101763072";
        wx.request({
            //url: 'https://ddc.vpans.cn/order/takeMeal',
            url: baseUrl + '/order/takeMeal',
            data: {},
            method: "Get",
            header: {
                'content-type': 'application/json'
            },
            data: {
                "userCode": userCode,
                "orderCode": orderCode
            },
            success: function (res) {
                let data = res.data;
                if (data.code == 0) {
                    wx.showToast({
                        title: '取餐成功',
                        icon: 'none'
                    })
                }else{
                    wx.showToast({
                        title: data.msg,
                        icon: 'none'
                    })
                }
            },
            fail: function (res) {
                wx.showToast({
                    title: data.msg,
                    icon: 'none'
                })
            }
        })
    },
    /**
     * 订单再次支付
     */
    goPay: function(e){
        let that = this;
        let orderCode = e.target.dataset.orderCode;
        if (this.data.disable) {
            return;
        }
        this.setData({
            disable: true
        })
        setTimeout(() => {
            that.setData({
                disable: false
            });
        }, 1000);
        let userCode = wx.getStorageSync('userInfo').userCode
        wx.request({
            //url: 'https://ddc.vpans.cn/order/orderPayOnceAgain',
            url: baseUrl + '/order/orderPayOnceAgain',
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
                emptyOrders: false,  //触发到上拉事件，把isFromSearch设为为false
                searchLoading:true
            });
            that.getOrderList();
        }else{
            that.setData({
                searchLoading: false  //把"上拉加载"的变量设为false，隐藏
            });
        }
    },
    onShow: function(){
        let that = this;
        this.setData({
            page:1,
            loading:false,
            orders: [],
            todayOrders: [],
            searchLoadingComplete: false,
        })
        this.getOrderList((res)=>{
            wx.stopPullDownRefresh();
        });
    },
    
    /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
    onPullDownRefresh: function () {
        this.setData({
            loading: false,
            orders: [],
            todayOrders: [],
        })
        this.onShow();
    },
    /**
     * 获取订单列表
     */
    getOrderList: function (callback){
        let that = this;
        let page = that.data.page;
        let limit = that.data.limit;
        let activeIndex = that.data.activeIndex;
        let today = false;
        if (activeIndex == 0) {
            today = true;
        }
        wx.request({
            //url: 'https://ddc.vpans.cn/order/orderList',
            url: baseUrl + '/order/orderList',
            method: "GET",
            header: {
                'content-type': 'application/json'
            },
            data: {
                "userCode": wx.getStorageSync('userInfo').userCode,
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
                        loading: true
                    });
                }
            },
            fail: function (res) {
                console.log("fail");
                console.log(res);
            },
            complete: function(){
                that.setData({
                    searchLoading: false,  //把"上拉加载"的变量设为false，隐藏
                });
            }
        })
        callback && callback();
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
    },
    /* 去评价 */
    handleRating:function(e){
        let orderCode = e.target.dataset.orderCode;
        wx.navigateTo({
            url: '/pages/evaluate/evaluate?orderCode='+orderCode,
            success: function(res){
                // success
            },
            fail: function() {
                // fail
            },
            complete: function() {
                // complete
            }
        })
    },
});