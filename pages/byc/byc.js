import { base } from "../../comm/public/request";

let requestModel = new base();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasData: false,
    detailInfo: null,
    userInfo: {},

    payStatusMap: {
      THIRD_PAYED: "第三方支付",
      NO_PAYED: "未支付",
      STANDARD_PAYED: "标准支付",
    },
    payTypeMap: {
      ALI_PAY: "支付宝支付",
      WECHAT_PAY: "微信支付",
      BALANCE_PAY: "钱包支付",
      STANDARD_PAY: "标准支付",
    },
    mealTypeMap: {
      BREAKFAST: "早餐",
      LUNCH: "午餐",
      DINNER: "晚餐",
      NIGHT: "夜宵",
    },
  },

  onLoad: function (options) {
    let _this = this;
    let { userInfo } = wx.getStorageSync("userInfo");

    // http://192.168.110.187:9082/order/getSpareMealDetail?qrCode=DDC972496882272043008-8290-20&organizeCode=ORG530051032172986376
    requestModel.getUserCode((userCode) => {
      let param = {
        url:
          "/order/getSpareMealDetail?organizeCode=" +
          userInfo.organizeCode +
          "&qrCode=" +
          options.qrCode,
      };
      requestModel.request(param, (data) => {
        console.log("======= data ======= ", data);
        _this.setData({
          hasData: true,
        });
      });
    });
  },
  clickBack: function () {
    wx.reLaunch({
      url: "/pages/mine/mine",
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
