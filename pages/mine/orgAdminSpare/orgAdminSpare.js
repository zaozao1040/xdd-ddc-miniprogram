import { base } from "../../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    spareInfo: {},

    //送餐地址
    organizeAddressList: [],
    currentAddressIndex: 0,
    deliveryAddressCode: "",
    address: "",

    //
    balance: 0,
    canUseBalance: false,
    payType: "init",
    orderPayMoney: 0,
    spareNum: 1,
    standardPriceDikou: 0,

    // 企业管理员 流程简单多
    orderPayMoneyOrgadmin: 0,

    orgadmin: false, //是否是企业管理员
    showQbWx: true, //展示钱包支付和微信支付
    showQy: true, //展示企业支付
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("@@@@@@@ 2 @@@@@@@ ", options.orgadmin);

    let _this = this;
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
    _this.setData(
      {
        userInfo: tmp_userInfo,
        orgadmin: options.orgadmin,
      },
      () => {
        _this.loadData();
      }
    );
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
  loadData() {
    let _this = this;
    _this.getUserFinance();
    _this.getOrganizeAddressList();
  },
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
      let tmp_showQbWx = _this.data.showQbWx; // 默认都是true展示
      let tmp_showQy = _this.data.showQy; // 默认都是true展示
      if (res.userCanStandardPrice && _this.data.orgadmin == "yes") {
        // 如果既是企业管理员又可用餐标 则不展示QbWx
        tmp_showQbWx = false;
      }
      if (_this.data.orgadmin == "no") {
        // 如果是普通用户
        tmp_showQy = false;
      }
      _this.setData(
        {
          showQbWx: tmp_showQbWx,
          showQy: tmp_showQy,
          spareInfo: res,
        },
        () => {
          _this.jisuan("init");
        }
      );
    });
  },
  jisuan(payType) {
    let _this = this;
    // _this.data.spareInfo.sparePrice = 1; //测试用
    let standardPriceDikou = _this.data.spareInfo.userCanStandardPrice
      ? _this.data.spareInfo.standardPrice
      : 0; //餐标抵扣 允许用餐标则正常抵扣，不允许则抵扣0

    let tmp_orderPayMoney = parseFloat(
      _this.data.spareNum * _this.data.spareInfo.sparePrice - standardPriceDikou
    ).toFixed(2); // 实际需要付款的价格 用来和余额比较大小
    let tmp_canUseBalance = _this.data.canUseBalance;
    let tmp_payType = payType;

    let tmp_orderPayMoney_forJisuan = 0;
    if (payType == "init") {
      if (_this.data.orgadmin == "yes") {
        tmp_payType = "STANDARD_PAY";
      } else if (tmp_orderPayMoney > _this.data.balance) {
        tmp_payType = "WECHAT_PAY";
        tmp_canUseBalance = false;
      } else {
        tmp_payType = "BALANCE_PAY";
        tmp_canUseBalance = true;
        tmp_orderPayMoney_forJisuan = parseFloat(
          _this.data.balance - tmp_orderPayMoney
        ).toFixed(2);
      }
    } else if (payType == "WECHAT_PAY") {
    } else if (payType == "BALANCE_PAY") {
      tmp_orderPayMoney_forJisuan = parseFloat(
        _this.data.balance - tmp_orderPayMoney
      ).toFixed(2);
    }
    console.log("@@@@@@@ 2tmp_orderPayMoney @@@@@@@ ", tmp_orderPayMoney);

    if (tmp_orderPayMoney_forJisuan < 0) {
      // 余额不足时要自动切换成微信支付
      _this.handleChangeWechatPayFlag();
    } else {
      _this.setData({
        orderPayMoney: tmp_orderPayMoney,
        payType: tmp_payType,
        canUseBalance: tmp_canUseBalance,
      });
    }
    // 处理一下管理员的
    let tmp_orderPayMoneyOrgadmin = parseFloat(
      _this.data.spareNum * _this.data.spareInfo.sparePrice
    ).toFixed(2);
    _this.setData({
      orderPayMoneyOrgadmin: tmp_orderPayMoneyOrgadmin,
    });
  },
  minus() {
    let _this = this;
    if (_this.data.spareNum > 1) {
      _this.setData(
        {
          spareNum: _this.data.spareNum - 1,
        },
        () => {
          _this.jisuan(_this.data.payType);
        }
      );
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
      _this.setData(
        {
          spareNum: _this.data.spareNum + 1,
        },
        () => {
          _this.jisuan(_this.data.payType);
        }
      );
    } else {
      wx.showToast({
        title: "不能超过库存上限",
        icon: "none",
      });
    }
  },
  getOrganizeAddressList() {
    let _this = this;
    let param = {
      url:
        "/organize/listOrganizeDeliveryAddress?userCode=" +
        wx.getStorageSync("userCode"),
    };

    requestModel.request(param, (data) => {
      if (data instanceof Array && data.length > 0) {
        // _this.getAddfoodData(data[0].deliveryAddressCode);
        _this.setData({
          organizeAddressList: data,
          deliveryAddressCode: data[0].deliveryAddressCode,
          address: data[0].address,
        });
      }
    });
  },
  handleChangeWechatPayFlag() {
    let _this = this;
    _this.setData(
      {
        payType: "WECHAT_PAY",
      },
      () => {
        _this.jisuan("WECHAT_PAY");
      }
    );
  },
  handleChangeBalancePayFlag() {
    let _this = this;
    _this.setData(
      {
        payType: "BALANCE_PAY",
      },
      () => {
        _this.jisuan("BALANCE_PAY");
      }
    );
  },
  clickPay() {
    let _this = this;
    if (_this.data.orderPayMoney < 0) {
      wx.showToast({
        title: "余额不足",
        icon: "none",
      });
      return;
    }
    let params = {
      data: {
        organizeCode: _this.data.userInfo.organizeCode,
        userCode: wx.getStorageSync("userCode"),
        deliveryAddressCode: _this.data.userInfo.deliveryAddressCode,
        mealDate: _this.data.spareInfo.mealDate,
        mealType: _this.data.spareInfo.mealType,
        userName: _this.data.userInfo.userName,
        orderPayMoney: _this.data.orderPayMoney,
        spareNum: _this.data.spareNum,
        orgAdmin: false,
        payType: _this.data.payType,
      },
      url: "/order/generateSpareOrder",
      method: "post",
    };
    requestModel.request(params, (data) => {
      console.log("@@@@@@@ 2 @@@@@@@ ", data);

      // _this.setData({
      //   organizeAddressList: data,
      //   deliveryAddressCode: data[0].deliveryAddressCode,
      //   address: data[0].address,
      // });
    });
  },
  getUserFinance() {
    let _this = this;
    let param = {
      url: "/user/getUserFinance?userCode=" + wx.getStorageSync("userCode"),
    };
    requestModel.request(
      param,
      (data) => {
        _this.setData(
          {
            balance: data.balance,
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
      content: "备用餐 x" + _this.data.spareNum + "份",
      success: function (res) {
        if (res.confirm) {
          let params = {
            data: {
              organizeCode: _this.data.userInfo.organizeCode,
              userCode: wx.getStorageSync("userCode"),
              deliveryAddressCode: _this.data.userInfo.deliveryAddressCode,
              mealDate: _this.data.spareInfo.mealDate,
              mealType: _this.data.spareInfo.mealType,
              userName: _this.data.userInfo.userName,
              addressCode: _this.deliveryAddressCode,
              orderPayMoney: _this.data.orderPayMoney,
              spareNum: _this.data.spareNum,
              orgAdmin: true,
              payType: _this.data.payType,
            },
            url: "/order/generateSpareOrder",
            method: "post",
          };
          requestModel.request(params, (data) => {
            console.log("@@@@@@@ 2 @@@@@@@ ", data);

            // _this.setData({
            //   organizeAddressList: data,
            //   deliveryAddressCode: data[0].deliveryAddressCode,
            //   address: data[0].address,
            // });
          });
        }
      },
    });
  },
});
