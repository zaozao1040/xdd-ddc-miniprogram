var QRCode = require("../../../comm/public/weapp-qrcode.js");
var qrcode;
const W = wx.getSystemInfoSync().windowWidth;
const rate = 750.0 / W;
const code_w = 300 / rate;

import { base } from "../../../comm/public/request";

let requestModel = new base();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    detailInfo: {},
    userCode: "",
    orderCode: "",
    code_w: code_w,
    pickStatus: -1, //0-不可取餐  1-可取餐  2-已取餐
    colorDark: "#f79c4c", // "#FFFFFF"  "#f79c4c"
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let _this = this;
    requestModel.getUserCode((userCode) => {
      let param = {
        url:
          "/order/getOrderDetail?userCode=" +
          userCode +
          "&orderCode=" +
          options.orderCode,
      };
      requestModel.request(param, (data) => {
        if (data.mealType == "BREAKFAST") {
          data.mealTypeDes = "早餐";
        } else if (data.mealType == "LUNCH") {
          data.mealTypeDes = "午餐";
        } else if (data.mealType == "DINNER") {
          data.mealTypeDes = "晚餐";
        } else if (data.mealType == "NIGHT") {
          data.mealTypeDes = "夜宵";
        }
        _this.setData(
          {
            userCode: userCode,
            orderCode: options.orderCode,
            pickStatus: data.pickStatus,
            detailInfo: data,
            userInfo: wx.getStorageSync("userInfo").userInfo,
          },
          () => {
            this.makeQrcode(data.orderCode);
          }
        );
      });
    });
  },

  makeQrcode: function (text) {
    let _this = this;
    qrcode = new QRCode("canvas", {
      text: text,
      width: code_w,
      height: code_w,
      colorDark: _this.data.colorDark,
    });
  },

  // 获取订单详情
  getOrderDetail: function () {
    let _this = this;
    let param = {
      url:
        "/order/getOrderDetail?userCode=" +
        _this.data.userCode +
        "&orderCode=" +
        _this.data.orderCode,
    };
    requestModel.request(param, (data) => {
      if (data.mealType == "BREAKFAST") {
        data.mealTypeDes = "早餐";
      } else if (data.mealType == "LUNCH") {
        data.mealTypeDes = "午餐";
      } else if (data.mealType == "DINNER") {
        data.mealTypeDes = "晚餐";
      } else if (data.mealType == "NIGHT") {
        data.mealTypeDes = "夜宵";
      }
      _this.setData({
        pickStatus: data.pickStatus,
        detailInfo: data,
      });
    });
  },
  // 修改订单取餐状态 从未取餐改为已取餐
  updateOrderStatus: function () {
    let _this = this;

    wx.showModal({
      title: "确定取餐?",
      content: "请与服务人员当面取餐",
      confirmText: "确定",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          let param = {
            userCode: wx.getStorageSync("userCode"),
            orderCode: _this.data.detailInfo.orderCode,
          };
          let params = {
            data: param,
            url: "/v4/order/updatePickStatus",
            method: "post",
          };
          requestModel.request(params, (result) => {
            wx.showToast({
              title: "取餐成功",
              duration: 3000,
            });
            _this.getOrderDetail();
          });
        }
      },
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