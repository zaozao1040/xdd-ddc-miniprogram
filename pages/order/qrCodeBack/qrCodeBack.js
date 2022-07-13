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
    colorDark: "#999999", // "#999999"  "#f79c4c"
    //
    isYmkd: false, //是否药明康德
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    let _this = this;
    // 针对 药明康德 企业，要先判断是否开启了“先评价后点餐”的个性化设置
    let ymkdOrgnaizeCodeList = getApp().globalData.ymkdOrgnaizeCodeList;
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
    let organizeCode = tmp_userInfo ? tmp_userInfo.organizeCode : "";
    if (ymkdOrgnaizeCodeList.indexOf(organizeCode) != -1) {
      _this.setData({
        isYmkd: true,
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
        let tmp_colorDark = "";
        if (data.pickStatus == 0 || data.pickStatus == 2) {
          tmp_colorDark = "#999999";
        } else if (data.pickStatus == 1) {
          tmp_colorDark = "#f79c4c";
        }
        _this.setData(
          {
            userCode: userCode,
            colorDark: tmp_colorDark,
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
      let tmp_colorDark = "";
      if (data.pickStatus == 0 || data.pickStatus == 2) {
        tmp_colorDark = "#999999";
      } else if (data.pickStatus == 1) {
        tmp_colorDark = "#f79c4c";
      }
      _this.setData(
        {
          colorDark: tmp_colorDark,
          pickStatus: data.pickStatus,
          detailInfo: data,
        },
        () => {
          _this.makeQrcode(_this.data.orderCode);
        }
      );
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
          let params = {
            data: {},
            url:
              "/v4/order/updatePickStatus?userCode=" +
              wx.getStorageSync("userCode") +
              "&orderCode=" +
              _this.data.detailInfo.orderCode,
            method: "get",
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
