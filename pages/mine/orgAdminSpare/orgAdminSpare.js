import { base } from "../../../comm/public/request";

let requestModel = new base();

Page({
  data: {
    orgadmin: false, //是否是企业管理员
    userInfo: {},
    spareInfo: {},
    //
    timer: null,
    canClick: true,
    listCanGet: true,
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 5, // 每页条数
    hasMoreDataFlag: true, //是否还有更多数据  默认还有
    //

    payType: "BALANCE_PAY",
    //评价
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
    checkOrderDate: "", //今日待取的日期
    checkOrderDateDes: "",
    selectedDate: null, //全部订单的日期
    selectedDateFlag: false,
  },
  bindDateChange(e) {
    if (e.detail && e.detail.value)
      this.setData({
        selectedDate: e.detail.value,
        selectedDateFlag: true,
      });
    this.getOrderList();
  },

  /* 跳转订单详情 */
  handleGotoOrderDetail: function (e) {
    wx.navigateTo({
      url: "/pages/order/detail?orderCode=" + e.currentTarget.dataset.ordercode,
    });
  },

  //跳转到点餐页面
  handleGotoSpare() {
    let _this = this;
    wx.navigateTo({
      url:
        "/pages/mine/orgAdminSpare/addSpare/addSpare?orgadmin=" +
        _this.data.orgadmin,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
    _this.setData(
      {
        userInfo: tmp_userInfo,
        orgadmin: options.orgadmin,
      },
      () => {
        _this.initOrder();
        _this.getOrderList();
        _this.getSpareMealSet();
      }
    );
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},
  //获取设置
  getSpareMealSet() {
    let _this = this;
    let params = {
      data: {
        organizeCode: _this.data.userInfo.organizeCode,
        userCode: wx.getStorageSync("userCode"),
        deliveryAddressCode: _this.data.userInfo.deliveryAddressCode,
      },
      url: "/spare/getSpareMealSet",
      method: "post",
    };
    requestModel.request(params, (res) => {
      if (res.mealType == "BREAKFAST") {
        res.mealTypeDes = "早餐";
      } else if (res.mealType == "LUNCH") {
        res.mealTypeDes = "午餐";
      } else if (res.mealType == "DINNER") {
        res.mealTypeDes = "晚餐";
      } else if (res.mealType == "NIGHT") {
        res.mealTypeDes = "夜宵";
      }

      _this.setData({
        spareInfo: res,
      });
    });
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
      if (element.isPay == 0) {
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

  /* 获取订单列表 */
  getOrderList: function () {
    let _this = this;
    let param = {
      url:
        "/spare/getSpareOrder?userCode=" +
        _this.data.userInfo.userCode +
        "&organizeCode=" +
        _this.data.userInfo.organizeCode,
    };
    requestModel.request(param, (res) => {
      _this.setData({
        orderList: res.list,
        loadingData: false,
      });
    });
  },
  /* 取消订单 */
  handleCancelOrder(e) {
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

        _this.getOrderList();
      }, 1000);
    });
  },
});
