import { base } from "../../comm/public/request";

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
  },

  onLoad: function (options) {
    let _this = this;
    let { userInfo } = wx.getStorageSync("userInfo");
    _this.setData({
      userInfo: userInfo,
      qrCode: options.qrCode,
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
  // 支付
  clickZf: function () {
    let _this = this;
    if (_this.data.detailInfo.payType == "NONE") {
      wx.showToast({
        title: "余额不足",
        icon: "none",
        duration: 2000,
      });
      return;
    }
    let obj = {
      qrCode: _this.data.qrCode,
      userCode: _this.data.userInfo.userCode,
      userName: _this.data.userInfo.userName,
      phoneNumber: _this.data.userInfo.phoneNumber,
    };
    let param = {
      data: obj,
      method: "post",
      url: "/order/spareMealOrderScanPay",
    };
    requestModel.qqRequest(param, (data) => {
      if (data.code == 200) {
        let payData = data.data.payData;
        wx.requestPayment({
          timeStamp: payData.timeStamp.toString(),
          nonceStr: payData.nonceStr,
          package: payData.packageValue,
          signType: payData.signType,
          paySign: payData.paySign,
          success: function (e) {
            setTimeout(function () {
              wx.navigateTo({
                url: "/pages/byc/bycOrder",
              });
            }, 200);
          },
          fail: function (e) {
            console.log("======= fail ======= ");
            let param = {
              url:
                "/order/cancelSpareOrderAndTrade?qrCode=" + _this.data.qrCode,
              method: "post",
            };
            requestModel.qqRequest(param, (data) => {
              if (data.code == 200) {
                wx.showToast({
                  title: "已取消下单",
                  duration: 1000,
                });
              } else {
                wx.showToast({
                  title: data.msg,
                  duration: 1000,
                });
              }
            });
          },
        });
      } else {
        wx.showModal({
          title: "提示",
          content: data.msg,
          confirmText: "返回上一页",
          showCancel: false,
          success(res) {
            if (res.confirm) {
              console.log("用户点击确定");
              wx.reLaunch({
                url: "/pages/mine/mine",
              });
            } else if (res.cancel) {
              console.log("用户点击取消");
            }
          },
        });
      }
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