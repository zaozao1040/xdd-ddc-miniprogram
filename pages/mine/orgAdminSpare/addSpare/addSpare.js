import { base } from "../../../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},

    address: "",

    //
    balance: 0,
    canUseBalance: true, // 这里为了简化 就不做灰色处理了 一直都是true
    payType: "init",
    orderPayMoney: 0,
    spareNum: 1,
    standardPriceDikou: 0,

    orgadmin: false, //是否是企业管理员
    showQbWx: true, //展示钱包支付和微信支付
    showQy: true, //展示企业支付

    //
    spareInfo: {},
    getSpareMealSetParams: {},
    orgAddressInfo: {}, //这个参数其实是前两个页面选中的企业地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.setData({
      orgadmin: options.orgadmin,
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
    let _this = this;
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
    _this.setData(
      {
        userInfo: tmp_userInfo,
      },
      () => {
        _this.loadData();
      }
    );
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
  loadData() {
    let _this = this;
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2]; //上一个页面
    _this.setData({
      //这2个参数保存一下
      getSpareMealSetParams: prevPage.data.getSpareMealSetParams,
      orgAddressInfo: prevPage.data.orgAddressInfo,
    });
    _this.getUserPayBalance();
  },
  //获取设置
  getSpareMealSet() {
    let _this = this;
    let params = {
      data: _this.data.getSpareMealSetParams,
      url: "/spare/getSpareMealSet",
      method: "post",
    };
    let tmp_selectOrganizeInfo = wx.getStorageSync("selectOrganizeInfo"); //处理外来人员情况 需要传选择的organizeCode
    if (
      tmp_selectOrganizeInfo &&
      _this.data.userInfo.organizeCode == "ORGVISTORE530053156613128193"
    ) {
      params.data.organizeCode = tmp_selectOrganizeInfo.organizeCode;
    }
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

      _this.setData(
        {
          spareInfo: res,
        },
        () => {
          if (res.spareNum == 0) {
            wx.showModal({
              title: "库存不足",
              confirmText: "返回",
              success: function (res) {
                wx.reLaunch({
                  url: "/pages/mine/mine",
                });
              },
            });
          } else {
            if (_this.data.orgadmin == "yes") {
              if (res.standardPrice == 0) {
                //餐标为0 则等同于普通员工 需要根据res.userCanStandardPrice来判断本次支付是否可用餐标
                _this.putong();
              } else {
                //餐标大于0 则用标准支付 无论多少钱支付金额都为0
                _this.setData({
                  showQbWx: false,
                  showQy: true,
                  orderPayMoney: 0,
                  payType: "STANDARD_PAY",
                });
              }
            } else if (_this.data.orgadmin == "no") {
              _this.putong();
            }
          }
        }
      );
    });
  },
  // 普通员工处理 （管理员有一个场景和这里一致 ，所以封装一下）
  putong() {
    let _this = this;
    _this.setData(
      {
        showQbWx: true,
        showQy: false,
        payType: "WECHAT_PAY",
      },
      () => {
        _this.renderOrderPayMoney();
      }
    );
  },
  // 计算金额 参数：支付方式 是否可用餐标 餐标金额
  renderOrderPayMoney() {
    let _this = this;
    // _this.data.spareInfo.sparePrice = 1; //测试用
    let standardPriceDikou = _this.data.spareInfo.userCanStandardPrice
      ? _this.data.spareInfo.standardPrice
      : 0; //餐标抵扣 允许用餐标则正常抵扣，不允许则抵扣0

    let tmp_tmp_orderPayMoney = parseFloat(
      _this.data.spareNum * _this.data.spareInfo.sparePrice - standardPriceDikou
    ).toFixed(2); // 实际需要付款的价格 用来和余额比较大小
    let tmp_orderPayMoney =
      tmp_tmp_orderPayMoney > 0 ? tmp_tmp_orderPayMoney : 0;
    _this.setData({
      orderPayMoney: tmp_orderPayMoney,
    });
  },

  minus() {
    let _this = this;
    if (_this.data.spareNum > 1) {
      if (_this.data.payType == "STANDARD_PAY") {
        _this.setData(
          {
            spareNum: _this.data.spareNum - 1,
          },
          () => {
            if (_this.data.spareInfo.standardPrice == 0) {
              //餐标为0 则等同于普通员工 需要根据res.userCanStandardPrice来判断本次支付是否可用餐标
              _this.putong();
            } else {
              //餐标大于0 则用标准支付 无论多少钱支付金额都为0
              _this.setData({
                orderPayMoney: 0,
              });
            }
          }
        );
      } else {
        _this.setData(
          {
            spareNum: _this.data.spareNum - 1,
          },
          () => {
            _this.renderOrderPayMoney();
          }
        );
      }
    } else {
      wx.showToast({
        title: "至少一份",
        icon: "none",
      });
    }
  },
  add() {
    let _this = this;
    if (_this.data.spareNum < _this.data.spareInfo.spareNum) {
      if (_this.data.payType == "STANDARD_PAY") {
        _this.setData(
          {
            spareNum: _this.data.spareNum + 1,
          },
          () => {
            if (_this.data.spareInfo.standardPrice == 0) {
              //餐标为0 则等同于普通员工 需要根据res.userCanStandardPrice来判断本次支付是否可用餐标
              _this.putong();
            } else {
              //餐标大于0 则用标准支付 无论多少钱支付金额都为0
              _this.setData({
                orderPayMoney: 0,
              });
            }
          }
        );
      } else if (_this.data.payType == "BALANCE_PAY") {
        let standardPriceDikou = _this.data.spareInfo.userCanStandardPrice
          ? _this.data.spareInfo.standardPrice
          : 0; //餐标抵扣 允许用餐标则正常抵扣，不允许则抵扣0

        let tmp_tmp_orderPayMoney = parseFloat(
          (_this.data.spareNum + 1) * _this.data.spareInfo.sparePrice -
            standardPriceDikou
        ).toFixed(2); // 实际需要付款的价格 用来和余额比较大小
        let tmp_orderPayMoney =
          tmp_tmp_orderPayMoney > 0 ? tmp_tmp_orderPayMoney : 0;

        if (tmp_orderPayMoney > _this.data.balance) {
          wx.showToast({
            title: "余额不足",
            icon: "none",
          });
        } else {
          _this.setData(
            {
              spareNum: _this.data.spareNum + 1,
            },
            () => {
              _this.renderOrderPayMoney();
            }
          );
        }
      } else if (_this.data.payType == "WECHAT_PAY") {
        _this.setData(
          {
            spareNum: _this.data.spareNum + 1,
          },
          () => {
            _this.renderOrderPayMoney();
          }
        );
      }
    } else {
      wx.showToast({
        title: "不能超过库存上限",
        icon: "none",
      });
    }
  },

  handleChangeWechatPayFlag() {
    let _this = this;
    _this.setData(
      {
        payType: "WECHAT_PAY",
      },
      () => {
        _this.renderOrderPayMoney();
      }
    );
  },
  handleChangeBalancePayFlag() {
    let _this = this;
    if (_this.data.orderPayMoney > _this.data.balance) {
      wx.showToast({
        title: "余额不足",
        icon: "none",
      });
    } else {
      _this.setData(
        {
          payType: "BALANCE_PAY",
        },
        () => {
          _this.renderOrderPayMoney();
        }
      );
    }
  },
  clickPay() {
    let _this = this;
    wx.showModal({
      title: "确认",
      content: "备用餐 x" + _this.data.spareNum + " 份",
      success: function (res) {
        if (res.confirm) {
          if (_this.data.orderPayMoney < 0) {
            wx.showToast({
              title: "余额不足",
              icon: "none",
            });
            return;
          }
          let tmp_orgAdmin = null;
          if (_this.data.orgadmin == "yes") {
            tmp_orgAdmin = true;
          }
          if (_this.data.orgadmin == "no") {
            tmp_orgAdmin = false;
          }
          requestModel.request(
            {
              url:
                "/order/getOrderVerificationString?userCode=" +
                wx.getStorageSync("userCode"),
            },
            (respVer) => {
              let tmp_organizeCode = _this.data.userInfo.organizeCode;
              if (
                // 外来人员 情况
                _this.data.userInfo.organizeCode ==
                "ORGVISTORE530053156613128193"
              ) {
                tmp_organizeCode =
                  wx.getStorageSync("selectOrganizeInfo").organizeCode;
              }
              let params = {
                data: {
                  verificationString: respVer,
                  organizeCode: tmp_organizeCode,
                  userCode: wx.getStorageSync("userCode"),
                  deliveryAddressCode:
                    _this.data.orgAddressInfo.deliveryAddressCode,
                  mealDate: _this.data.spareInfo.mealDate,
                  mealType: _this.data.spareInfo.mealType,
                  userName: _this.data.userInfo.userName,
                  orderPayMoney: _this.data.orderPayMoney,
                  spareNum: _this.data.spareNum,
                  orgAdmin: tmp_orgAdmin,
                  payType: _this.data.payType,
                  spareLineCode: _this.data.spareInfo.spareLineCode,
                },
                url: "/order/generateSpareOrder",
                method: "post",
              };
              wx.showLoading();
              requestModel.request(params, (data) => {
                if (_this.data.payType == "WECHAT_PAY") {
                  //微信支付
                  if (data.payData) {
                    wx.requestPayment({
                      timeStamp: data.payData.timeStamp.toString(),
                      nonceStr: data.payData.nonceStr,
                      package: data.payData.packageValue,
                      signType: data.payData.signType,
                      paySign: data.payData.paySign,
                      success: function (e) {
                        wx.showToast({
                          title: "订单已生成",
                          icon: "success",
                          duration: 2000,
                        });
                        wx.hideLoading();
                        setTimeout(function () {
                          wx.navigateTo({
                            url:
                              "/pages/mine/orgAdminSpare/orgAdminSpare?orgadmin=" +
                              _this.data.orgadmin,
                          });
                        }, 2000);
                      },
                      fail: function (e) {
                        wx.showToast({
                          title: "订单未支付",
                          icon: "none",
                          duration: 2000,
                        });

                        wx.hideLoading();
                        setTimeout(function () {
                          wx.navigateTo({
                            url:
                              "/pages/mine/orgAdminSpare/orgAdminSpare?orgadmin=" +
                              _this.data.orgadmin,
                          });
                        }, 2000);
                      },
                    });
                  } else {
                    wx.showToast({
                      title: "订单已生成",
                      icon: "success",
                      duration: 2000,
                    });
                    wx.hideLoading();
                    setTimeout(function () {
                      wx.reLaunch({
                        url:
                          "/pages/mine/orgAdminSpare/orgAdminSpare?orgadmin=" +
                          _this.data.orgadmin,
                      });
                    }, 2000);
                  }
                } else {
                  wx.showToast({
                    title: "订单已生成",
                    icon: "success",
                    duration: 2000,
                  });
                  wx.hideLoading();
                  setTimeout(function () {
                    wx.reLaunch({
                      url:
                        "/pages/mine/orgAdminSpare/orgAdminSpare?orgadmin=" +
                        _this.data.orgadmin,
                    });
                  }, 2000);
                }
              });
            },
            true
          );
        }
      },
    });
  },

  lintapItem(e) {
    let _this = this;
    let { item } = e.detail;
    if (item.address) {
      _this.setData({
        orgAddressInfo: item,
      });
    }
  },
  getUserPayBalance() {
    let _this = this;
    let param = {
      url: "/user/getUserPayBalance?userCode=" + wx.getStorageSync("userCode"),
    };
    requestModel.request(
      param,
      (data) => {
        _this.setData(
          {
            balance: data,
          },
          () => {
            _this.getSpareMealSet();
          }
        );
      },
      true
    );
  },
  // 企业管理员下单
  clickPayOrgadmin() {
    let _this = this;
    wx.showModal({
      title: "确认",
      content: "备用餐 x" + _this.data.spareNum + " 份",
      success: function (res) {
        if (res.confirm) {
          let params = {
            data: {
              organizeCode: _this.data.userInfo.organizeCode,
              userCode: wx.getStorageSync("userCode"),
              deliveryAddressCode:
                _this.data.orgAddressInfo.deliveryAddressCode,
              mealDate: _this.data.spareInfo.mealDate,
              mealType: _this.data.spareInfo.mealType,
              userName: _this.data.userInfo.userName,
              orderPayMoney: _this.data.orderPayMoney,
              spareNum: _this.data.spareNum,
              orgAdmin: true,
              payType: _this.data.payType,
              spareLineCode: _this.data.spareInfo.spareLineCode,
            },
            url: "/order/generateSpareOrder",
            method: "post",
          };
          requestModel.request(params, (data) => {
            console.log("@@@@@@@ 2 @@@@@@@ ", data);
          });
        }
      },
    });
  },
});
