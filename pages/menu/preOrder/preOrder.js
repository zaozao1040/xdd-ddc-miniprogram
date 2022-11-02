import { base } from "../../../comm/public/request";
import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
import { normalizeUnits, unix } from "moment";

var log = require("../../../utils/log.js");

let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 0,
    scrollTop: 0,
    buttonTop: 0,
    loading: false,

    /**
     *
     */

    preOrderList: [],
    userInfo: {},
    address: "",
    newAddressCode: null, //这里是为了重新选择下单地址后使用的地址
    userName: "",
    phoneNumber: "",

    canUseBalance: true,
    selectBa: false,
    canUseStandard: true,
    selectSt: null,
    canUseWx: true,
    selectWx: false,
    payInfo: {
      orderPayPrice: null,
      totalOrganizeDeductionPrice: null,
      totalMoney: null,
      payType: null,
      defaultPayType: null, //后台返给的支付方式 默认支付方式
      organizePayPrice: null, // 可支付的 企业点餐币
      presentPayPrice: null, // 可支付的 赠送点餐币
      userPayPrice: null, // 可支付的 个人点餐币
      weiXinPayPrice: null, // 需要支付的 微信金额
    },
    financeInfo: {},
    balanceConfirmFlag: false,
    orderType: null, //订单类型 普通订单 或者 补餐订单
    // 公共计算参数 和优惠券计算相关
    orderParamList: [],
    // 优惠券相关
    newSelectedDiscountInfo: {}, //当前选中的优惠券信息 这个从优惠券列表选中优惠券后，才传递的优惠券信息
    //是否补餐
    appendMealFlag: false,
    addressListLength: 1,
    previewInfo: {}, //这里记录一下previewInfo接口返回的原始数据
    tmpLoading: false, //防止重复下单
    logUserStr: "",
    //顺手买一件
    accessoryFoodList: [],
  },
  onLoad: function (options) {
    this.setData({
      orderType: options.orderType,
    });
    this.loadData();
    let userInfo = wx.getStorageSync("userInfo").userInfo;
    this.logUserStr =
      userInfo.userName +
      " " +
      userInfo.organizeName +
      " " +
      userInfo.organizeCode +
      " " +
      userInfo.userCode +
      " ";
  },
  loadData: function () {
    this.getUserInfo();
    this.initAddress();
    this.getPreOrderInfo();
    this.getYaomingNotice();
    this.getAddressList();
  },
  // 获取地址列表 目的是为了判断该企业是不是多地址 多地址的话 下单要提醒用户地址
  getAddressList: function () {
    let _this = this;
    let param = {
      url:
        "/organize/getOrganizeDeliveryAddress?userCode=" +
        wx.getStorageSync("userInfo").userInfo.userCode,
    };

    requestModel.request(param, (data) => {
      console.log("xxx", data);
      _this.setData({
        addressListLength: data.length,
      });
    });
  },
  getUserInfo: function () {
    let _this = this;
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;

    if (tmp_userInfo) {
      _this.setData({
        userInfo: tmp_userInfo,
        address: tmp_userInfo.deliveryAddress,
        userName: tmp_userInfo.userName,
        phoneNumber: tmp_userInfo.phoneNumber,
      });
    } else {
      requestModel.getUserInfo((userInfo) => {
        _this.setData(
          {
            userInfo: userInfo,
            address: userInfo.deliveryAddress,
            userName: userInfo.userName,
            phoneNumber: userInfo.phoneNumber,
          },
          () => {
            if (!_this.data.userName || !userInfo.deliveryAddress) {
              _this.setData({
                showSelectFlag: true,
              });
            }
          }
        );
      }, true);
    }
  },

  getPreOrderInfo: function () {
    let _this = this;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/previewOrder",
      method: "post",
      data: {
        userCode: _this.data.userInfo.userCode,
        standardPayFlag: _this.data.selectSt,
      },
    };
    if (_this.data.accessoryFoodList) {
      param.data.accessoryFoodList = _this.data.accessoryFoodList;
    }
    log.info(
      "请求 previewOrder " + _this.data.logUserStr + JSON.stringify(param)
    );
    _this.setData({
      tmpLoading: true,
    });
    request(param, (resData) => {
      if (resData.data.code === 200) {
        if (resData.data.data) {
          log.info(
            "响应 previewOrder " +
              _this.data.logUserStr +
              JSON.stringify(resData.data)
          );
        } else {
          log.error(
            "响应 previewOrder " +
              _this.data.logUserStr +
              JSON.stringify(resData.data)
          );
        }
        //筛选一下看有没有补餐，有则弹框
        let re = _this.doBucan(resData.data.data.cartResDtoList);
        if (!re) {
          wx.showModal({
            title: "补餐提示",
            content: "补餐下单后,五分钟后无法取消",
            showCancel: false,
            confirmText: "我知道了",
          });
        }
        _this.setData(
          {
            tmpLoading: false,
            preOrderList: resData.data.data.cartResDtoList,
            payInfo: {
              orderPayPrice: resData.data.data.orderPayPrice,
              totalOrganizeDeductionPrice:
                resData.data.data.totalOrganizeDeductionPrice,
              totalMoney: resData.data.data.totalMoney,
              payType: resData.data.data.payType,
              defaultPayType: resData.data.data.payType, //记录一下这个值
              organizePayPrice: resData.data.data.organizePayPrice, // 可支付的 企业点餐币
              presentPayPrice: resData.data.data.presentPayPrice, // 可支付的 赠送点餐币
              userPayPrice: resData.data.data.userPayPrice, // 可支付的 个人点餐币
              weiXinPayPrice: resData.data.data.weiXinPayPrice, // 需要支付的 微信金额
            },
            selectSt: resData.data.data.alllowStandardPayFlag, //
            appendMealFlag: resData.data.data.appendMealFlag, //是否补餐
            previewInfo: resData.data.data,
          },
          () => {
            _this.refreshUserFinance();
          }
        );
      } else {
        log.error(
          "响应 previewOrder " +
            _this.data.logUserStr +
            JSON.stringify(resData.data)
        );
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });
  },
  doBucan(cartResDtoList) {
    let re = false;
    cartResDtoList.forEach((item) => {
      item.mealTypeList.forEach((itemIn) => {
        itemIn.foods.forEach((itemInIn) => {
          if (itemInIn.supplement == true) {
            re = true;
          }
        });
      });
    });
    return re;
  },
  refreshUserFinance() {
    let _this = this;
    let param = {
      url: "/user/getUserFinance?userCode=" + _this.data.userInfo.userCode,
    };
    log.info(
      "请求 getUserFinance " + _this.data.logUserStr + JSON.stringify(param)
    );
    requestModel.request(
      param,
      (data) => {
        if (data) {
          log.info(
            "响应 getUserFinance " +
              _this.data.logUserStr +
              JSON.stringify(data)
          );
        } else {
          log.error(
            "响应 getUserFinance " +
              _this.data.logUserStr +
              JSON.stringify(data)
          );
        }
        wx.hideLoading();
        // 返回接口中的字段含义如下：
        // allBalance: 1.2  个人点餐币+赠送点餐币+企业点餐币（如果该企业没有开通企业钱包，则等于个人点餐币+赠送点餐币）
        // balance: 1.2                                    个人点餐币
        // organizeBalance: 0                              企业点餐币
        // presentBalance: 0                               赠送点餐币
        // totalBalance: 1.2                               个人点餐币+赠送点餐币
        // totalPresentBalance: 0                          等于赠送点餐币

        // discount: 0                                     与本需求无关 无效
        // integral: 116                                   与本需求无关 积分
        // thisMonthClearOrganizeBlance: 0                 与本需求无关 本月清零的企业点餐币（如果该企业没有开通企业钱包，则等于0）
        _this.setData(
          {
            financeInfo: data,
          },
          () => {
            _this.refreshPayTypeInfo();
          }
        );
      },
      true
    );
  },

  clickSt() {
    let _this = this;
    if (_this.data.canUseStandard) {
      _this.setData(
        {
          selectSt: !this.data.selectSt,
        },
        () => {
          _this.getPreOrderInfo();
        }
      );
    } else {
      wx.showToast({
        title: "不允许切换",
        icon: "none",
        duration: 2000,
      });
    }
  },
  clickBa() {
    wx.showToast({
      title: "不允许切换",
      icon: "none",
      duration: 2000,
    });
  },
  clickWx() {
    wx.showToast({
      title: "不允许切换",
      icon: "none",
      duration: 2000,
    });
  },
  refreshPayTypeInfo() {
    let _this = this;
    let tmp_payType = _this.data.payInfo.payType;
    if (tmp_payType == "BALANCE_PAY") {
      _this.setData({
        canUseBalance: true,
        selectBa: true,
        canUseWx: false,
        selectWx: false,
      });
    } else if (tmp_payType == "BALANCE_MIX_WECHAT_PAY") {
      _this.setData({
        canUseBalance: true,
        selectBa: true,
        canUseWx: true,
        selectWx: true,
      });
    } else if (tmp_payType == "WECHAT_PAY") {
      _this.setData({
        canUseWx: true,
        selectWx: true,
        canUseBalance: false,
        selectBa: false,
      });
    } else if (tmp_payType == "STANDARD_PAY") {
      _this.setData({
        canUseBalance: false,
        canUseWx: false,
        selectBa: false,
        selectWx: false,
        //餐标支付的开关，只有当后端推荐支付方式是STANDARD_PAY时，开可以控制，其他情况都不得控制
        canUseStandard: true,
        selectSt: true,
      });
    }
  },

  initAddress: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });

    const query_1 = wx.createSelectorQuery();
    query_1.select(".c_buttonPosition_forCalculate").boundingClientRect();
    query_1.selectViewport().scrollOffset();
    query_1.exec(function (res) {
      if (res instanceof Array && res.length > 0) {
        _this.setData({
          buttonTop: res[0].top,
        });
      }
    });

    const query_2 = wx.createSelectorQuery();
    query_2.select(".c_buttonPosition_forCalculate_top").boundingClientRect();
    query_2.selectViewport().scrollOffset();
    query_2.exec(function (res) {
      if (res instanceof Array && res.length > 0) {
        _this.setData({
          addressBottom: res[0].bottom,
        });
      }
    });
  },

  // 药明康德的奇葩弹窗需求
  getYaomingNotice() {
    let param = {
      url:
        "/order/getNotice?userCode=" +
        wx.getStorageSync("userCode") +
        "&deliveryAddressCode=" +
        wx.getStorageSync("userInfo").userInfo.deliveryAddressCode,
    };
    requestModel.request(param, (data) => {
      if (data) {
        wx.showModal({
          title: "提示",
          content: data,
          showCancel: false,
          confirmText: "我知道了",
        });
      }
    });
  },

  /* 跳转优惠券页面 */
  clickDiscount: function (e) {
    let _this = this;
    let tmp_foods = [];
    let { mealdate, mealtype, combinediscountinfo } = e.currentTarget.dataset;
    let tmp_orderListParam = _this.getOrderListParam();
    tmp_orderListParam.map((item, index) => {
      if (item.mealDate == mealdate && item.mealType == mealtype) {
        tmp_foods = item.foods;
      }
    });
    getApp().globalData.publicParam = {
      // 这个是优惠券详情列表请求的参数，这里提前存储好
      userCode: _this.data.userInfo.userCode,
      mealDate: mealdate,
      mealType: mealtype,
      foods: tmp_foods,
      selectedDiscountInfo: combinediscountinfo
        ? {
            userDiscountCode: combinediscountinfo.userDiscountCode,
            discountMoney: combinediscountinfo.discountMoney,
          }
        : {}, //餐别下的已经选中的优惠券code 这个不作为“优惠券详情列表请求的参数”
    };

    wx.navigateTo({
      url: "/pages/menu/preOrder/discount/discount",
    });
  },

  nameInput: function (e) {
    this.setData({
      userName: e.detail.value,
    });
  },
  addressInput: function (e) {
    this.setData({
      address: e.detail.value,
    });
  },
  /* 展示弹窗(选择姓名和取餐低脂) */
  handleChangeSelectFlag: function () {
    this.setData({
      showSelectFlag: !this.data.showSelectFlag,
    });
  },
  /* 校验参数(选择姓名和取餐低脂) */
  handleCheckParams: function () {
    if (!this.data.userName) {
      wx.showToast({
        title: "请填写姓名",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else if (!this.data.address) {
      wx.showToast({
        title: "请选择送餐地址",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else {
      wx.showToast({
        title: "填写成功",
        image: "/images/msg/success.png",
        duration: 2000,
      });
      this.setData({
        showSelectFlag: false,
      });
    }
  },

  //余额支付的提示
  clickPay() {
    if (!this.data.userName) {
      wx.showToast({
        title: "请填写姓名",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    }
    if (!this.data.userInfo.deliveryAddressCode && !this.data.newAddressCode) {
      wx.showToast({
        title: "请选择送餐地址",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    }
    this.setData({
      balanceConfirmFlag: true,
    });
    // if (
    //   (this.data.payInfo.payType == "BALANCE_PAY" ||
    //     this.data.payInfo.payType == "BALANCE_MIX_WECHAT_PAY") &&
    //   this.data.payInfo.orderPayPrice > 0
    // ) {
    //   this.setData({
    //     balanceConfirmFlag: true,
    //   });
    // } else {
    //   //其余支付方式则直接支付
    //   this.doPay();
    // }
  },

  confirmPayBalance() {
    let _this = this;
    _this.doPay();
  },
  cancelPayBalance() {
    this.setData({
      balanceConfirmFlag: false,
    });
  },

  /**
   * 付款 获取下单时必要的订单参数
   */
  getOrderListParam: function () {
    let _this = this;
    let tmp_orderParamList = [];
    _this.data.preOrderList.forEach((itemOut) => {
      itemOut.mealTypeList.forEach((itemIn) => {
        let tmp_foods = [];
        itemIn.foods.forEach((itemMini) => {
          tmp_foods.push({
            foodCode: itemMini.foodCode,
            foodQuantity: itemMini.foodQuantity,
          });
        });
        //顺手买一件
        let tmp_accessoryFoodList = [];
        _this.data.accessoryFoodList.forEach((itemAc) => {
          if (
            itemAc.mealDate == itemOut.mealDate &&
            itemAc.mealType == itemIn.mealType
          ) {
            tmp_accessoryFoodList = itemAc.list;
          }
        });
        tmp_orderParamList.push({
          mealType: itemIn.mealType,
          mealDate: itemOut.mealDate,
          integralNumber: 0,
          foods: tmp_foods,
          accessoryFoodList: tmp_accessoryFoodList || [],
          userDiscountCode: itemIn.userDiscountCode,
        });
      });
    });
    return tmp_orderParamList;
  },
  /**
   * 付款 提交菜单
   */
  doPay: function () {
    let _this = this;
    let param = {
      url:
        "/order/getOrderVerificationString?userCode=" +
        _this.data.userInfo.userCode,
    };
    _this.setData(
      {
        tmpLoading: true,
        balanceConfirmFlag: false,
      },
      () => {
        log.info(
          "请求 getOrderVerificationString " +
            _this.data.logUserStr +
            JSON.stringify(param)
        );
        requestModel.request(param, (data) => {
          log.info(
            "响应 getOrderVerificationString " +
              _this.data.logUserStr +
              JSON.stringify(data)
          );
          let tmp_verificationString = data;
          let tmp_payType = _this.data.payInfo.payType;
          let paramPay = {
            url: config.baseUrlPlus + "/order/generateOrder",
            method: "post",
            data: {
              standardPayFlag: _this.data.selectSt,
              verificationString: tmp_verificationString,
              userCode: _this.data.userInfo.userCode,
              userName: _this.data.userName,
              addressCode:
                _this.data.newAddressCode ||
                _this.data.userInfo.deliveryAddressCode,
              payType: tmp_payType, //支付方式
              orderPayMoney: _this.data.payInfo.orderPayPrice, //自费的总价格
              // appendMealFlag: _this.data.orderType == "bucan" ? true : false,
              appendMealFlag: _this.data.appendMealFlag,
              order: _this.getOrderListParam(),
              kaiXinFlag: _this.data.previewInfo.kaiXinFlag,
            },
          };

          log.info(
            "请求 generateOrder " +
              _this.data.logUserStr +
              JSON.stringify(paramPay)
          );
          request(paramPay, (resData) => {
            if (resData.data.data) {
              log.info(
                "响应 generateOrder " +
                  _this.data.logUserStr +
                  JSON.stringify(resData.data)
              );
            } else {
              log.error(
                "响应 generateOrder " +
                  _this.data.logUserStr +
                  JSON.stringify(resData.data)
              );
            }
            _this.setData({ tmpLoading: false, balanceConfirmFlag: false });
            if (resData.data.code === 200) {
              let data = resData.data.data.payData;
              if (
                !data ||
                tmp_payType == "BALANCE_PAY" ||
                tmp_payType == "STANDARD_PAY"
              ) {
                wx.reLaunch({
                  url: "/pages/order/order?content=" + "订单已生成",
                });
              } else if (
                (tmp_payType == "WECHAT_PAY" ||
                  tmp_payType == "BALANCE_MIX_WECHAT_PAY") &&
                resData.data.data.needPay
              ) {
                //微信支付
                if (data.timeStamp) {
                  wx.requestPayment({
                    timeStamp: data.timeStamp.toString(),
                    nonceStr: data.nonceStr,
                    package: data.packageValue,
                    signType: data.signType,
                    paySign: data.paySign,
                    success: function (e) {
                      setTimeout(function () {
                        wx.reLaunch({
                          url: "/pages/order/order?content=" + "订单已生成",
                        });
                      }, 200);
                    },
                    fail: function (e) {
                      setTimeout(function () {
                        wx.reLaunch({
                          url:
                            "/pages/order/order?content=" +
                            "订单已生成,请尽快支付",
                        });
                      }, 200);
                    },
                  });
                }
              }
            } else {
              wx.showModal({
                title: "提示",
                content: resData.data.msg,
                showCancel: false,
                confirmText: "我知道了",
              });
            }
          });
        });
      }
    );
  },

  /* 重新选择默认地址 */
  handleSelectAddress: function () {
    wx.navigateTo({
      url: "/pages/mine/address/address?frontPageFlag=confirm",
    });
  },

  clickWxCheck: function () {
    let tobe = !this.data.selectWx;
    let tmp_payType = this.data.payInfo.payType;
    if (!this.data.selectBa && !tobe) {
      wx.showToast({
        title: "至少一种方式",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    } else if (tobe && this.data.selectBa) {
      tmp_payType = "BALANCE_MIX_WECHAT_PAY";
    } else if (!tobe && this.data.selectBa) {
      tmp_payType = "BALANCE_PAY";
    } else if (tobe && !this.data.selectBa) {
      tmp_payType = "WECHAT_PAY";
    }
    this.setData({
      selectWx: tobe,
      payInfo: {
        ...this.data.payInfo,
        payType: tmp_payType,
      },
    });
  },
  clickBaCheck: function () {
    let tobe = !this.data.selectBa;
    let tmp_payType = this.data.payInfo.payType;
    if (!this.data.selectWx && !tobe) {
      wx.showToast({
        title: "至少一种方式",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    } else if (tobe && this.data.selectWx) {
      tmp_payType = "BALANCE_MIX_WECHAT_PAY";
    } else if (!tobe && this.data.selectWx) {
      tmp_payType = "BALANCE_PAY";
    } else if (tobe && !this.data.selectWx) {
      tmp_payType = "WECHAT_PAY";
    }
    this.setData({
      selectBa: tobe,
      payInfo: {
        ...this.data.payInfo,
        payType: tmp_payType,
      },
    });
  },
  gotoRemark() {
    wx.navigateTo({
      url: "/pages/menu/remark/remark",
    });
  },
  //顺手买一件
  getAccessoryFoodList(mealDate, mealType, foodCode) {
    let _this = this;
    let tmp_accessoryFoodList = [];
    _this.data.previewInfo.cartResDtoList.forEach((item) => {
      item.mealTypeList.forEach((itemIn) => {
        let tmp_list = itemIn.accessoryFood
          .map((itemInInIn) => {
            let tmp_num = itemInInIn.count;
            if (
              foodCode == itemInInIn.foodCode &&
              mealType == itemIn.mealType &&
              mealDate == itemIn.mealDate
            ) {
              tmp_num = itemInInIn.count == 0 ? 1 : 0;
            }
            return {
              foodCode: itemInInIn.foodCode,
              foodName: itemInInIn.foodName,
              foodPrice: itemInInIn.foodPrice,
              num: tmp_num,
            };
          })
          .filter((itemInIn) => {
            return itemInIn.num > 0;
          });
        let objIn = {
          mealDate: itemIn.mealDate,
          mealType: itemIn.mealType,
          list: tmp_list,
        };
        tmp_accessoryFoodList.push(objIn);
      });
    });
    return tmp_accessoryFoodList;
  },
  clickAcItem(e) {
    let _this = this;
    let { mealtypeitem, itemac } = e.currentTarget.dataset;
    let tmp_accessoryFoodList = _this.getAccessoryFoodList(
      mealtypeitem.mealDate,
      mealtypeitem.mealType,
      itemac.foodCode
    );
    _this.setData(
      {
        accessoryFoodList: tmp_accessoryFoodList,
      },
      () => {
        _this.getPreOrderInfo();
      }
    );
  },
});
