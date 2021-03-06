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

    code_w: code_w,
    pickStatus: -1,
    ningxiaOrgFlag: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let _this = this;
    let tmp_ningxiaOrgFlag = this.checkNingxia();
    if (tmp_ningxiaOrgFlag) {
      _this.setData({
        ningxiaOrgFlag: tmp_ningxiaOrgFlag,
      });
    }

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
        data.mealTypeDes;
        _this.setData(
          {
            detailInfo: data,
            userInfo: wx.getStorageSync("userInfo").userInfo,
          },
          () => {
            this.getOrderPickStatus();
            this.makeQrcode(data.orderCode);
          }
        );
      });
    });
  },
  // 判断是否是宁夏
  checkNingxia: function () {
    let organizeCode = wx.getStorageSync("userInfo").userInfo.organizeCode;
    let ningxiaOrgCode = getApp().globalData.ningxiaOrgnaizeCode;
    if (organizeCode === ningxiaOrgCode) {
      return true;
    } else {
      return false;
    }
  },
  makeQrcode: function (text) {
    qrcode = new QRCode("canvas", {
      text: text,
      width: code_w,
      height: code_w,
    });
  },

  // 获取订单取餐状态
  getOrderPickStatus: function () {
    let _this = this;
    let param = {
      userCode: wx.getStorageSync("userCode"),
      orderCode: _this.data.detailInfo.orderCode,
    };
    let params = {
      data: param,
      url: "/order/getPickStatus",
      method: "post",
    };
    requestModel.request(params, (result) => {
      _this.setData({
        pickStatus: result.pickStatus,
      });
    });
  },
  // 修改订单取餐状态 从未取餐改为已取餐
  updateOrderStatus: function () {
    let _this = this;
    let param = {
      userCode: wx.getStorageSync("userCode"),
      orderCode: _this.data.detailInfo.orderCode,
    };
    let params = {
      data: param,
      url: "/order/updatePickStatus",
      method: "post",
    };
    requestModel.request(params, (result) => {
      wx.showToast({
        title: "取餐成功",
        duration: 3000,
      });
      _this.getOrderPickStatus();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.getOrderPickStatus()
  },

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
