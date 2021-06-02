import { base } from "../../../comm/public/request";
import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    payType: "", //'WECHAT_PAY' 支付方式,余额大于付款额则默认余额支付   小于的话则默认微信支付

    //
    windowHeight: 0,
    scrollTop: 0,
    buttonTop: 0,

    loading: false,
    timer: null,
    canClick: true,

    selectedFoods: [],
    totalMoney: 0,
    totalMoneyRealDeduction: 0, //额度总金额
    totalDeduction: 0, //优惠的总价格，企业额度和优惠券优惠

    mapMenutype: ["早餐", "午餐", "晚餐", "夜宵"],
    mapMenutypeIconName: ["zaocan1", "wucan", "canting", "xiaoye-"],

    finalMoney: 0,

    showSelectFlag: false, //展示填写姓名和配送地址的弹出框，默认不展示
    mealEnglistLabel: ["breakfast", "lunch", "dinner", "night"],
    generateOrderNow: false, //防止狂点去付款

    // 取餐时段限制的开关
    takeMealLimitTitleDes: "",
    takeMealLimitMealTypes: [], //传递给子组件
    takeMealLimitArr: [], //保存子组件传递过来的选中的时段数据结构

    /**
     *
     */

    preOrderList: [],
    userInfo: {},
    address: "",
    userName: "",
    phoneNumber: "",
    personalConfig: {},
    reqData: {
      userCode: null,
      couponList: [],
    },
    canUseBalance: false,
    selectBa: false,
    canUseStandard: false,
    selectSt: false,
    canUseWx: false,
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
    selectedDiscountCodeList: [], //当前所有选中的优惠券列表
  },
  onLoad: function (options) {
    this.setData({
      orderType: options.orderType,
    });

    if (options.appendMealFlag == "ok") {
      // 刷新每个餐别的优惠券几张可用
      this.refreshDiscountNumFirst(true);
    } else {
      // 刷新每个餐别的优惠券几张可用
      this.refreshDiscountNumFirst(false);
    }

    this.loadData();
  },
  loadData: function () {
    this.getUserInfo();
    this.initAddress();
    this.getPersonalConfig();
    this.getPreOrderInfo();
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
  getPersonalConfig: function () {
    let _this = this;
    let param = {
      url: "/v3/getPersonalConfig?userCode=" + _this.data.userInfo.userCode,
    };
    requestModel.request(param, (resData) => {
      _this.setData({
        personalConfig: resData,
      });
    });
  },
  getPreOrderInfo: function () {
    let _this = this;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/previewOrder",
      method: "post",
      data: {
        ..._this.data.reqData,
        userCode: _this.data.userInfo.userCode,
      },
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        _this.setData(
          {
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
          },
          () => {
            _this.refreshUserFinance();
          }
        );
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });
  },
  refreshUserFinance() {
    let _this = this;
    let param = {
      url: "/user/getUserFinance?userCode=" + _this.data.userInfo.userCode,
    };
    requestModel.request(
      param,
      (data) => {
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
  refreshPayTypeInfo() {
    let _this = this;
    let tmp_payType = _this.data.payInfo.payType;
    if (tmp_payType == "BALANCE_PAY") {
      _this.setData({
        canUseStandard: false,
        canUseBalance: true,
        canUseWx: false,
        selectBa: true,
        selectSt: false,
        selectWx: false,
      });
    } else if (tmp_payType == "BALANCE_MIX_WECHAT_PAY") {
      _this.setData({
        canUseStandard: false,
        canUseBalance: true,
        canUseWx: true,
        selectBa: true,
        selectSt: false,
        selectWx: true,
      });
    } else if (tmp_payType == "WECHAT_PAY") {
      _this.setData({
        canUseStandard: false,
        canUseBalance: false,
        canUseWx: true,
        selectBa: false,
        selectSt: false,
        selectWx: true,
      });
    } else if (tmp_payType == "STANDARD_PAY") {
      _this.setData({
        canUseStandard: true,
        canUseBalance: false,
        canUseWx: false,
        selectBa: false,
        selectSt: true,
        selectWx: false,
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
      _this.setData({
        buttonTop: res[0].top, // #the-id节点的上边界坐标
      });
    });

    const query_2 = wx.createSelectorQuery();
    query_2.select(".c_buttonPosition_forCalculate_top").boundingClientRect();
    query_2.selectViewport().scrollOffset();
    query_2.exec(function (res) {
      _this.setData({
        addressBottom: res[0].bottom, // #the-id节点的上边界坐标
      });
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
          content: "您本次消费金额将在下下个月的餐卡中扣除",
          showCancel: false,
          confirmText: "我知道了",
        });
      }
    });
  },

  // 获取已选中餐品占据了哪些餐别
  getMealTypesList(selectedFoods) {
    let mealTypes = [];
    selectedFoods.map((item, index) => {
      if (item.count > 0) {
        if (
          item.hasOwnProperty("breakfast") &&
          item.breakfast.selectedFoods.length > 0
        ) {
          mealTypes.push(1);
        }
        if (
          item.hasOwnProperty("lunch") &&
          item.lunch.selectedFoods.length > 0
        ) {
          mealTypes.push(2);
        }
        if (
          item.hasOwnProperty("dinner") &&
          item.dinner.selectedFoods.length > 0
        ) {
          mealTypes.push(3);
        }
        if (
          item.hasOwnProperty("night") &&
          item.night.selectedFoods.length > 0
        ) {
          mealTypes.push(4);
        }
      }
    });
    return mealTypes;
  },

  /* 页面隐藏后回收定时器指针 */
  onHide: function () {},

  /**
   * 首次（从点餐页进来这个页面时调用） 刷新每个餐别的优惠券几张可用
   */
  refreshDiscountNumFirst(appendMealFlag) {
    let _this = this;
    let tmp_orderParamList = _this.getOrderListParam();
    let param = {
      data: {
        userCode: wx.getStorageSync("userCode"),
        order: tmp_orderParamList,
        userDiscountCodeList: _this.data.selectedDiscountCodeList,
        appendMealFlag: appendMealFlag ? true : undefined,
      },
      url: "/userDiscount/discountOrder",
      method: "post",
    };
    requestModel.request(
      param,
      (data) => {
        let tmp_youhuiquanList = data;
        let tmp_selectedFoods = wx.getStorageSync("sevenSelectedFoods"); // wx.getStorageSync("sevenSelectedFoods")  _this.data.selectedFoods
        let tmp_selectedFoodsLength = tmp_selectedFoods.length;
        tmp_youhuiquanList.map((item, index) => {
          for (let i = 0; i < tmp_selectedFoodsLength; i++) {
            if (tmp_selectedFoods[i].mealDate === item.mealDate) {
              let tmp = tmp_selectedFoods[i][item.mealType.toLowerCase()];
              tmp.discountNum = item.discountNum;
              tmp.oldSelectedDiscountFlag = false; //选中状态
              tmp.oldSelectedDiscountInfo = {}; //选中的优惠券的详情
              i = tmp_selectedFoodsLength; //跳出循环
            }
          }
        });
        _this.setData({
          selectedFoods: tmp_selectedFoods,
        });
        wx.setStorageSync("sevenSelectedFoods", tmp_selectedFoods); // 3-29 邱宁增加
      },
      true
    );
  },
  /**
   * 刷新当前已经选择了的优惠券code列表
   */
  refreshSelectedDiscountCodeList(type) {
    let _this = this;
    let tmp_userDiscountCode =
      getApp().globalData.publicParam.oldSelectedDiscountInfo.userDiscountCode;
    let tmp_newUserDiscountCode =
      _this.data.newSelectedDiscountInfo.userDiscountCode;

    if (type == "add") {
      // 如果该天该餐别本来就是已经使用过优惠券的情况（而现在又要设置新的优惠券，就要把原来的优惠券从userDiscountCodeList中剔除）
      if (tmp_userDiscountCode !== tmp_newUserDiscountCode) {
        //1.如果原来使用的优惠券和现在新选择优惠券不是同一张，则要把原来优惠券剔除
        let tmp_index =
          _this.data.selectedDiscountCodeList.indexOf(tmp_userDiscountCode);
        if (tmp_index != -1) {
          _this.data.selectedDiscountCodeList.splice(tmp_index, 1);
        }
      }
      _this.data.selectedDiscountCodeList.push(tmp_newUserDiscountCode);

      // 2.去重
      const set = new Set(_this.data.selectedDiscountCodeList);
      _this.data.selectedDiscountCodeList = [...set];
    } else if (type == "del") {
      let tmp_index =
        _this.data.selectedDiscountCodeList.indexOf(tmp_userDiscountCode);
      if (tmp_index != -1) {
        _this.data.selectedDiscountCodeList.splice(tmp_index, 1);
      }
    }
  },
  /**
   * 选择了优惠券后，重新往previewOrder中塞内关于优惠券的数据结构，含：1）几张可用 2）单餐别抵扣多少钱 3）总价格抵扣
   */
  refreshYouhuiquanInfo: function (type) {
    let _this = this;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });

    let tmp_orderParamList = _this.getOrderListParam();
    let param = {
      data: {
        userCode: wx.getStorageSync("userCode"),
        order: tmp_orderParamList,
        userDiscountCodeList: _this.data.selectedDiscountCodeList,
      },
      url: "/userDiscount/discountOrder",
      method: "post",
    };

    requestModel.request(
      param,
      (data) => {
        // 1
        let tmp_youhuiquanList = data;
        // 2
        let publicParam = getApp().globalData.publicParam;
        // 1 和 2 公用
        let tmp_selectedFoods = wx.getStorageSync("sevenSelectedFoods"); // wx.getStorageSync("sevenSelectedFoods")  _this.data.selectedFoods
        let tmp_selectedFoodsLength =
          wx.getStorageSync("sevenSelectedFoods").length;
        // 开始处理
        // 1 处理每个餐别的有几张优惠券可用
        tmp_youhuiquanList.map((item, index) => {
          for (let i = 0; i < tmp_selectedFoodsLength; i++) {
            let tmp_selectedFoodsItem = tmp_selectedFoods[i];
            if (tmp_selectedFoodsItem.mealDate === item.mealDate) {
              let tmp = tmp_selectedFoodsItem[item.mealType.toLowerCase()];
              tmp.discountNum = item.discountNum;
            }
          }
        });
        // 2 处理每个餐别是否已经使用优惠券，以及优惠券扣减多少钱
        tmp_youhuiquanList.map((item, index) => {
          if (
            item.mealDate == publicParam.mealDate &&
            item.mealType == publicParam.mealType
          ) {
            //命中 日期+餐别
            for (let i = 0; i < tmp_selectedFoodsLength; i++) {
              let tmp_selectedFoodsItem = tmp_selectedFoods[i];
              if (tmp_selectedFoodsItem.mealDate == publicParam.mealDate) {
                _this.data.mealEnglistLabel.forEach((mealType) => {
                  if (mealType.toUpperCase() == publicParam.mealType) {
                    //选了这个餐时的菜
                    if (type == "add") {
                      tmp_selectedFoodsItem[
                        mealType
                      ].oldSelectedDiscountFlag = true;
                      tmp_selectedFoodsItem[mealType].oldSelectedDiscountInfo =
                        _this.data.newSelectedDiscountInfo;
                      let tmp_DiscountMoney =
                        tmp_selectedFoodsItem[mealType].oldSelectedDiscountInfo
                          .discountMoney;
                      let tmp_payMoney =
                        tmp_selectedFoodsItem[mealType].payMoney;
                      let tmp_chazhi = parseFloat(
                        parseFloat(tmp_payMoney) - parseFloat(tmp_DiscountMoney)
                      ).toFixed(2);
                      tmp_selectedFoodsItem[
                        mealType
                      ].payMoneyIncludeYouhuiquan =
                        tmp_chazhi > 0 ? tmp_chazhi : 0;
                      tmp_selectedFoodsItem[mealType].youhuiquanDikou =
                        tmp_chazhi > 0 ? tmp_DiscountMoney : tmp_payMoney; //优惠券实际优惠,取两个数中的小者
                    } else if (type == "del") {
                      tmp_selectedFoodsItem[
                        mealType
                      ].oldSelectedDiscountFlag = false;
                      tmp_selectedFoodsItem[mealType].oldSelectedDiscountInfo =
                        {};
                      tmp_selectedFoodsItem[
                        mealType
                      ].payMoneyIncludeYouhuiquan =
                        tmp_selectedFoodsItem[mealType].payMoney;
                      tmp_selectedFoodsItem[mealType].youhuiquanDikou = 0; //优惠券实际优惠
                    }
                  }
                });
              }
            }
          }
        });
        // 3 处理应付总金额 + 总优惠
        let tmp_payMoneyIncludeYouhuiquan = 0;
        let tmp_zongyouhui = 0;
        for (let i = 0; i < tmp_selectedFoodsLength; i++) {
          let tmp_selectedFoodsItem = tmp_selectedFoods[i];
          if (tmp_selectedFoodsItem.count > 0) {
            _this.data.mealEnglistLabel.forEach((mealType) => {
              if (tmp_selectedFoodsItem.hasOwnProperty(mealType)) {
                if (tmp_selectedFoodsItem[mealType].selectedFoods.length > 0) {
                  //这个payMoneyIncludeYouhuiquan就是每一餐别应付金额 但是要考虑这种情况：当该餐别没有payMoneyIncludeYouhuiquan的key时，是因为该餐别有餐但是没有选择优惠券，这时要取值 payMoney
                  if (
                    tmp_selectedFoodsItem[mealType].hasOwnProperty(
                      "payMoneyIncludeYouhuiquan"
                    )
                  ) {
                    tmp_payMoneyIncludeYouhuiquan = parseFloat(
                      parseFloat(tmp_payMoneyIncludeYouhuiquan) +
                        parseFloat(
                          tmp_selectedFoodsItem[mealType]
                            .payMoneyIncludeYouhuiquan
                        )
                    ).toFixed(2);
                    tmp_zongyouhui = parseFloat(
                      parseFloat(tmp_zongyouhui) +
                        parseFloat(
                          tmp_selectedFoodsItem[mealType].deductionMoney
                        ) +
                        parseFloat(
                          tmp_selectedFoodsItem[mealType].youhuiquanDikou
                        )
                    ).toFixed(2); //总优惠 = 额度实际总优惠 + 优惠券实际总优惠
                  } else {
                    tmp_payMoneyIncludeYouhuiquan = parseFloat(
                      parseFloat(tmp_payMoneyIncludeYouhuiquan) +
                        parseFloat(tmp_selectedFoodsItem[mealType].payMoney)
                    ).toFixed(2);
                    tmp_zongyouhui = parseFloat(
                      parseFloat(tmp_zongyouhui) +
                        parseFloat(
                          tmp_selectedFoodsItem[mealType].deductionMoney
                        )
                    ).toFixed(2); //总优惠 = 额度实际总优惠
                  }
                }
              }
            });
          }
        }
        _this.refreshUserFinance();
        _this.setData({
          selectedFoods: tmp_selectedFoods,
          realMoney: tmp_payMoneyIncludeYouhuiquan,
          totalDeduction: tmp_zongyouhui,
        });
        wx.setStorageSync("sevenSelectedFoods", tmp_selectedFoods); // 3-29 邱宁增加
      },
      true
    );
  },

  /**
   * 选择了优惠券后，重新计算selectedFoods数据结构
   */
  refreshDiscountNumAndSelectedInfo: function () {
    let _this = this;
  },
  /* 跳转优惠券页面 */
  clickDiscount: function (e) {
    let _this = this;
    let tmp_foods = [];
    let { mealdate, mealtype, oldselecteddiscountinfo } =
      e.currentTarget.dataset;
    let tmp_orderListParam = _this.getOrderListParam();
    console.log("####### 3 ####### ", tmp_orderListParam);

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
      userDiscountCodeList: _this.data.selectedDiscountCodeList,
      oldSelectedDiscountInfo: oldselecteddiscountinfo, //餐别下的已经选中的优惠券信息 这个不作为“优惠券详情列表请求的参数” 仅为存储
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
  confirmPay() {
    if (!this.data.userName) {
      wx.showToast({
        title: "请填写姓名",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    }
    if (!this.data.userInfo.deliveryAddressCode) {
      wx.showToast({
        title: "请选择送餐地址",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    }

    if (
      (this.data.payInfo.payType == "BALANCE_PAY" ||
        this.data.payInfo.payType == "BALANCE_MIX_WECHAT_PAY") &&
      this.data.payInfo.orderPayPrice > 0
    ) {
      this.setData({
        balanceConfirmFlag: true,
      });
    } else {
      //其余支付方式则直接支付
      this.doPay();
    }
  },

  confirmPayBalance() {
    this.setData({
      balanceConfirmFlag: false,
    });
    this.doPay();
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
        tmp_orderParamList.push({
          mealType: itemIn.mealType,
          mealDate: itemOut.mealDate,
          integralNumber: 0,
          foods: tmp_foods,
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
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_doPay",
      time: 1000,
      success: () => {
        let param = {
          url:
            "/order/getOrderVerificationString?userCode=" +
            _this.data.userInfo.userCode,
        };
        requestModel.request(param, (data) => {
          let tmp_verificationString = data;
          let tmp_payType = _this.data.payInfo.payType;
          let paramPay = {
            url: config.baseUrlPlus + "/order/generateOrder",
            method: "post",
            data: {
              verificationString: tmp_verificationString,
              userCode: _this.data.userInfo.userCode,
              userName: _this.data.userName,
              addressCode: _this.data.userInfo.deliveryAddressCode,
              payType: tmp_payType, //支付方式
              orderPayMoney: _this.data.payInfo.orderPayPrice, //自费的总价格
              appendMealFlag: _this.data.orderType == "add" ? true : false,
              order: _this.getOrderListParam(),
            },
          };

          console.log("@@@@@@@ paramPay @@@@@@@ ", paramPay);

          request(paramPay, (resData) => {
            if (resData.data.code === 200) {
              let data = resData.data.payData;
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
                resData.data.needPay
              ) {
                //微信支付
                wx.showLoading();
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
                      wx.hideLoading();
                    },
                    fail: function (e) {
                      setTimeout(function () {
                        wx.reLaunch({
                          url:
                            "/pages/order/order?content=" +
                            "订单已生成,请尽快支付",
                        });
                      }, 200);
                      wx.hideLoading();
                    },
                  });
                }
              }
            }
          });
        });
      },
    });
  },

  /* 重新选择默认地址 */
  handleSelectAddress: function () {
    wx.navigateTo({
      url: "/pages/mine/address/address?frontPageFlag=confirm",
    });
  },
  //余额钱包不亮时，点余额钱包判断可为余额支付还是余额+微信支付
  handleChangeBalancePayFlag: function () {
    // 药明康德的奇葩弹窗需求
    this.getYaomingNotice();
    //可使用余额小于_this.data.realMoney
    if (this.data.canUseBalance < this.data.realMoney) {
      //如果用户余额少于用户需要支付的价格，不允许用余额,也就是禁止打开switch
      this.setData({
        payType: "BALANCE_MIX_WECHAT_PAY",
      });
      // 药明康德的奇葩弹窗需求
      this.getYaomingNotice();
    } else {
      this.setData({
        payType: "BALANCE_PAY",
      });
      // 药明康德的奇葩弹窗需求
      this.getYaomingNotice();
    }
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

  // 取餐时段设置 - 监听子组件确定时间段设置
  handleTakeMealLimitConfirm(e) {
    let des = "";
    e.detail.map((item, index) => {
      des = des + item.des + " ";
    });
    this.setData({
      takeMealLimitTitleDes: des,
      takeMealLimitArr: e.detail,
    });
  },
});
