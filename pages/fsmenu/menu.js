import { base } from "../../comm/public/request";
import moment from "../../comm/public/moment";
import config from "../../comm_plus/config/config.js";
import { request } from "../../comm_plus/public/request.js";
import jiuaiDebounce from "../../comm_plus/jiuai-debounce/jiuai-debounce.js";

let requestModel = new base();
Page({
  data: {
    // 是否NGO
    isNGO: false,
    //
    windowHeight: 500,
    scrollToView: "id_0",
    listHeight: [], //这个数组记录每个餐类的"之前所有餐类描述+所有具体餐品"的占用高度值
    cartHeight: 100, //购物车的高度 设置为2/1windowHeight的高度，最高为2/1windowHeight的高度
    //
    loading: false,
    userInfo: {},
    orgAdmin: false, //管理员身份
    personalConfig: {},
    mealDateList: [...Array(14)],
    mealTypeList: [],
    foodTypeList: [],
    activeInfoExtra: {},
    cartList: [],
    inValidNum: 0,
    payInfo: {
      moneyBack: 0,
    },
    //
    activeMealDate: "",
    activeMealType: "",
    activeTakeMealTime: "",
    activeTimeShareStatus: false,
    mealTypeMap: {
      LUNCH: "午餐",
      DINNER: "晚餐",
      BREAKFAST: "早餐",
      NIGHT: "夜宵",
    },
    //
    menu: {}, //多天菜单数据，已对象存储，key值为日期 2020-09-10
    //
    activeFoodType: 0, //当前被点击的餐品类别
    showPrice: true, //是否显示价格 -- 只有visitor身份不展示
    // 购物车
    showCartFlag: false, //购物车的颜色，false时是灰色，true时有颜色
    inValidNumToast: true, //是否提示存在失效订单

    // 餐品类型推荐
    activeTypeId: null,

    // 各种个性化
    userTimeAndMealTypeLimit: false, //奥美凯

    //
    recentData: null,
    //
  },

  onLoad: function (option) {
    this.loadData(option);
  },
  // 前端计算未来14天日期
  getMealDateList: function () {
    let _this = this;
    let mealDateList = [];
    let weekCn = ["一", "二", "三", "四", "五", "六", "日"];

    for (let i = 0; i < 14; i++) {
      let tmpDes = "";
      let tmpDay = moment().subtract(-i, "days");
      if (i == 0) {
        tmpDes = "今天";
      } else if (i == 1) {
        tmpDes = "明天";
      } else {
        tmpDes = "周" + weekCn[tmpDay.format("E") - 1];
      }
      mealDateList.push({
        active: false,
        description: tmpDes,
        mealDate: tmpDay.format("YYYY-MM-DD"),
        mealDateAbbreviation: tmpDay.format("MM/DD"),
      });
    }
    // 后台算出最近可以点餐的情况
    _this.setData({
      mealDateList: mealDateList,
    });
  },
  // 后端根据日期获取餐别列表
  getMealTypeList: function (mealDate, mealType, timeShareStatus) {
    let _this = this;
    let param = {
      url:
        "/v4/listMealType?mealDate=" +
        mealDate +
        "&userCode=" +
        wx.getStorageSync("userInfo").userInfo.userCode,
    };
    requestModel.request(
      param,
      (resData) => {
        _this.setData({
          mealTypeList: resData,
        });
        let tmp_mealType = null;
        let tmp_timeShareStatus = null;
        let tmp_takeMealTime = null;
        if (mealType) {
          tmp_mealType = mealType;
          tmp_timeShareStatus = timeShareStatus;
        } else {
          tmp_mealType = resData[0].value;
          tmp_timeShareStatus = resData[0].timeShareStatus;
          tmp_takeMealTime = resData[0].takeMealTime;
          _this.setData({
            activeMealType: resData[0].value,
            activeTimeShareStatus: resData[0].timeShareStatus,
            activeTakeMealTime: resData[0].takeMealTime,
          });
        }
        _this.getFoodTypeList(mealDate, tmp_mealType, tmp_timeShareStatus);
      },
      true
    );
  },
  loadData: function (option) {
    let _this = this;
    _this.initData();
    _this.getUserInfo();
    _this.getPersonalConfig();
    _this.getPayInfo();

    _this.setData({
      recentData: {
        mealDate: option.mealDate,
        mealType: option.mealType,
        takeMealTime: option.takeMealTime,
        timeShareStatus: option.timeShareStatus,
      },
      activeMealDate: option.mealDate,
      activeMealType: option.mealType,
      activeTimeShareStatus: option.timeShareStatus == "true" ? true : false, //这也是个坑 option传递布尔值会被搞成字符串
      activeTakeMealTime: option.takeMealTime,
    });

    _this.getMealDateList();
    _this.getMealTypeList(
      option.mealDate,
      option.mealType,
      option.timeShareStatus
    );
    _this.doNGO(); //处理NGO 当为NGO时 不允许展示价格 以及加入购物车标签
  },
  doNGO: function () {
    let NGOOrgnaizeCode = getApp().globalData.NGOOrgnaizeCode;
    let orgnaizeCode = this.data.userInfo.organizeCode;
    if (NGOOrgnaizeCode == orgnaizeCode) {
      this.setData({
        isNGO: true,
      });
    }
  },
  initData: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
  },

  getUserInfo: function () {
    let _this = this;
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;

    if (tmp_userInfo) {
      _this.setData(
        {
          userInfo: tmp_userInfo,
        },
        () => {
          _this.setOrgAdmin();
        }
      );
    } else {
      requestModel.getUserInfo((userInfo) => {
        _this.setData(
          {
            userInfo: userInfo,
          },
          () => {
            _this.setOrgAdmin();
          }
        );
      }, true);
    }
  },
  setOrgAdmin() {
    let _this = this;
    if (_this.data.userInfo) {
      let { userType, orgAdmin } = _this.data.userInfo;
      let tmp_orgAdmin = orgAdmin;
      if (userType == "ORG_ADMIN" && orgAdmin == true) {
        tmp_orgAdmin = true;
      } else {
        tmp_orgAdmin = false;
        if (userType == "VISITOR") {
          _this.setData({
            showPrice: true,
          });
        }
      }
      _this.setData({
        orgAdmin: tmp_orgAdmin,
      });
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
  doCartList(cartList) {
    // 第一步
    let tmp_newCartList = []; //指：命中当前背后菜单的购物车餐品的列表
    let tmp_newCartFoodCodeList = [];
    cartList.map((item, index) => {
      item.mealTypeList.map((itemIn, indexIn) => {
        itemIn.foods.map((itemInIn, indexInIn) => {
          // 判断该餐是否命中当前背后menu菜单
          if (
            itemIn.mealDate == this.data.activeMealDate &&
            itemIn.mealType == this.data.activeMealType &&
            itemIn.takeMealTime == this.data.activeTakeMealTime
          ) {
            tmp_newCartList.push({
              foodCode: itemInIn.foodCode,
              foodQuantity: itemInIn.foodQuantity,
              mealDate: itemIn.mealDate,
              mealType: itemIn.mealType,
              timeShareStatus: itemIn.timeShareStatus,
              takeMealTime: itemIn.takeMealTime,
            });
            tmp_newCartFoodCodeList.push(itemInIn.foodCode);
          }
        });
      });
    });
    // 第二步
    let new_foodTypeList = JSON.parse(JSON.stringify(this.data.foodTypeList));
    new_foodTypeList.map((item, index) => {
      item.foodList.map((itemIn, indexIn) => {
        let tmp_index = tmp_newCartFoodCodeList.indexOf(itemIn.foodCode);
        if (tmp_index != -1) {
          itemIn.count = tmp_newCartList[tmp_index].foodQuantity;
        } else {
          itemIn.count = 0;
        }
      });
    });
    this.setData({
      foodTypeList: new_foodTypeList,
    });
  },

  getFoodTypeList: function (mealDate, mealType, timeShareStatus) {
    let _this = this;
    let param = {
      url:
        "/v4/listFoodDate?userCode=" +
        _this.data.userInfo.userCode +
        "&mealDate=" +
        mealDate +
        "&mealType=" +
        mealType +
        "&timeShareStatus=" +
        timeShareStatus,
    };
    requestModel.request(param, (resData) => {
      _this.setData(
        {
          foodTypeList: resData.foodTypeList,
          activeInfoExtra: {
            mealSet: resData.mealSet,
            mealType: resData.mealType,
          },
          userTimeAndMealTypeLimit: resData.limit,
        },
        () => {
          _this.getCartList();
          _this.calculateHeightList();
        }
      );
    });
  },
  // 计算购物车高度，大于最大高度就滚动
  calculteCartHeight() {
    let _this = this;
    const query_1 = wx.createSelectorQuery();
    query_1.select(".cart_scrollPosition_forCalculate").boundingClientRect();
    query_1.selectViewport().scrollOffset();
    query_1.exec(function (res) {
      if (res[0] != null) {
        let cartMaxHeight = _this.data.windowHeight / 2;
        if (res[0].height < cartMaxHeight) {
          _this.setData({
            cartHeight: res[0].height,
          });
        } else {
          _this.setData({
            cartHeight: cartMaxHeight,
          });
        }
      }
    });
  },
  // 点击购物车
  clickCartBox() {
    let _this = this;
    if (_this.data.showCartFlag) {
      _this.setData({
        showCartFlag: false,
      });
    } else {
      _this.setData(
        {
          showCartFlag: true,
        },
        () => {
          _this.calculteCartHeight();
        }
      );
    }
  },
  closeCart() {
    this.setData({
      showCartFlag: false,
    });
  },
  handleDonothing() {},
  getCartList: function () {
    let _this = this;
    let param = {
      url:
        "/v4/cart/getTimeShareCartList?userCode=" +
        _this.data.userInfo.userCode,
    };
    requestModel.request(
      param,
      (resData) => {
        if (resData.cartResDtoList.length == 0) {
          _this.setData({
            cartList: resData.cartResDtoList,
            showCartFlag: false,
          });
        } else {
          _this.setData({
            cartList: resData.cartResDtoList,
          });
        }
        _this.doCartList(resData.cartResDtoList);
        if (resData.inValidNum > 0 && _this.data.inValidNumToast) {
          setTimeout(() => {
            wx.showModal({
              title: "是否清空失效餐品?",
              content: "存在失效餐品 x " + resData.inValidNum,
              confirmText: "是",
              cancelText: "不清空",
              success: function (res) {
                if (res.confirm) {
                  _this.clearInvalidFoods();
                }
              },
              complete: function (res) {
                _this.setData({
                  inValidNumToast: false,
                  inValidNum: resData.inValidNum,
                });
              },
            });
          }, 2000);
        }
      },
      true
    );
  },

  getPayInfo: function () {
    let _this = this;
    let param = {
      url: "/v4/cart/getNeedPayAmount?userCode=" + _this.data.userInfo.userCode,
    };
    requestModel.request(
      param,
      (resData) => {
        _this.setData({
          payInfo: resData,
        });
      },
      true,
      (resData) => {
        if (resData.code == 4031 || resData.code == 4017) {
          setTimeout(() => {
            wx.showModal({
              title: "需要清空购物车",
              content: "存在下架餐品",
              confirmText: "清空",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  _this.clearFoods();
                }
              },
            });
          }, 2000);
        }
      },
      true
    );
  },

  // 点击日期(e)
  clickMealDate(e) {
    let _this = this;
    let { index, item } = e.currentTarget.dataset;
    // 如果点击已经是激活状态的 则不处理
    if (_this.data.activeMealDate == item.mealDate) {
      return;
    } else {
      _this.setData({
        activeMealDate: item.mealDate,
      });
      _this.getMealTypeList(item.mealDate, null, null);
    }
  },

  // 点击餐时
  clickMealType(e) {
    let _this = this;
    let { index, item } = e.currentTarget.dataset;
    // 如果点击已经是激活状态的 则不处理
    if (
      (_this.data.activeMealType == item.value &&
        _this.data.activeTakeMealTime == item.takeMealTime) ||
      ""
    ) {
      return;
    } else {
      _this.setData(
        {
          activeMealType: item.value,
          activeTimeShareStatus: item.timeShareStatus,
          activeTakeMealTime: item.takeMealTime || "",
        },
        () => {
          _this.getFoodTypeList(
            _this.data.activeMealDate,
            item.value,
            item.timeShareStatus
          );
        }
      );
    }
  },
  // 监听最外层的滚动
  onScrollOut(e) {
    let _this = this;
    if (e.detail.scrollTop >= 40) {
      //大于等于40就显示
      wx.setNavigationBarTitle({
        title:
          "预约" +
          _this.data.activeMealDate +
          " " +
          _this.data.mealTypeMap[_this.data.activeMealType],
      });
    } else {
      wx.setNavigationBarTitle({
        title: "",
      });
    }
  },

  // 计算右侧的高度列表
  calculateHeightList: function () {
    let _this = this;
    let tmp_listHeight = [0]; //首元素置为0 下面的循环次数为 rect.length-1 就能保证不会多出一次
    let totalHeight = 0;
    wx.createSelectorQuery()
      .selectAll(".c_foodPosition_forCalculate")
      .boundingClientRect(function (rect) {
        for (let i = 0; i < rect.length - 1; i++) {
          totalHeight = totalHeight + rect[i].height;
          tmp_listHeight.push(totalHeight);
        }
        _this.data.listHeight = tmp_listHeight;
      })
      .exec();
  },
  // 监听右层的滚动
  onScrollRight: function (e) {
    let _this = this;
    //允许触发滚动事件，才执行滚动事件
    let scrollY = e.detail.scrollTop;
    let listHeightLength = _this.data.listHeight.length;
    for (let i = 0; i < listHeightLength; i++) {
      let height1 = _this.data.listHeight[i];
      let height2 = _this.data.listHeight[i + 1]; //listHeight[length]返回undefined,所以可以用!height2做判断不是最后一个
      if (scrollY >= height1 - 1 && scrollY < height2) {
        if (i != _this.data.activeFoodType) {
          _this.setData({
            activeFoodType: i,
          });
        }
      }
    }
  },

  // 购物车 点击加号，将餐品加一
  clickAddOneFood(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_clickMenuMinus",
      time: 300,
      success: () => {
        let item = e.currentTarget.dataset.fooditem;
        let mealDate = e.currentTarget.dataset.mealdate;
        let mealType = e.currentTarget.dataset.mealtype;
        let mealTypeItem = e.currentTarget.dataset.mealtypeitem;
        let param = {
          url: config.baseUrlPlus + "/v3/cart/addCart",
          method: "post",
          data: {
            userCode: _this.data.userInfo.userCode,
            foodCode: item.foodCode,
            foodName: item.foodName,
            foodPrice: item.foodPrice,
            foodQuantity: 1,
            image: item.image,
            mealDate: mealDate,
            mealType: mealType,
            supplement: false,
            canMeal: item.canMeal,
            tempImage: item.tempImage,
            timeShareStatus: mealTypeItem.timeShareStatus,
            takeMealTime: mealTypeItem.takeMealTime,
            isFoodQuota: item.isFoodQuota,
          },
        };
        request(param, (resData) => {
          if (resData.data.code === 200) {
            wx.showToast({
              title: "添加成功",
              duration: 1000,
            });
            _this.getPayInfo();
            _this.getCartList();
          } else {
            wx.showToast({
              title: resData.data.msg,
              image: "/images/msg/error.png",
              duration: 2000,
            });
          }
        });
      },
    });
  },

  // 购物车 点击减号，将餐品减一
  clickMinusOneFood(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_clickMenuMinus",
      time: 300,
      success: () => {
        let item = e.currentTarget.dataset.fooditem;
        let mealDate = e.currentTarget.dataset.mealdate;
        let mealType = e.currentTarget.dataset.mealtype;
        let mealTypeItem = e.currentTarget.dataset.mealtypeitem;
        let param = {
          url: config.baseUrlPlus + "/v3/cart/delCartNumber",
          method: "post",
          data: {
            userCode: _this.data.userInfo.userCode,
            foodCode: item.foodCode,
            foodName: item.foodName,
            foodPrice: item.foodPrice,
            foodQuantity: 1,
            mealDate: mealDate,
            mealType: mealType,
            timeShareStatus: mealTypeItem.timeShareStatus,
            takeMealTime: mealTypeItem.takeMealTime,
          },
        };
        request(param, (resData) => {
          if (resData.data.code === 200) {
            wx.showToast({
              title: "减少成功",
              duration: 1000,
            });
            _this.getPayInfo();
            _this.getCartList();
          } else {
            wx.showToast({
              title: resData.data.msg,
              image: "/images/msg/error.png",
              duration: 2000,
            });
          }
        });
      },
    });
  },

  clickMenuAdd(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_clickMenuMinus",
      time: 300,
      success: () => {
        let foodTypeItem = e.currentTarget.dataset.foodtypeitem;
        let foodItem = e.currentTarget.dataset.fooditem;
        let foodTypeIndex = e.currentTarget.dataset.foodtypeindex;
        let foodIndex = e.currentTarget.dataset.foodindex;
        if (
          foodItem.foodQuota &&
          foodItem.count == foodItem.foodQuota.quotaNum
        ) {
          wx.showToast({
            title: "超出限购",
            image: "/images/msg/error.png",
            duration: 2000,
          });
        } else if (foodItem.foodQuota && foodItem.foodQuota.surplusNum == 0) {
          wx.showToast({
            title: "库存为0",
            image: "/images/msg/error.png",
            duration: 2000,
          });
        } else {
          let tmp_isFoodQuota = null;
          if (foodItem.foodQuota && foodItem.foodQuota.foodCode) {
            tmp_isFoodQuota = true;
          } else {
            tmp_isFoodQuota = false;
          }
          let param = {
            url: config.baseUrlPlus + "/v3/cart/addCart",
            method: "post",
            data: {
              userCode: _this.data.userInfo.userCode,
              foodCode: foodItem.foodCode,
              foodName: foodItem.foodName,
              foodPrice: foodItem.foodPrice,
              foodQuantity: 1,
              mealDate: _this.data.activeMealDate,
              mealType: _this.data.activeMealType,
              takeMealTime: _this.data.activeTakeMealTime || "",
              image: foodItem.image,
              foodTypeIndex,
              foodIndex,
              supplement: false,
              canMeal: foodItem.canMeal,
              tempImage: foodItem.tempImage,
              timeShareStatus: _this.data.activeTimeShareStatus,
              takeMealTime: _this.data.activeTakeMealTime,
              isFoodQuota: tmp_isFoodQuota,
            },
          };
          request(param, (resData) => {
            if (resData.data.code === 200) {
              wx.showToast({
                title: "添加成功",
                duration: 1000,
              });
              _this.getPayInfo();
              _this.getCartList();
            } else {
              wx.showToast({
                title: resData.data.msg,
                image: "/images/msg/error.png",
                duration: 2000,
              });
            }
          });
        }
      },
    });
  },

  clickMenuMinus(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_clickMenuMinus",
      time: 300,
      success: () => {
        let foodTypeItem = e.currentTarget.dataset.foodtypeitem;
        let foodItem = e.currentTarget.dataset.fooditem;
        let foodTypeIndex = e.currentTarget.dataset.foodtypeindex;
        let foodIndex = e.currentTarget.dataset.foodindex;
        if (foodItem.count == 0) {
          wx.showToast({
            title: "已经为0",
            image: "/images/msg/error.png",
            duration: 2000,
          });
        } else {
          let param = {
            url: config.baseUrlPlus + "/v3/cart/delCartNumber",
            method: "post",
            data: {
              userCode: _this.data.userInfo.userCode,
              foodCode: foodItem.foodCode,
              foodName: foodItem.foodName,
              foodPrice: foodItem.foodPrice,
              foodQuantity: 1,
              mealDate: _this.data.activeMealDate,
              mealType: _this.data.activeMealType,
              timeShareStatus: _this.data.activeTimeShareStatus,
              takeMealTime: _this.data.activeTakeMealTime,
              image: foodItem.image,
              foodTypeIndex,
              foodIndex,
            },
          };
          request(param, (resData) => {
            if (resData.data.code === 200) {
              wx.showToast({
                title: "减少成功",
                duration: 1000,
              });
              _this.getPayInfo();
              _this.getCartList();
            } else {
              wx.showToast({
                title: resData.data.msg,
                image: "/images/msg/error.png",
                duration: 2000,
              });
            }
          });
        }
      },
    });
  },

  clearFoods: function () {
    let _this = this;
    let param = {
      url:
        config.baseUrlPlus +
        "/v3/cart/deleteShoppingCart?userCode=" +
        _this.data.userInfo.userCode,
      method: "post",
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        wx.showToast({
          title: "已清空",
          duration: 2000,
        });
        _this.getPayInfo();
        _this.getCartList();
        _this.setData({
          showCartFlag: false,
        });
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });
  },
  clearInvalidFoods: function () {
    let _this = this;
    let param = {
      url:
        config.baseUrlPlus +
        "/v3/cart/clearInvalidationFood?userCode=" +
        _this.data.userInfo.userCode,
      method: "post",
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        wx.showToast({
          title: "已清空",
          duration: 2000,
        });
        _this.getPayInfo();
        _this.getCartList();
        _this.setData({
          showCartFlag: false,
        });
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });
  },
  // 奥美凯企业的个性化，限制员工日期和餐别进行点餐，狗日的奥美凯
  doLimit() {
    let _this = this;
    let tmp_dateParamList = []; //当前选择了餐品的天是哪些天
    _this.data.cartList.forEach((item) => {
      tmp_dateParamList.push(item.mealDate);
    });
    let param = {
      url: "/organizeUserOrderDeadline/queryByUserCode",
      method: "post",
      data: {
        userCode: _this.data.userInfo.userCode,
        mealDates: tmp_dateParamList,
      },
    };
    requestModel.request(
      param,
      (data) => {
        if (data.isLimit) {
          wx.showModal({
            title: "提示",
            content: "选择的日期超出限制，请修改日期或联系公司管理人员",
            confirmText: "我知道了",
            showCancel: false,
          });
        } else {
          //false代表没有被限制，允许点餐（绝大多数用户都是这种情况）
          wx.navigateTo({
            url: "/pages/fsmenu/preOrder/preOrder",
          });
        }
      },
      true
    );
  },
  goToPreOrder() {
    let _this = this;
    if (_this.data.inValidNum > 0 && _this.data.payInfo.cartFoodNumber == 0) {
      wx.showModal({
        title: "是否清空失效餐品?",
        content: "存在失效餐品 x " + _this.data.inValidNum,
        confirmText: "是",
        cancelText: "不清空",
        success: function (res) {
          if (res.confirm) {
            _this.clearInvalidFoods();
          }
        },
        complete: function (res) {
          _this.setData({
            inValidNumToast: false,
          });
        },
      });
      return;
    }
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_goToPreOrder",
      time: 1000,
      success: () => {
        let chaolibaozhuangOrgnaizeCode =
          getApp().globalData.chaolibaozhuangOrgnaizeCode;
        if (_this.data.userInfo.organizeCode == chaolibaozhuangOrgnaizeCode) {
          // 超力包装企业的个性化，限制员工日期和餐别进行点餐，狗日的超力
          _this.doLimit();
        } else {
          wx.navigateTo({
            url: "/pages/fsmenu/preOrder/preOrder",
          });
        }
      },
    });
  },
  // 点击左边的餐品分类
  clickFoodType: function (e) {
    let _this = this;
    _this.setData({
      activeFoodType: e.currentTarget.dataset.foodtypeindex,
      scrollToView: "order" + e.currentTarget.dataset.foodtypeindex,
    });
  },
  //用于解决小程序的遮罩层滚动穿透
  preventTouchMove: function () {},
  /* 餐品详情 */
  handleGotoFoodDetail: function (e) {
    wx.navigateTo({
      url:
        "/pages/menu/foodDetail/foodDetail?foodCode=" +
        e.currentTarget.dataset.foodcode +
        "&mealDate=" +
        this.data.activeMealDate +
        "&from=menu",
    });
  },
  handleBindOrg() {
    wx.showToast({
      title: "未绑定企业",
      image: "/images/msg/error.png",
      duration: 2000,
    });
  },
});
