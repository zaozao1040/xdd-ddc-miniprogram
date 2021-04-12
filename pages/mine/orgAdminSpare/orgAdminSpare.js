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

    orderPayMoney: 0,
    spareNum: 1,

    balance: 0,
    canUseBalance: false,
    payType: "WECHAT_PAY",
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
    _this.getSpareMealSet();
    _this.getOrganizeAddressList();
    _this.getUserFinance();
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
      // res.sparePrice = 7;
      let tmp_orderPayMoney = 0;
      let all = parseFloat(_this.spareNum * res.sparePrice).toFixed(2);
      tmp_orderPayMoney =
        all > res.standardPrice
          ? parseFloat(parseFloat(all) - parseFloat(res.standardPrice)).toFixed(
              2
            )
          : 0;
      _this.setData({
        spareInfo: res,
        orderPayMoney: tmp_orderPayMoney,
      });
    });
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
  clickPay() {
    let _this = this;
    let params = {
      data: {
        organizeCode: _this.data.userInfo.organizeCode,
        userCode: wx.getStorageSync("userCode"),
        deliveryAddressCode: _this.data.userInfo.deliveryAddressCode,
        mealDate: _this.spareInfo.mealDate,
        mealType: _this.spareInfo.mealType,
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
        _this.setData({
          balance: data.balance,
        });
      },
      true
    );
  },
});
