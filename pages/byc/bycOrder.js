import { base } from "../../comm/public/request";
import moment from "../../comm/public/moment";

let requestModel = new base();

Page({
  data: {
    userInfo: {},
    list: [],

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
      userCode: userInfo.userCode,
    };
    let params = {
      data: obj,
      url:
        "/order/getSpareOrderList?mealDate=" +
        moment().format("YYYY-MM-DD") +
        "&userCode=" +
        userInfo.userCode,
      method: "post",
    };
    requestModel.qqRequest(params, (data) => {
      if (data.code == 200) {
      } else {
        wx.showToast({
          title: data.msg,
          duration: 1000,
        });
      }

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
        list: data.data,
      });
    });
  },
});
