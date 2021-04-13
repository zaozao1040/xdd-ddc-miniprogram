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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
      _this.setData(
        {
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

    if (payType == "init") {
      if (tmp_orderPayMoney > _this.data.balance) {
        tmp_payType = "WECHAT_PAY";
        tmp_canUseBalance = false;
      } else {
        tmp_payType = "BALANCE_PAY";
        tmp_canUseBalance = true;
        tmp_orderPayMoney = parseFloat(
          _this.data.balance - tmp_orderPayMoney
        ).toFixed(2);
      }
    } else if (payType == "WECHAT_PAY") {
    } else if (payType == "BALANCE_PAY") {
      tmp_orderPayMoney = parseFloat(
        _this.data.balance - tmp_orderPayMoney
      ).toFixed(2);
    }
    if (tmp_orderPayMoney < 0) {
      // 余额不足时要自动切换成微信支付
      _this.handleChangeWechatPayFlag();
    } else {
      _this.setData({
        orderPayMoney: tmp_orderPayMoney,
        payType: tmp_payType,
        canUseBalance: tmp_canUseBalance,
      });
    }
  },
  minus() {
    let _this = this;
    if (_this.data.spareNum > 1) {
      _this.setData(
        {
          spareNum: _this.data.spareNum - 1,
        },
        () => {
          _this.jisuan(_this.data.spareInfo.payType);
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
        addressCode: _this.deliveryAddressCode,
        orderPayMoney: 10,
        spareNum: 1,
        orgAdmin: false,
        payType: _this.data.payType,
      },
      url: "/order/generateSpareOrder",
      method: "post",
    };
    requestModel.request(params, (data) => {
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
});
