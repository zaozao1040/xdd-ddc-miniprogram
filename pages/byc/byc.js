import { base } from "../../comm/public/request";
import jiuaiDebounce from "../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    hasData: false,
    detailInfo: {
      totalBalance: 0,
      payType: "STANDARD_PAY",
    },
    userInfo: {},
    qrCode: "",
    errMsg: "",
    //
    selectCb: true,
    selectYe: false,
    showConfirm: false,
    type: "sm", //sm 扫码下单   tg 投柜下单
  },

  onLoad: function (options) {
    let _this = this;
    let { userInfo } = wx.getStorageSync("userInfo");
    _this.setData({
      userInfo: userInfo,
      qrCode: options.qrCode,
      type: options.type,
    });

    let param = {
      url:
        "/order/getSpareMealDetail?organizeCode=" +
        userInfo.organizeCode +
        "&qrCode=" +
        options.qrCode +
        "&userCode=" +
        userInfo.userCode,
    };
    requestModel.qqRequest(param, (data) => {
      if (data.code == 200) {
        if (data.data.payType == "NONE") {
          _this.setData({
            hasData: false,
            errMsg: "备用餐价格未设置,请联系客服",
          });
        } else {
          let mealTypeMap = {
            LUNCH: "午餐",
            DINNER: "晚餐",
            BREAKFAST: "早餐",
            NIGHT: "夜宵",
          };
          data.data.mealTypeDes = mealTypeMap[data.data.mealType];
          _this.setData({
            hasData: true,
            detailInfo: data.data,
          });
        }
      } else {
        _this.setData({
          hasData: false,
          errMsg: data.msg,
        });
      }
    });
  },
  clickBack: function () {
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
      success: function (res) {
        // success
      },
      fail: function () {
        // fail
      },
      complete: function () {
        // complete
      },
    });
  },
  clickIcon: function () {
    wx.showToast({
      title: "暂不支持切换",
      icon: "none",
      duration: 2000,
    });
  },
  clickCancel: function () {
    this.setData({
      showConfirm: false,
    });
  },
  clickConfirm: function () {
    this.setData({
      showConfirm: false,
    });
    this.doConfirm();
  },
  clickZf: function () {
    this.setData({
      showConfirm: true,
    });
  },
  // 支付
  doConfirm: function () {
    let _this = this;
    if (
      _this.data.detailInfo.payType == "NONE" ||
      (_this.data.detailInfo.payType == "BALANCE_PAY" &&
        _this.data.detailInfo.totalBalance <
          _this.data.detailInfo.standardPrice)
    ) {
      wx.showToast({
        title: "余额不足",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_clickZf",
      time: 3000,
      success: () => {
        let obj = {
          qrCode: _this.data.qrCode,
          userCode: _this.data.userInfo.userCode,
          userName: _this.data.userInfo.userName,
          phoneNumber: _this.data.userInfo.phoneNumber,
          actualPayPrice: _this.data.detailInfo.actualPayPrice,
          reportMealStandardPrice:
            _this.data.detailInfo.reportMealStandardPrice,
          standardPrice: _this.data.detailInfo.standardPrice,
          payType: _this.data.detailInfo.payType,
          organizeCode: _this.data.userInfo.organizeCode,
        };
        let param = {
          data: obj,
          method: "post",
          url: "/order/spareMealOrderScanPay",
        };
        requestModel.qqRequest(param, (data) => {
          if (data.code == 200) {
            if (_this.data.type == "sm") {
              wx.showToast({
                title: "支付成功",
                icon: "none",
                duration: 2000,
              });
              setTimeout(function () {
                wx.redirectTo({
                  url: "/pages/byc/bycOrder",
                });
              }, 2000);
            } else if (_this.data.type == "tg") {
              wx.showModal({
                title: "支付成功，是否取餐？",
                content:
                  "柜号：" +
                  data.data.cabinetSort +
                  "-" +
                  data.data.cellShowSort,
                confirmText: "开柜取餐",
                cancelText: "等一等",
                showCancel: true,
                success: function (res) {
                  console.log("======= res ======= ", res);
                  if (res.confirm) {
                    _this.takeFoodOrderPlus(data.data);
                  } else {
                    wx.redirectTo({
                      url: "/pages/byc/bycOrder",
                    });
                  }
                },
              });
            }
          } else {
            wx.showToast({
              title: "支付失败",
              icon: "none",
              duration: 2000,
            });
            let param = {
              url:
                "/order/cancelSpareOrderAndTrade?qrCode=" + _this.data.qrCode,
              method: "post",
            };
            requestModel.qqRequest(param, (data) => {});
            setTimeout(function () {
              wx.redirectTo({
                url: "/pages/byc/bycOrder",
              });
            }, 2000);
          }
        });
      },
    });
  },
  //取餐
  takeFoodOrderPlus(obj) {
    let _this = this;
    let param = {
      url:
        "/spareMealOrder/orderPick?userCode=" +
        wx.getStorageSync("userCode") +
        "&orderCode=" +
        _this.data.detailInfo.orderCode +
        "&cabinetNumber=" +
        obj.cabinetSort +
        "&cellNumber=" +
        obj.cellSort +
        "&cellId=" +
        obj.cellId,
    };
    requestModel.qqRequest(param, (data) => {
      if (data.code == 200) {
        wx.showToast({
          title: "已开柜",
          icon: "none",
          duration: 2000,
        });
        setTimeout(function () {
          wx.redirectTo({
            url: "/pages/byc/bycOrder",
          });
        }, 2000);
      }
      console.log("======= data ======= ", data);
    });
  },

  //  微信支付  -- 暂时不用
  // clickZf: function () {
  //   let _this = this;
  //   let obj = {
  //     qrCode: _this.data.qrCode,
  //     userCode: _this.data.userInfo.userCode,
  //     userName: _this.data.userInfo.userName,
  //     phoneNumber: _this.data.userInfo.phoneNumber,
  //   };
  //   let param = {
  //     data: obj,
  //     method: "post",
  //     url: "/order/spareMealOrderScanPay",
  //   };
  //   requestModel.qqRequest(param, (data) => {
  //     if (data.code == 200) {
  //       let payData = data.data.payData;
  //       wx.requestPayment({
  //         timeStamp: payData.timeStamp.toString(),
  //         nonceStr: payData.nonceStr,
  //         package: payData.packageValue,
  //         signType: payData.signType,
  //         paySign: payData.paySign,
  //         success: function (e) {
  //           setTimeout(function () {
  //             wx.navigateTo({
  //               url: "/pages/byc/bycOrder",
  //             });
  //           }, 200);
  //         },
  //         fail: function (e) {
  //           console.log("======= fail ======= ");
  //           let param = {
  //             url:
  //               "/order/cancelSpareOrderAndTrade?qrCode=" + _this.data.qrCode,
  //             method: "post",
  //           };
  //           requestModel.qqRequest(param, (data) => {
  //             if (data.code == 200) {
  //               wx.showToast({
  //                 title: "已取消下单",
  //                 duration: 1000,
  //               });
  //             } else {
  //               wx.showToast({
  //                 title: data.msg,
  //                 duration: 1000,
  //               });
  //             }
  //           });
  //         },
  //       });
  //     } else {
  //       wx.showModal({
  //         title: "提示",
  //         content: data.msg,
  //         confirmText: "返回上一页",
  //         showCancel: false,
  //         success(res) {
  //           if (res.confirm) {
  //             console.log("用户点击确定");
  //             wx.reLaunch({
  //               url: "/pages/mine/mine",
  //             });
  //           } else if (res.cancel) {
  //             console.log("用户点击取消");
  //           }
  //         },
  //       });
  //     }
  //   });
  // },
});
