import { base } from "../../comm/public/request";
import moment from "../../comm/public/moment";
let requestModel = new base();

Page({
  data: {
    userInfo: {},

    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 5, // 每页条数
    hasMoreDataFlag: true, //是否还有更多数据  默认还有
    //

    //

    orderList: [],
    mealTypeMap: {
      BREAKFAST: "早餐",
      LUNCH: "午餐",
      DINNER: "晚餐",
      NIGHT: "夜宵",
    },
    //
    windowHeight: 0,
    scrollTop: 0,
    //
    from: null,
    showIcon: false,
    iconItem: {},
    btnType: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;

    _this.setData({
      userInfo: tmp_userInfo,
    });
    _this.init();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getList();
  },
  init: function () {
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
  //获取备用餐设置
  getList() {
    let _this = this;
    let userInfo = wx.getStorageSync("userInfo").userInfo;
    let obj = {
      mealDate: moment().format("YYYY-MM-DD"),
      // mealDate: "2022-11-22",
      userCode: userInfo.userCode,
    };
    let params = {
      data: obj,
      url: "/order/getSpareOrderList?userCode=" + userInfo.userCode,
      method: "post",
    };
    requestModel.qqRequest(params, (data) => {
      if (data.code == 200) {
        if (data.data && Array.isArray(data.data)) {
          data.data.map((item) => {
            if (item.mealType == "BREAKFAST") {
              item.mealTypeDes = "早餐";
            } else if (item.mealType == "LUNCH") {
              item.mealTypeDes = "午餐";
            } else if (item.mealType == "DINNER") {
              item.mealTypeDes = "晚餐";
            } else if (item.mealType == "NIGHT") {
              item.mealTypeDes = "夜宵";
            }
          });
          _this.setData({
            orderList: data.data,
          });
        }
      } else {
        wx.showToast({
          title: data.msg,
          duration: 1000,
        });
      }
    });
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
  clickBtn(e) {
    // wx.showToast({
    //   title: "功能暂停使用",
    //   icon: "none",
    //   duration: 2000,
    // });
    // return;
    this.setData({
      btnType: e.currentTarget.dataset.type,
    });
    wx.lin.showActionSheet({
      itemList: [
        {
          name: "午餐",
        },
        {
          name: "晚餐",
        },
      ],
    });
  },
  lintapItem(e) {
    let _this = this;
    let name = e.detail.item.name;
    let mealType = "";
    if (name == "午餐") {
      mealType = "LUNCH";
    } else if (name == "晚餐") {
      mealType = "DINNER";
    }
    if (this.data.btnType == "sm") {
      this.clickSm();
    } else if (this.data.btnType == "tg") {
      this.clickTg(mealType);
    }
  },
  clickSm() {
    wx.scanCode({
      success(res) {
        console.log("success", res);
        if (res.result) {
          wx.navigateTo({
            url: "/pages/byc/byc?type=sm&qrCode=" + res.result,
          });
        }
      },
      fail(res) {
        console.log("fail", res);
        wx.showModal({
          title: "提示",
          content: "二维码错误，请扫备用餐二维码",
          confirmText: "我知道了",
          showCancel: false,
        });
      },
      complete(res) {
        console.log("complete", res);
      },
    });
  },
  clickTg(mealType) {
    let _this = this;
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
    let params = {
      data: {
        mealDate: moment().format("YYYY-MM-DD"),
        mealType: mealType,
        deliveryAddressCode: _this.data.userInfo.deliveryAddressCode,
        userCode: _this.data.userInfo.userCode,
      },
      url: "/spareMealOrder/getVotedSpareMeal",
      method: "post",
    };

    requestModel.qqRequest(params, (data) => {
      wx.hideLoading();
      console.log("======= params ======= ", data);
      if (data.code == 200) {
        wx.navigateTo({
          url: "/pages/byc/byc?type=tg&qrCode=" + data.data.qrCode,
        });
      } else {
        wx.showToast({
          title: data.msg,
          icon: "none",
          duration: 2000,
        });
      }
    });
  },
});
