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
    //这四个记录缓存的值
    address: "",
    userName: "",
    phoneNumber: "",

    selectedFoods: [],
    totalMoney: 0,
    totalMoneyRealDeduction: 0, //额度总金额
    totalDeduction: 0, //优惠的总价格，企业额度和优惠券优惠

    realMoney: 0, //实际总价格，也就是自费价格
    realMoney_save: 0, //实际总价格，也就是自费价格(从menu传过来的，不含减去优惠券的价格--保存下来用于选择不同优惠券)

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

    // 公共计算参数 和优惠券计算相关
    orderParamList: [],
    // 优惠券相关
    newSelectedDiscountInfo: {}, //当前选中的优惠券信息
    selectedDiscountCodeList: [], //当前所有选中的优惠券列表

    /**
     *
     */

    preOrderInfo: {},
    userInfo: {},
    personalConfig: {},
    reqData: {
      userCode: null,
      couponList: [],
    },
  },
  onLoad: function (options) {
    this.loadData();

    let selectedFoods = [];
    if (options.orderType == "add") {
      //补餐
      let a = wx.getStorageSync("addSelectedFoods");
      selectedFoods.push(a);
    } else {
      selectedFoods = wx.getStorageSync("sevenSelectedFoods");
    }
    //初始化，默认都选择不使用积分抵扣

    for (let i = 0; i < selectedFoods.length; i++) {
      //是否使用积分
      if (selectedFoods[i].count > 0) {
        for (let m = 0; m < this.data.mealEnglistLabel.length; m++) {
          let meal = this.data.mealEnglistLabel[m];
          if (selectedFoods[i][meal]) {
            selectedFoods[i][meal].useIntegral = false;
          }
        }
      }
      //显示的日期
      if (selectedFoods[i].mealDate) {
        let a = selectedFoods[i].mealDate.split("-");
        selectedFoods[i].mealDateShow = a[1] + "/" + a[2];
      }
    }

    wx.setStorageSync("sevenSelectedFoods", selectedFoods);
    this.setData({
      selectedFoods: selectedFoods,
      totalMoney: options.totalMoney,
      totalMoneyRealDeduction: options.totalMoneyRealDeduction,
      realMoney: parseFloat(options.realMoney),
      realMoney_save: parseFloat(options.realMoney),
      totalDeduction: options.totalMoneyRealDeduction,
      orderType: options.orderType,
      cantMealTotalMoney: options.cantMealTotalMoney, //不可使用餐标的总额
    });
    this.getOrderVerificationString();

    // 计算公共参数
    this.getOrderParamList();

    // 这里需要判断是否有补餐信息传递过来

    if (options.appendMealFlag == "ok") {
      // 刷新每个餐别的优惠券几张可用
      this.refreshDiscountNumFirst(true);
    } else {
      // 刷新每个餐别的优惠券几张可用
      this.refreshDiscountNumFirst(false);
    }
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
      });
    } else {
      requestModel.getUserInfo((userInfo) => {
        _this.setData({
          userInfo: userInfo,
        });
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
      url: config.baseUrlPlus + "/v3/cart/addCart",
      method: "post",
      data: {
        ..._this.data.reqData,
        userCode: _this.data.userInfo.userCode,
      },
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        _this.setData({
          preOrderInfo: resData.data.data,
        });
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });

    requestModel.request(
      param,
      (resData) => {
        _this.setData({
          preOrderInfo: resData,
        });
      },
      true
    );
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

  getOrderVerificationString() {
    let _this = this;
    requestModel.getUserCode((userCode) => {
      let param = {
        url: "/order/getOrderVerificationString?userCode=" + userCode,
      };
      requestModel.request(
        param,
        (data) => {
          _this.data.verificationString = data;
        },
        true
      );
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
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    requestModel.getUserInfo((userInfo) => {
      let { userType, orgAdmin } = userInfo;
      if (userType == "ORG_ADMIN" && orgAdmin == true) {
        _this.setData({
          orgAdmin: true,
        });
      } else {
        _this.setData({
          orgAdmin: false,
        });
      }
      _this.setData({
        address: userInfo.deliveryAddress,
        userName: userInfo.userName,
        phoneNumber: userInfo.phoneNumber,
        userInfo: userInfo,
      });

      if (!_this.data.userName || !userInfo.deliveryAddress) {
        _this.setData({
          showSelectFlag: true,
        });
      }

      _this.refreshUserFinance();
    });
  },
  refreshUserFinance() {
    let _this = this;
    let param = {
      url: "/user/getUserFinance?userCode=" + wx.getStorageSync("userCode"),
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
        _this.setData({
          totalBalance: data.totalBalance,
        });
        let canUseBalance = data.allBalance;
        _this.data.balancePayMoney = data.allBalance;

        if (!_this.data.realMoney) {
          //等于0则是标准支付
          _this.setData({
            payType: "STANDARD_PAY",
            canUseBalance: canUseBalance,
          });
        } else {
          /**
           * 逻辑整理：
           * allowUserOrganizePayNoCanMeal  允许企业点餐币支付非餐标餐品
           * realMoney  最后需要支付的现金
           * cantMealTotalMoney  总-不可使用餐标
           * canMealTotalMoney   总-可使用餐标
           */
          // 下面的逻辑中，有两个 realMoney 的地方换成了 realMoney_save -- 记录
          let allowUserOrganizePayNoCanMeal =
            wx.getStorageSync("userInfo").userInfo
              .allowUserOrganizePayNoCanMeal;
          if (!allowUserOrganizePayNoCanMeal) {
            let canMealTotalMoney = parseFloat(
              _this.data.realMoney_save - _this.data.cantMealTotalMoney
            ).toFixed(2);
            let organizePayBalance =
              data.organizeBalance < canMealTotalMoney
                ? data.organizeBalance
                : canMealTotalMoney;
            organizePayBalance = parseFloat(organizePayBalance);
            let remainMoney = _this.data.realMoney_save - organizePayBalance;
            let personPayBalance =
              data.totalBalance < remainMoney ? data.totalBalance : remainMoney;
            let personBalance = data.totalBalance;
            let organizeBalance =
              data.totalBalance < remainMoney
                ? organizePayBalance
                : data.organizeBalance;
            canUseBalance = parseFloat(
              (parseFloat(organizeBalance) + parseFloat(personBalance)).toFixed(
                2
              )
            ); //【邱宁修改】
            _this.data.balancePayMoney =
              parseFloat(organizePayBalance.toFixed(2)) +
              parseFloat(personPayBalance.toFixed(2));
          }
          if (canUseBalance == 0) {
            _this.setData({
              payType: "WECHAT_PAY",
            });
          } else if (canUseBalance >= _this.data.realMoney) {
            _this.setData({
              payType: "BALANCE_PAY",
            });
            // 药明康德的奇葩弹窗需求
            _this.getYaomingNotice();
          } else {
            _this.setData({
              payType: "BALANCE_MIX_WECHAT_PAY",
            });
            // 药明康德的奇葩弹窗需求
            _this.getYaomingNotice();
          }
          _this.setData({
            canUseBalance,
            balanceDes: allowUserOrganizePayNoCanMeal ? "个人钱包" : "钱包余额",
          });
        }
      },
      true
    );
  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 首次（从点餐页进来这个页面时调用） 刷新每个餐别的优惠券几张可用
   */
  refreshDiscountNumFirst(appendMealFlag) {
    let _this = this;
    let tmp_orderParamList = _this.data.orderParamList;
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
   * 选择了优惠券后，重新计算selectedFoods数据结构，含：1）几张可用 2）单餐别抵扣多少钱 3）总价格抵扣
   */
  refreshYouhuiquanInfo: function (type) {
    let _this = this;
    wx.showLoading({
      title: "正在加载",
      mask: true,
    });

    let tmp_orderParamList = _this.data.orderParamList;
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
  handleGotoDiscount: function (e) {
    let tmp_foods = [];
    let { mealdate, mealtypename, oldselecteddiscountinfo } =
      e.currentTarget.dataset;

    let tmp_mealType = "";
    if (mealtypename == "早餐") {
      tmp_mealType = "BREAKFAST";
    } else if (mealtypename == "午餐") {
      tmp_mealType = "LUNCH";
    } else if (mealtypename == "晚餐") {
      tmp_mealType = "DINNER";
    } else if (mealtypename == "夜宵") {
      tmp_mealType = "NIGHT";
    }
    this.data.orderParamList.map((item, index) => {
      if (item.mealDate == mealdate && item.mealType == tmp_mealType) {
        tmp_foods = item.foods;
      }
    });
    getApp().globalData.publicParam = {
      // 这个是优惠券详情列表请求的参数，这里提前存储好
      userCode: wx.getStorageSync("userCode"),
      mealDate: mealdate,
      mealType: tmp_mealType,
      foods: tmp_foods,
      userDiscountCodeList: this.data.selectedDiscountCodeList,
      oldSelectedDiscountInfo: oldselecteddiscountinfo, //餐别下的已经选中的优惠券信息 这个不作为“优惠券详情列表请求的参数”
    };

    wx.navigateTo({
      url: "/pages/menu/today/discount/discount",
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
  //关闭余额提示
  closeBalanceConfirmFlag() {
    this.setData({
      balanceConfirmFlag: false,
    });
  },
  //余额支付的提示
  handleCommitPayCheck() {
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
    //如果是余额支付，并且金额大于0，则弹出提示框
    if (this.data.payType == "BALANCE_PAY" && this.data.realMoney > 0) {
      this.setData({
        balanceConfirmFlag: true,
      });
    } else {
      //其余支付方式则直接支付
      this.handleCommitPay();
    }
  },
  /**
   * 付款
   * 以及 查询可用优惠券数量
   * 以及 确认下单时调用/order/generateOrder产生订单的请求参数
   * 这三个请求时 的参数一部分，封装这个逻辑
   */
  getOrderParamList: function () {
    let _this = this;
    let tmp_orderParamList = [];

    _this.data.selectedFoods = wx.getStorageSync("sevenSelectedFoods"); //2021-02-1 qiuning修改，这里给放开了，原来被注释掉
    let tmp_length = wx.getStorageSync("sevenSelectedFoods").length; // wx.getStorageSync("sevenSelectedFoods")  _this.data.selectedFoods
    for (let i = 0; i < tmp_length; i++) {
      let tmp_selectedFoodsItem = wx.getStorageSync("sevenSelectedFoods")[i]; // wx.getStorageSync("sevenSelectedFoods")  _this.data.selectedFoods
      if (tmp_selectedFoodsItem.count > 0) {
        _this.data.mealEnglistLabel.forEach((mealType) => {
          if (
            tmp_selectedFoodsItem[mealType] &&
            tmp_selectedFoodsItem[mealType].selectedFoods.length > 0
          ) {
            //选了这个餐时的菜

            let order_item = {
              mealDate: tmp_selectedFoodsItem.mealDate,
              mealType: mealType.toUpperCase(),
              userDiscountCode: tmp_selectedFoodsItem[mealType]
                .oldSelectedDiscountInfo
                ? tmp_selectedFoodsItem[mealType].oldSelectedDiscountInfo
                    .userDiscountCode
                : null,
              foods: [],
              integralNumber: 0,
            };

            tmp_selectedFoodsItem[mealType].selectedFoods.forEach((onefood) => {
              let foods_item = {
                foodCode: onefood.foodCode,
                foodQuantity: onefood.foodCount,
                markDetail: onefood.remarkList,
              };

              order_item.foods.push(foods_item);
            });

            tmp_orderParamList.push(order_item);
          }
        });
      }
    }
    _this.data.orderParamList = tmp_orderParamList; //赋给本页公共变量
  },

  /**
   * 付款 提交菜单
   */
  handleCommitPay: function () {
    let _this = this;
    _this.setData({
      balanceConfirmFlag: false,
    });
    if (_this.data.generateOrderNow) {
      return;
    }
    //不允许再点击
    _this.setData({
      generateOrderNow: true,
    });
    requestModel.getUserCode((userCode) => {
      /**** 拼接这个庞大的参数 ****/
      // 若该企业是开启了 分时段取餐 功能的，也就是takeMealLimitFlag为true，那么需要组装请求参数
      let tmp_takeMealLimitObj = {};

      let tmp_param = {
        verificationString: _this.data.verificationString,
        userCode: userCode,
        userName: _this.data.userName,
        addressCode: _this.data.userInfo.deliveryAddressCode,
        payType: _this.data.payType, //支付方式
        orderPayMoney: _this.data.realMoney, //自费的总价格
        appendMealFlag: _this.data.orderType == "add" ? true : false,
        order: [],
      };

      _this.getOrderParamList(); //要重新计算一下这个orderParamList，因为加入了优惠券
      tmp_param.order = _this.data.orderParamList;

      let param = tmp_param;
      if (!param.orderPayMoney) {
        param.payType = "STANDARD_PAY"; //支付方式改为标准支付
      }

      if (param.payType == "BALANCE_MIX_WECHAT_PAY") {
        param.balancePayMoney = _this.data.balancePayMoney;
        param.thirdPayMoney = parseFloat(
          parseFloat(_this.data.realMoney) -
            parseFloat(_this.data.balancePayMoney)
        ).toFixed(2);
      }
      let params = {
        data: param,
        url: "/order/generateOrder",
        method: "post",
      };
      requestModel.request(
        params,
        (resdata) => {
          let data = resdata.payData;

          if (
            !data ||
            param.payType == "BALANCE_PAY" ||
            param.payType == "STANDARD_PAY"
          ) {
            wx.reLaunch({
              url: "/pages/order/order?content=" + "订单已生成",
            });
          } else if (
            (param.payType == "WECHAT_PAY" ||
              param.payType == "BALANCE_MIX_WECHAT_PAY") &&
            resdata.needPay
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
                        "/pages/order/order?content=" + "订单已生成,请尽快支付",
                    });
                  }, 200);
                  wx.hideLoading();
                },
              });
            }
          }
        },
        true,
        () => {
          _this.setData({
            generateOrderNow: false,
          });
          _this.getOrderVerificationString();
        }
      );
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
  /* 余额钱包亮时，点余额钱包变为微信支付,微信支付不亮时，点微信支付变为微信支付 */
  handleChangeWechatPayFlag: function () {
    this.setData({
      payType: "WECHAT_PAY",
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
