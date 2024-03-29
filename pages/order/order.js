import { base } from "../../comm/public/request";

import moment from "../../comm/public/moment";
let requestModel = new base();

Page({
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

    payType: "BALANCE_PAY",
    //评价
    showRatingsFlag: false,
    orderFoodList: null,
    foodCode: "",
    tempFilePaths: [],
    imagesArr: [], //评价上传图片时 存储参数
    evaluateLabels: [],
    evaluateLabelsActive: [],
    labels: [],
    content: [], //绑定多道菜的每个文字评价内容
    //
    windowHeight: 0,
    scrollTop: 0,
    //
    itemStatusActiveFlag: 0, //0：全部订单，1：今日待取，2：待评价
    orderList: [],
    mealTypeMap: {
      BREAKFAST: "早餐",
      LUNCH: "午餐",
      DINNER: "晚餐",
      NIGHT: "夜宵",
    },
    getOrdersNow: false,
    checkOrderDate: "", //今日待取的日期
    checkOrderDateDes: "",
    selectedDate: null, //全部订单的日期
    selectedDateFlag: false,
    showShapeFlag: false,
    getalready: false,
    takeorderModalShowInit: true, //避免弹框在刚进入页面就弹出

    showIcon: false,
    iconItem: {},
  },
  bindDateChange(e) {
    if (e.detail && e.detail.value)
      this.setData({
        selectedDate: e.detail.value,
        selectedDateFlag: true,
        showShapeFlag: false,
      });
    this.getOrderList(true);
  },
  showShape() {
    let _this = this;
    _this.setData({
      showShapeFlag: !_this.data.showShapeFlag,
    });
  },
  closeDateFilter() {
    if (this.data.showShapeFlag) {
      this.setData({
        showShapeFlag: false,
      });
    }
  },
  /* 跳转订单详情 */
  handleGotoOrderDetail: function (e) {
    if (e.currentTarget.dataset.item.orderType == "SPARE_ORDER") {
      wx.showToast({
        title: "暂不支持",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    this.setData({
      showShapeFlag: false,
    });
    wx.navigateTo({
      url: "/pages/order/detail?orderCode=" + e.currentTarget.dataset.ordercode,
    });
  },
  //跳转到登录页面
  gotoLogin() {
    wx.reLaunch({
      url: "/pages/login/selectPhone/selectPhone",
    });
  },
  //跳转到点餐页面
  handleGotoMenu() {
    wx.reLaunch({
      url: "/pages/home/home?fromorder=true",
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.content) {
      let content = options.content;

      this.setData({
        itemStatusActiveFlag: 0,
        orderSuccessFlag: true,
        orderSuccessContent: content,
      });
    }
  },
  closePop() {
    this.setData({
      orderSuccessFlag: false,
    });
  },
  /* 手动点击触发下一页 */
  gotoNextPage: function () {
    if (this.data.hasMoreDataFlag) {
      this.getOrderList(false);
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    //这写在onShow里可以吗？？

    let now = new Date();
    let end = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    let month = end.getMonth() + 1;
    let day = end.getDate();
    end =
      end.getFullYear() +
      "-" +
      (month < 10 ? "0" + month : month) +
      "-" +
      (day < 10 ? "0" + day : day);
    _this.setData({
      checkOrderDate: new Date(),
      endDatePicker: end,
    });

    if (_this.data.itemStatusActiveFlag == 1) {
      this.setData({
        todayInit: true,
      });
    }
    let userCode = wx.getStorageSync("userCode");
    _this.setData({
      userCode: userCode,
    });
    if (userCode) {
      _this.initOrder();
      _this.getOrderList(true);
      wx.showTabBar();
    } else {
      _this.setData({
        getalready: true,
      });
    }
  },
  onHide: function () {},
  //点击这个订单的tab标签，即触发这个钩子
  onTabItemTap(item) {
    this.setData({
      showRatingsFlag: false,
    });
  },
  changeItemStatusActiveFlag: function (e) {
    this.setData({
      showShapeFlag: false,
    });
    if (this.data.getOrdersNow) {
      return;
    }
    this.setData({
      getOrdersNow: true,
    });

    if (e.currentTarget.dataset.flag == "jinridaiqu") {
      this.setData({
        itemStatusActiveFlag: 1,
        todayInit: true,
        checkOrderDate: new Date(),
      });
    } else if (e.currentTarget.dataset.flag == "quanbudingdan") {
      this.setData({
        itemStatusActiveFlag: 0,
        selectedDateFlag: false,
        selectedDate: false,
      });
    } else if (e.currentTarget.dataset.flag == "pingjia") {
      this.setData({
        itemStatusActiveFlag: 2,
      });
    }

    this.getOrderList(true);
  },
  initOrder: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
    const query = wx.createSelectorQuery();
    query.select(".c_scrollPosition_forCalculate").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].top, // #the-id节点的上边界坐标
      });
    });
  },
  //获取订单状态
  getOrderStatus(element) {
    let a = {
      has: true,
    };
    if (element.status == 1) {
      if (element.isPay == false) {
        a.label = "未支付";
        a.has = false;
        a.differentColor = true;
      } else {
        a.label = "已支付";
        a.differentColor = true;
      }
    } else if (element.status == 2) {
      if (element.confirmStatus == 2) {
        if (element.evaluateStatus == 1) {
          a.label = "待评价";
          a.differentColor = true;
        } else if (element.pickStatus == 1) {
          a.label = "待取餐";
          a.differentColor = true;
        } else if (element.deliveryStatus == 1) {
          a.label = "待配送";
          a.differentColor = true;
        } else if (element.deliveryStatus == 2) {
          a.label = "配送中";
          a.differentColor = true;
        } else {
          a.label = "制作中";
          a.differentColor = true;
        }
      } else {
        a.label = "已支付";
        a.differentColor = true;
      }
    } else if (element.status == 3) {
      a.label = "已完成";
    } else {
      a.label = "已取消";
    }
    return a;
  },

  handleFromDay() {
    let time = new Date(this.data.checkOrderDate).getTime();
    let now = new Date(time - 24 * 3600 * 1000);

    let current = new Date();
    if (
      now.getFullYear() == current.getFullYear() &&
      now.getMonth() == current.getMonth() &&
      now.getDate() == current.getDate()
    ) {
      this.setData({
        checkOrderDate: now,
        todayInitBack: true,
        todayInit: false,
      });
    } else {
      this.setData({
        checkOrderDate: now,
        todayInitBack: false,
        todayInit: false,
      });
    }
    this.getOrderList(true);
  },
  handleNextDay() {
    let time = new Date(this.data.checkOrderDate).getTime();
    let now = new Date(time + 24 * 3600 * 1000);

    let current = new Date();
    if (
      now.getFullYear() == current.getFullYear() &&
      now.getMonth() == current.getMonth() &&
      now.getDate() == current.getDate()
    ) {
      this.setData({
        checkOrderDate: now,
        todayInitBack: true,
        todayInit: false,
      });
    } else {
      this.setData({
        checkOrderDate: now,
        todayInitBack: false,
        todayInit: false,
      });
    }
    this.getOrderList(true);
  },
  backToday() {
    let time = new Date();
    this.setData({
      checkOrderDate: time,
      todayInitBack: true,
      todayInit: false,
    });

    this.getOrderList(true);
  },
  //选择筛选日期
  bindChangeDate: function (e) {
    const val = e.detail.value;
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]],
    });
  },
  /* 获取订单列表 */
  getOrderList: function (fromBegin) {
    let _this = this;
    _this.setData({
      getalready: false,
    });
    if (fromBegin) {
      _this.data.page = 1;
    }

    let mealDate = "";
    if (_this.data.itemStatusActiveFlag == 1) {
      //今日订单
      let a = new Date(_this.data.checkOrderDate);
      let month = a.getMonth() + 1;
      let day = a.getDate();
      let year = a.getFullYear();

      let weekday = new Array(7);
      weekday[0] = "周日";
      weekday[1] = "周一";
      weekday[2] = "周二";
      weekday[3] = "周三";
      weekday[4] = "周四";
      weekday[5] = "周五";
      weekday[6] = "周六";
      let b =
        (month < 10 ? "0" + month : month) +
        "月" +
        (day < 10 ? "0" + day : day) +
        "日" +
        " ( " +
        weekday[a.getDay()] +
        " )";
      _this.setData({
        checkOrderDateDes: b,
      });
      mealDate =
        year +
        "-" +
        (month < 10 ? "0" + month : month) +
        "-" +
        (day < 10 ? "0" + day : day);
    } else if (_this.data.itemStatusActiveFlag == 0) {
      //全部订单
      if (_this.data.selectedDateFlag) {
        mealDate = _this.data.selectedDate;
      }
    }
    _this.setData({
      loadingData: true,
    });
    let page = _this.data.page;
    let limit = _this.data.limit;

    let param = {
      url:
        "/order/getOrderList?userCode=" +
        _this.data.userCode +
        "&page=" +
        page +
        "&limit=" +
        limit +
        "&type=" +
        _this.data.itemStatusActiveFlag +
        (mealDate ? "&mealDate=" + mealDate : ""),
    };
    requestModel.request(param, (res) => {
      let tmp_orderList = res.list;
      if (tmp_orderList) {
        tmp_orderList.forEach((element) => {
          element.mealTypeDes = _this.data.mealTypeMap[element.mealType]; //类型
          element.orderStatusDes = _this.getOrderStatus(element); //订单状态

          let a = element.mealDate.split("-");

          element.takeMealTimeDes = a[1] + "月" + a[2] + "日";

          var d = new Date(element.mealDate);
          var weekday = new Array(7);
          weekday[0] = "周日";
          weekday[1] = "周一";
          weekday[2] = "周二";
          weekday[3] = "周三";
          weekday[4] = "周四";
          weekday[5] = "周五";
          weekday[6] = "周六";
          element.takeMealTimeDes =
            element.takeMealTimeDes + " (" + weekday[d.getDay()] + ") ";
          if (element.supplementtaryMeal == 1) {
            const fiveTime = moment(element.orderTime).subtract(-5, "minute");
            let tmpDiff = fiveTime.diff(moment(), "second");
            element.diff = tmpDiff > 0 ? Number(tmpDiff) : null;
            console.log(tmpDiff, element.diff); // 3600
          } else {
            element.djs = null;
          }
        });
        if (page == 1) {
          _this.setData({
            orderList: tmp_orderList,
          });
        } else {
          _this.setData({
            orderList: _this.data.orderList.concat(tmp_orderList),
          });
        }

        //下面开始分页
        if (page * limit >= res.amount) {
          _this.setData({
            hasMoreDataFlag: false,
          });
        } else {
          _this.setData({
            hasMoreDataFlag: true,
            page: page + 1,
          });
        }
      }
      _this.setData({
        getOrdersNow: false,
        loadingData: false,
        getalready: true,
      });
    });
  },
  /* 取消订单 */
  handleCancelOrder(e) {
    this.setData({
      cancelOrderCode: e.currentTarget.dataset.ordercode,
      cancelFlag: true,
      showShapeFlag: false,
    });
  },
  /* 取消取消订单 */
  handleCancelOrderWait() {
    this.setData({
      cancelOrderCode: "",
      cancelFlag: false,
    });
  },
  /* 确认取消订单 */
  handleCancelOrderConfirm() {
    if (this.data.cancelOrderCode) {
      // 防止出错
      this.setData({
        cancelFlag: false,
      });
      let _this = this;
      let param = {
        userCode: _this.data.userCode,
        orderCode: _this.data.cancelOrderCode,
      };
      let params = {
        data: param,
        url: "/order/cancelOrder",
        method: "post",
      };
      requestModel.request(params, () => {
        wx.showToast({
          title: "成功取消订单",
          duration: 1000,
        });
        setTimeout(() => {
          //先刷新列表，后面等志康有空了再只刷新这一个订单的信息5/18

          _this.getOrderList(true);
        }, 1000);
      });
    }
  },
  clickItemIcon(e) {
    let item = e;
    console.log("======= e ======= ", e.currentTarget.dataset.item);
    this.setData({
      showIcon: true,
      iconItem: e.currentTarget.dataset.item,
    });
  },
  confirmIcon() {
    this.setData({
      showIcon: false,
    });
  },
  /* radio选择支付方式 */
  radioChangeWechatPay() {
    this.setData({
      payType: "WECHAT_PAY",
    });
  },
  radioChange: function () {
    //可使用余额小于_this.data.realMoney
    if (this.data.canUseBalance < this.data.payPrice) {
      //如果用户余额少于用户需要支付的价格，不允许用余额,也就是禁止打开switch
      this.setData({
        payType: "BALANCE_MIX_WECHAT_PAY",
      });
    } else {
      this.setData({
        payType: "BALANCE_PAY",
      });
    }
  },
  /* 去付款的对话框的确定 */
  buttonClickYes: function () {
    if (
      this.data.payType == "WECHAT_PAY" ||
      this.data.payType == "BALANCE_MIX_WECHAT_PAY"
    ) {
      this.payNowByWx();
    } else {
      this.payNowByBalance();
    }

    this.setData({
      showPayTypeFlag: false,
    });
  },
  /* 去付款的对话框的取消 */
  buttonClickNo: function () {
    this.setData({
      showPayTypeFlag: false,
    });
  },
  /* 去付款 */
  handleSecondpayOrder: function (e) {
    this.setData({
      showShapeFlag: false,
    });
    let _this = this;

    let orderCode = e.currentTarget.dataset.ordercode;

    let param2 = {
      url:
        "/order/orderPayPre?userCode=" +
        _this.data.userCode +
        "&orderCode=" +
        orderCode,
    };
    requestModel.request(param2, (data2) => {
      let payPrice = data2.needPayMoney;
      let canMealTotalMoney = data2.canMealTotalMoney;
      requestModel.getUserInfo((userInfo) => {
        let { allowUserOrganizePayNoCanMeal } = userInfo;

        requestModel.getUserCode((userCode) => {
          let param = {
            url: "/user/getUserFinance?userCode=" + userCode,
          };
          requestModel.request(param, (data) => {
            let canUseBalance = data.allBalance;
            _this.data.balancePayMoney = data.allBalance;

            if (!allowUserOrganizePayNoCanMeal) {
              let organizePayBalance =
                data.organizeBalance < canMealTotalMoney
                  ? data.organizeBalance
                  : canMealTotalMoney;
              organizePayBalance = parseFloat(organizePayBalance);
              let remainMoney = payPrice - organizePayBalance;
              let personPayBalance =
                data.totalBalance < remainMoney
                  ? data.totalBalance
                  : remainMoney;
              let personBalance = data.totalBalance;
              let organizeBalance =
                data.totalBalance < remainMoney
                  ? organizePayBalance
                  : data.organizeBalance;
              canUseBalance =
                parseFloat(organizeBalance.toFixed(2)) +
                parseFloat(personBalance.toFixed(2));
              _this.data.balancePayMoney =
                parseFloat(organizePayBalance.toFixed(2)) +
                parseFloat(personPayBalance.toFixed(2));
            }

            if (canUseBalance == 0) {
              _this.setData({
                payType: "WECHAT_PAY",
              });
            } else if (canUseBalance >= payPrice) {
              _this.setData({
                payType: "BALANCE_PAY",
              });
            } else {
              _this.setData({
                payType: "BALANCE_MIX_WECHAT_PAY",
              });
            }
            _this.setData({
              canUseBalance,
              balanceDes: allowUserOrganizePayNoCanMeal
                ? "个人钱包"
                : "钱包余额",
              showPayTypeFlag: true,
              balanceEnough: payPrice == 0,
              payOrderCode: orderCode,
              payPrice,
            });
          });
        });
      });
    });
  },
  /* 去付款-微信支付 */
  payNowByWx: function () {
    let _this = this;
    if (!_this.data.canClick) {
      return;
    }
    _this.data.canClick = false;
    if (_this.data.timer) {
      clearTimeout(_this.data.timer);
    }
    _this.data.timer = setTimeout(function () {
      _this.data.canClick = true;
    }, 2000);

    let param = {
      userCode: _this.data.userCode,
      orderCode: _this.data.payOrderCode,
      payType: _this.data.payType,
    };
    if (_this.data.payType == "BALANCE_MIX_WECHAT_PAY") {
      param.balancePayMoney = _this.data.balancePayMoney;
      param.thirdPayMoney =
        parseFloat(_this.data.payPrice.toFixed(2)) -
        parseFloat(_this.data.balancePayMoney.toFixed(2));
    }
    let params = {
      data: param,
      url: "/order/orderPay",
      method: "post",
    };
    requestModel.request(params, (resdata) => {
      let data = resdata.payData;
      // 如果需要支付。选择微信支付哪还有不要支付的5/18
      if (resdata.needPay) {
        if (data.timeStamp) {
          wx.requestPayment({
            timeStamp: data.timeStamp.toString(),
            nonceStr: data.nonceStr,
            package: data.packageValue,
            signType: data.signType,
            paySign: data.paySign,
            success: function (e) {
              wx.showToast({
                title: "成功支付订单",
                image: "/images/msg/success.png",
                duration: 1000,
              });
              setTimeout(() => {
                _this.getOrderList(true);
              }, 1000);
            },
            fail: function (e) {
              wx.showToast({
                title: "已取消支付",
                image: "/images/msg/success.png",
                duration: 1000,
              });
            },
            complete: function () {
              wx.hideLoading();
            },
          });
        }
      }
    });
  },
  /* 去付款-余额支付 */
  payNowByBalance: function () {
    let _this = this;
    if (!_this.data.canClick) {
      return;
    }
    _this.data.canClick = false;
    if (_this.data.timer) {
      clearTimeout(_this.data.timer);
    }
    _this.data.timer = setTimeout(function () {
      _this.data.canClick = true;
    }, 2000);

    let param = {
      userCode: _this.data.userCode,
      orderCode: _this.data.payOrderCode,
      payType: "BALANCE_PAY",
    };

    let params = {
      data: param,
      url: "/order/orderPay",
      method: "post",
    };
    requestModel.request(params, (data) => {
      wx.showToast({
        title: "成功支付订单",
        image: "/images/msg/success.png",
        duration: 1000,
      });

      setTimeout(() => {
        _this.getOrderList(true);
      }, 1000);
    });
  },
  closeModal() {
    if (this.data.takeorderModalShow) {
      this.setData({
        takeorderModalShow: false,
      });
      //取餐后为啥要只刷第一页的啊
    }
    wx.showTabBar();
  },
  //取餐
  takeFoodOrder() {
    let _this = this;
    let ordercode = _this.data.takeOrderCode;
    let pickagain = _this.data.takeOrderPickagain;
    let param = {
      url:
        "/order/orderPick?userCode=" +
        _this.data.userCode +
        "&orderCode=" +
        ordercode +
        "&again=" +
        pickagain,
    };
    requestModel.request(param, () => {
      _this.setData({
        takeorderModalShow: false,
      });
      _this.getOrderList(true);
      wx.showTabBar();
    });
  },
  /* 去取餐 */
  handleTakeOrder: function (e) {
    let _this = this;
    let { ordercode, pickagain, cabinet } = e.currentTarget.dataset;
    //宁夏直接跳转电子凭证
    let organizeCode = wx.getStorageSync("userInfo").userInfo.organizeCode;
    let ningxiaOrgCode = getApp().globalData.ningxiaOrgnaizeCode;
    if (organizeCode === ningxiaOrgCode) {
      wx.navigateTo({
        url:
          "/pages/order/qrCode/qrCode?orderCode=" +
          e.currentTarget.dataset.ordercode,
      });
      return;
    }
    // 药明康德2000个大神吃饭，要求上线跳转到取餐码页面
    if (cabinet && cabinet.length == 0) {
      wx.navigateTo({
        url:
          "/pages/order/qrCodeBack/qrCodeBack?orderCode=" +
          e.currentTarget.dataset.ordercode,
      });
      return;
    }

    this.setData({
      showShapeFlag: false,
    });
    if (!_this.data.canClick) {
      return;
    }
    _this.data.canClick = false;

    //就调用接口加载柜子号
    let param = {
      url:
        "/order/orderPickPre?userCode=" +
        _this.data.userCode +
        "&orderCode=" +
        ordercode,
    };
    requestModel.request(param, (data) => {
      if (data) {
        _this.setData({
          takeorderData: data,
          takeorderModalShow: true,
          takeorderModalShowInit: false,
          takeOrderCode: ordercode,
          takeOrderPickagain: pickagain,
        });

        wx.hideTabBar();
      }
    });

    if (_this.data.timer) {
      clearTimeout(_this.data.timer);
    }
    _this.data.timer = setTimeout(function () {
      _this.data.canClick = true;
    }, 2000);
  },

  /* 去评价 */
  handleEvaluateOrder: function (e) {
    this.setData({
      showShapeFlag: false,
    });
    wx.navigateTo({
      url: "./comment/comment?orderCode=" + e.currentTarget.dataset.ordercode,
    });
  },
});
