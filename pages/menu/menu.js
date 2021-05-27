import { base } from "../../comm/public/request";
import config from "../../comm_plus/config/config.js";
import { request } from "../../comm_plus/public/request.js";
import jiuaiDebounce from "../../comm_plus/jiuai-debounce/jiuai-debounce.js";

let requestModel = new base();
Page({
  data: {
    // 限制员工在具体日期的具体餐别点餐
    userTimeAndMealTypeLimit: false,

    //超力包装需求，每日只可使用一次餐标
    limitStandard: false,

    // 因为是一天的订餐，所以下面的七个都是对象，格式都是{LUNCH:{},DINNER:{}}或者{LUNCH:[],DINNER:[]}
    allMenuData: [...Array(14)].map(() => {
      return { limitStandard_used: false };
    }), // 返回的所有数据 //添加了每道菜 加入购物车的个数(foodCount)的餐品列表，foods应该是MenuData里的foods，即只包括类别和相应的菜
    allMenuDataCopy: [...Array(14)].map(() => {
      return { limitStandard_used: false };
    }), // 返回的所有数据 //添加了每道菜 加入购物车的个数(foodCount)的餐品列表，foods应该是MenuData里的foods，即只包括类别和相应的菜

    activeDayIndex: 0, //当前被点击的日期的index

    //选择的食物的 menutypeIndex和foodIndex ，以及选中的食物，选中的餐品的个数
    selectedFoodsIndex: [...Array(14)].map(() => {
      return { count: 0 };
    }),
    //用于清空购物车copy的
    selectedFoodsIndexCopy: [...Array(14)].map(() => {
      return { count: 0 };
    }),
    //menuCountList: [{}, {}, {}, {}, {}, {}, {}], //每个category点了几个菜
    menuCountList: [...Array(14)].map(() => {
      return {};
    }),
    //menuCountListCopy: [{}, {}, {}, {}, {}, {}, {}], //用于清空购物车
    menuCountListCopy: [...Array(14)].map(() => {
      return {};
    }),

    getdataalready: false, //解决在没有从后台得到数据就做if判断并加载else的问题
    getdataalready2: false, //解决在没有从后台得到数据就做if判断并加载else的问题

    //订餐信息
    mealTypeInfo: "", //当天企业可定的餐时是否可以预定及截止时间
    mealTypeItem: "", // 选择的哪个时餐

    totalCount: 0, // 购物车中物品个数
    totalMoney: 0, //购物车中餐品的总金额
    realTotalMoney: 0, // totalMoney-totalMoneyRealDeduction后得到的钱

    timer: null,
    windowHeight: 500,
    mealtyleListBottom: 100,

    scrollToView: "id_0",
    selectedFoods: [], //选择的食物的 menutypeIndex和foodIndex

    totalMoneyRealDeduction: 0, //企业餐标一起减免的钱
    listHeight: [], //这个数组记录每个餐类的"之前所有餐类描述+所有具体餐品"的占用高度值

    cartHeight: 100, //购物车的高度 设置为2/1windowHeight的高度，最高为2/1windowHeight的高度
    label_bottom: -1,
    cart_top: -1, //初始时设置底部购物车位置的top为负数，在购物车初显时计算其top坐标，以免计算多次
    cart_height: 0, //购物车的高度
    time_remind_height: 0, // 截止时间，倒计时的view的高度

    // 购物车动画
    cartAnimationBottom: 0,
    //  cartAnimationHeight: 0,
    activeDayId: "day0",

    mealEnglistLabel: ["breakfast", "lunch", "dinner", "night"],

    getTimeDataByResponseNow: false, //是否可点击日期和餐时
    totalMoney_back: 0,
    cantMealTotalMoney: 0, //不可使用餐标的总的钱

    /**
     *
     */
    loading: false,
    userInfo: {},
    orgAdmin: false, //管理员身份
    personalConfig: {},
    mealDateList: [],
    mealTypeList: [],
    foodTypeList: {},
    activeInfoExtra: {},
    cartList: [],
    payInfo: {},
    //
    activeMealDate: "",
    activeMealType: "",
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
  },
  //获取排查日期
  getDays(canpintuijianParams) {
    requestModel.getUserCode((userCode) => {
      let url = "/meal/getMealDateAndType?userCode=" + userCode;
      let param = {
        url,
      };
      requestModel.request(param, (data) => {
        // 直接根据序号做判断吗？
        data.forEach((item, index) => {
          let dd = item.mealDate.split("-");
          if (dd.length == 3) {
            item.mealDateShow = dd[1] + "/" + dd[2];
          }
          if (index == 0) {
            item.label = "今天";
          } else if (index == 1) {
            item.label = "明天";
          } else {
            // 周一到周天
            let day = new Date(item.mealDate).getDay();
            switch (day) {
              case 0:
                item.label = "周日";
                break;
              case 1:
                item.label = "周一";
                break;
              case 2:
                item.label = "周二";
                break;
              case 3:
                item.label = "周三";
                break;
              case 4:
                item.label = "周四";
                break;
              case 5:
                item.label = "周五";
                break;
              case 6:
                item.label = "周六";
                break;
            }
          }
        });
        this.setData({
          timeInfo: data,
          getSevenDaysInfoAlready: true,
          getdataalready: true,
        });
        if (canpintuijianParams) {
          data.forEach((item, index) => {
            if (item.mealDate == canpintuijianParams.mealDate) {
              this.setData(
                {
                  activeDayIndex: index,
                  mealTypeItem: canpintuijianParams.mealType.toLowerCase(),
                },
                () => {
                  this.getTimeDataByResponse(canpintuijianParams); // 代表需要定位到餐品推荐分类
                }
              );
            }
          });
        } else {
          for (let i = 0; i < this.data.mealEnglistLabel.length; i++) {
            //5/15 今天一定有可定的餐时吗？即：该公司预定了这个餐时
            let meal = this.data.mealEnglistLabel[i];
            if (data[this.data.activeDayIndex].mealTypeOrder[meal + "Status"]) {
              this.setData({
                mealTypeItem: meal,
              });
              // [qq add] 临时方案 先不走缓存
              this.getTimeDataByResponse();
              // if (!this.data.allMenuData[this.data.activeDayIndex][meal]) {
              //   //表示今天第一个餐时可点餐
              //   this.getTimeDataByResponse();
              // }
              break;
            }
          }
        }
      });
    });
  },

  onLoad: function (option) {
    this.loadData();
  },
  loadData: function () {
    this.initData();
    this.getUserInfo();
    this.getPersonalConfig();
    this.getMealDateAndType();
    this.getCartList();
    this.getPayInfo();
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
    const query2 = wx.createSelectorQuery();
    query2.select("#mealtyleList").boundingClientRect();
    query2.selectViewport().scrollOffset();
    query2.exec(function (res) {
      if (res[0]) {
        _this.setData({
          mealtyleListBottom: res[0].bottom,
        });
      }
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
  getMealDateAndType: function () {
    let _this = this;
    let param = {
      url: "/v3/getMealDateAndType?userCode=" + _this.data.userInfo.userCode,
    };
    _this.setData({
      loading: true,
    });
    requestModel.request(param, (resData) => {
      if (resData && resData.length > 0) {
        if (
          resData[0].dayMealTypeList &&
          resData[0].dayMealTypeList.length > 0
        ) {
          _this.setData(
            {
              activeMealDate: resData[0].mealDate,
              activeMealType: resData[0].dayMealTypeList[0].value,
              mealDateList: resData,
              mealTypeList: resData[0].dayMealTypeList,
            },
            () => {
              _this.getFoodTypeList();
            }
          );
        }
      }
    });
  },
  getFoodTypeList: function () {
    let _this = this;
    let param = {
      url:
        "/v3/getFoodDateList?userCode=" +
        _this.data.userInfo.userCode +
        "&mealDate=" +
        _this.data.activeMealDate +
        "&mealType=" +
        _this.data.activeMealType,
    };
    requestModel.request(param, (resData) => {
      let tmp_menu = { ..._this.data.menu };
      if (tmp_menu.hasOwnProperty(_this.data.activeMealDate) == false) {
        tmp_menu[_this.data.activeMealDate] = {};
      }
      tmp_menu[_this.data.activeMealDate][_this.data.activeMealType] =
        resData.foodTypeList;
      _this.setData(
        {
          foodTypeList: resData.foodTypeList,
          activeInfoExtra: {
            mealSet: resData.mealSet,
            mealType: resData.mealType,
          },
          loading: false,
          menu: tmp_menu,
        },
        () => {
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
  clickCartImg: function () {
    let _this = this;
    if (_this.data.showCartFlag) {
      _this.setData({
        showCartFlag: false,
      });
    } else {
      _this.getCartList();

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
  getCartList: function () {
    let _this = this;
    let param = {
      url: "/v3/cart/getCartList?userCode=" + _this.data.userInfo.userCode,
    };
    requestModel.request(
      param,
      (resData) => {
        _this.setData({
          cartList: resData,
        });
      },
      true
    );
  },

  getPayInfo: function () {
    let _this = this;
    let param = {
      url: "/v3/cart/getNeedPayAmount?userCode=" + _this.data.userInfo.userCode,
    };
    requestModel.request(
      param,
      (resData) => {
        _this.setData({
          payInfo: resData,
        });
      },
      true
    );
  },
  clearCartList: function () {
    let _this = this;
    let param = {
      url:
        "/v3/cart/deleteShoppingCart?userCode=" + _this.data.userInfo.userCode,
    };

    requestModel.request(param, (resData) => {
      if (resData.code == 200) {
        wx.showToast({
          title: "购物车已清空",
          icon: "none",
          duration: 2000,
        });
      } else {
        wx.showToast({
          title: resData.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });
  },
  // 点击日期(e)
  clickMealDate(e) {
    let _this = this;
    let { index, item } = e.currentTarget.dataset;
    // 如果点击已经是激活状态的 则不处理
    if (_this.data.activeMealDate == item.mealDate) {
      return;
    } else {
      _this.setData(
        {
          activeMealDate: item.mealDate,
        },
        () => {
          // 如果点击的天和餐别已经有数据了 则不处理
          if (
            _this.data.menu[item.mealDate] &&
            _this.data.menu[item.mealDate][_this.data.activeMealType]
          ) {
            return;
          } else {
            _this.getFoodTypeList();
          }
        }
      );
    }
  },
  // 点击餐时
  clickMealType(e) {
    let _this = this;
    let { index, item } = e.currentTarget.dataset;
    // 如果点击已经是激活状态的 则不处理
    if (_this.data.activeMealType == item.value) {
      return;
    } else {
      _this.setData(
        {
          activeMealType: item.value,
        },
        () => {
          // 如果点击的天和餐别已经有数据了 则不处理
          if (
            _this.data.menu[_this.data.activeMealDate] &&
            _this.data.menu[_this.data.activeMealDate][item.value]
          ) {
            return;
          } else {
            _this.getFoodTypeList();
          }
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
    let item = e.currentTarget.dataset.fooditem;
    let mealDate = e.currentTarget.dataset.mealdate;
    let mealType = e.currentTarget.dataset.mealtype;
    let tmp_item = {
      ...item,
      mealDate: mealDate,
      mealType: mealType,
    };
    _this.addOneFood(tmp_item);
  },
  // 购物车 点击减号，将餐品减一
  clickMinusOneFood(e) {
    let _this = this;
    let item = e.currentTarget.dataset.fooditem;
    let mealDate = e.currentTarget.dataset.mealdate;
    let mealType = e.currentTarget.dataset.mealtype;
    let tmp_item = {
      ...item,
      mealDate: mealDate,
      mealType: mealType,
    };
    _this.minusOneFood(tmp_item);
  },

  // 点击购物车icon，将餐品加1
  clickCart(e) {
    let _this = this;
    let { item } = e.currentTarget.dataset;
    console.log("@@@@@@@ 2 @@@@@@@ ", item);
    let tmp_item = {
      ...item,
      mealDate: _this.data.activeMealDate,
      mealType: _this.data.activeMealType,
    };

    _this.addOneFood(tmp_item);
  },
  addOneFood(item) {
    let _this = this;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/addCart",
      method: "post",
      data: {
        userCode: _this.data.userInfo.userCode,
        foodCode: item.foodCode,
        foodName: item.foodName,
        foodPrice: item.foodPrice,
        foodQuantity: 1,
        mealDate: item.mealDate,
        mealType: item.mealType,
      },
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        wx.showToast({
          title: "添加成功",
          duration: 2000,
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
  minusOneFood(item) {
    let _this = this;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/delCartNumber",
      method: "post",
      data: {
        userCode: _this.data.userInfo.userCode,
        foodCode: item.foodCode,
        foodName: item.foodName,
        foodPrice: item.foodPrice,
        foodQuantity: 1,
        mealDate: item.mealDate,
        mealType: item.mealType,
      },
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        wx.showToast({
          title: "减少成功",
          duration: 2000,
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
  // 奥美凯企业的个性化，限制员工日期和餐别进行点餐，狗日的奥美凯
  doLimit() {
    let _this = this;
    let tmp_dateParamList = []; //当前选择了餐品的天是哪些天
    _this.data.cartList.forEach((item) => {
      tmp_dateParamList.push(item.mealDate);
    });
    console.log("=======  ======= ", tmp_dateParamList);

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
            url: "/pages/menu/preOrder/preOrder",
          });
        }
      },
      true
    );
  },
  goToPreOrder() {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_goToPreOrder",
      time: 1000,
      success: () => {
        if (!_this.data.personalConfig.xxx) {
          // 奥美凯企业的个性化，限制员工日期和餐别进行点餐，狗日的奥美凯
          _this.doLimit();
        } else {
          wx.navigateTo({
            url: "/pages/menu/preOrder/preOrder",
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
  /**
   * ******************************
   */

  // 根据推荐餐品的id，获取推荐餐品在左侧餐品分类菜单中的index
  getCanpinMenuTypeIndex: function (typeId, foodList, foodCustomizeListLength) {
    let tmp_index = 0;
    let tmp_length = foodList.length;
    for (let i = foodCustomizeListLength; i < tmp_length; i++) {
      if (foodList[i].typeId == typeId) {
        tmp_index = i + foodCustomizeListLength;
        i = tmp_length;
      }
    }
    return tmp_index;
  },
  /* 获取餐品menu信息 */
  getTimeDataByResponse: function (canpintuijianParams) {
    //正在后台请求菜单
    this.setData({
      getTimeDataByResponseNow: true,
    });
    let tmp_mealTypeItem = this.data.mealTypeItem;
    let activeDayIndex = this.data.activeDayIndex;
    let _this = this;
    requestModel.getUserCode((userCode) => {
      let param = {
        url:
          "/food/getFoodDateList?userCode=" +
          userCode +
          "&mealDate=" +
          this.data.timeInfo[activeDayIndex].mealDate +
          "&mealType=" +
          tmp_mealTypeItem.toUpperCase(),
      };
      requestModel.request(
        param,
        (resData) => {
          if (resData.limit === true) {
            _this.setData({
              userTimeAndMealTypeLimit: true,
            });
          } else {
            _this.setData({
              userTimeAndMealTypeLimit: false,
            });
          }

          if (canpintuijianParams) {
            let tmp_menuTypeIndex = _this.getCanpinMenuTypeIndex(
              canpintuijianParams.typeId,
              resData.foodList,
              resData.foodCustomizeList.length
            );
            _this.setData({
              activeFoodType: tmp_menuTypeIndex,
              scrollToView: "order" + tmp_menuTypeIndex,
            });
          }
          //获取加餐所有信息

          resData.totalMoney = 0; //给每天的每个餐时一个点餐的总的金额
          resData.totalMoney_back = 0; //给每天的每个餐时一个总的返的
          resData.totalMoney_meal = 0; //每天的餐时可使用餐标的总金额
          resData.deductionMoney = 0; //每天的餐时抵扣的金额
          // 给每一个餐品添加一个foodCount，用于加号点击时加一减一
          // 给每一个餐品添加一个foodTotalPrice
          // 给每一个餐品添加一个foodTotalOriginalPrice
          let tmp_menuCountList = [];
          let tmp_menuCountListCopy = [];
          let typeIdFoodCode = {};
          resData.foodList.forEach((item, menuTypeIndex) => {
            let a = {};
            a.menuTypeIndex = menuTypeIndex;
            a.foodCodeIndexs = {};
            item.menuTypeIndex = menuTypeIndex;
            item.foodList.forEach((foodItem, foodIndex) => {
              foodItem.menuTypeIndex = menuTypeIndex;
              foodItem.foodIndex = foodIndex;
              a.foodCodeIndexs[foodItem.foodCode] = foodIndex;
            });
            typeIdFoodCode[item.typeId] = a;
          });

          if (
            resData.foodCustomizeList &&
            resData.foodCustomizeList.length > 0
          ) {
            resData.foodCustomizeList.forEach((item, index1) => {
              item.left = true;
              item.foodList.forEach((foodItem, index2) => {
                //要做俩连动，左侧连动正常了，正常没有连动左侧
                foodItem.left = true;
                foodItem.foodCount = 0;
                //判断餐品是不是已经售完
                if (foodItem.beyondStockOrder) {
                  //可超过库存点餐
                  if (
                    foodItem.foodBeyondQuota &&
                    foodItem.foodBeyondQuota.surplusNum == 0
                  ) {
                    foodItem.sellAllOut = true;
                  } else {
                    foodItem.sellAllOut = false;
                  }
                  if (
                    foodItem.foodQuota &&
                    foodItem.foodQuota.surplusNum == 0
                  ) {
                    foodItem.linefoodPrice = true;
                  }
                } else {
                  //不可超过库存点餐
                  if (
                    foodItem.foodQuota &&
                    foodItem.foodQuota.surplusNum == 0
                  ) {
                    foodItem.sellAllOut = true;
                  } else {
                    foodItem.sellAllOut = false;
                  }
                }

                let foodList_menuTypeIndex =
                  typeIdFoodCode[foodItem.typeId].menuTypeIndex;
                let foodList_foodIndex =
                  typeIdFoodCode[foodItem.typeId].foodCodeIndexs[
                    foodItem.foodCode
                  ];
                foodItem.menuTypeIndex = foodList_menuTypeIndex;
                foodItem.foodIndex = foodList_foodIndex;

                //正常连动左侧
                resData.foodList[foodList_menuTypeIndex].foodList[
                  foodList_foodIndex
                ].leftMenuTypeIndex = index1;
                resData.foodList[foodList_menuTypeIndex].foodList[
                  foodList_foodIndex
                ].leftFoodIndex = index2;
              });
              tmp_menuCountList.push(0);
              tmp_menuCountListCopy.push(0);
            });
          }

          resData.foodList.forEach((item) => {
            item.left = false;
            item.foodList.forEach((foodItem) => {
              foodItem.foodTotalPrice = 0;
              foodItem.foodTotalOriginalPrice = 0;
              foodItem.foodCount = 0;
              //判断餐品是不是已经售完
              if (foodItem.beyondStockOrder) {
                //可超过库存点餐
                if (
                  foodItem.foodBeyondQuota &&
                  foodItem.foodBeyondQuota.surplusNum == 0
                ) {
                  foodItem.sellAllOut = true;
                } else {
                  foodItem.sellAllOut = false;
                }
              } else {
                //不可超过库存点餐
                if (foodItem.foodQuota && foodItem.foodQuota.surplusNum == 0) {
                  foodItem.sellAllOut = true;
                } else {
                  foodItem.sellAllOut = false;
                }
              }
            });
            tmp_menuCountList.push(0);
            tmp_menuCountListCopy.push(0);
          });

          // 把标签项的餐品也加上5/30
          // 放在这应该是对的
          if (
            resData.foodCustomizeList &&
            resData.foodCustomizeList.length > 0
          ) {
            resData.foodList = resData.foodCustomizeList.concat(
              resData.foodList
            );
            resData.foodCustomizeListLength = resData.foodCustomizeList.length;
          } else {
            resData.foodCustomizeListLength = 0;
          }
          console.log("ssssss2222", resData.foodList);
          //5/31截止

          //可以不用setData，因为都是0不需要显示
          _this.data.menuCountList[activeDayIndex][tmp_mealTypeItem] =
            tmp_menuCountList;
          _this.data.menuCountListCopy[activeDayIndex][tmp_mealTypeItem] =
            tmp_menuCountListCopy;

          // 下面的复制会不会在allMenuData修改resData时，allMenuDataCopy也一起改变？
          let tmp_allData = _this.data.allMenuData;
          tmp_allData[activeDayIndex][tmp_mealTypeItem] = resData;
          _this.data.allMenuDataCopy[activeDayIndex][tmp_mealTypeItem] =
            JSON.parse(JSON.stringify(resData));

          _this.setData({
            allMenuData: tmp_allData, //保存下所有数据
            getdataalready: true,
          });
          if (resData.mealType.orderStatus && resData.foodList.length !== 0) {
            // 计算购物车的高度
            const query2 = wx.createSelectorQuery();
            query2.select("#cartCount").boundingClientRect();
            query2.selectViewport().scrollOffset();
            query2.exec(function (res) {
              if (res[0]) {
                _this.setData({
                  cartAnimationBottom: res[0].bottom,
                });
              }
            });
            _this.calculateHeightList();
          }
          _this.setData({
            getTimeDataByResponseNow: false,
          });
        },
        false,
        () => {
          this.setData({
            getTimeDataByResponseNow: false,
          });
        }
      );
    });
  },

  // 判断second是否是main的子集 判断的效果不高啊
  isIncludesArray(main, second) {
    let flag = true;
    if (main.length < second.length) {
      flag = false;
    } else {
      for (let i = 0; i < second.length; i++) {
        if (!main.includes(second[i])) {
          flag = false; //不是
          break;
        }
      }
    }
    return flag;
  },

  handleCalculateMoney_back(currnt_menuData) {
    //可低于餐标，并且可以返回金额
    if (
      currnt_menuData.mealSet.underStandardPrice &&
      currnt_menuData.mealType.returnStandard
    ) {
      //大于最低金额并且小于餐标
      if (
        currnt_menuData.totalMoney_meal > 0 &&
        currnt_menuData.totalMoney_meal >=
          currnt_menuData.mealType.lowestStandard &&
        currnt_menuData.totalMoney_meal < currnt_menuData.mealType.standardPrice
      ) {
        // 退回的金额
        let oldTotalMoney_back = currnt_menuData.totalMoney_back;

        currnt_menuData.totalMoney_back = parseFloat(
          currnt_menuData.mealType.standardPrice -
            currnt_menuData.totalMoney_meal
        );

        let totalMoney_back =
          this.data.totalMoney_back -
          oldTotalMoney_back +
          currnt_menuData.totalMoney_back;
        this.setData({
          totalMoney_back: parseFloat(totalMoney_back.toFixed(2)),
        });
      } else {
        // 退回的金额
        let oldTotalMoney_back = currnt_menuData.totalMoney_back;

        currnt_menuData.totalMoney_back = 0;
        let totalMoney_back = this.data.totalMoney_back - oldTotalMoney_back;

        this.setData({
          totalMoney_back: parseFloat(totalMoney_back.toFixed(2)),
        });
      }
    }
  },

  // 超力包装需求 计算当天是否被占用餐标
  calculateLimitStandardUsed(dayMealType) {
    let breakfastUsed = false; //占用状态
    let lunchUsed = false;
    let dinnerUsed = false;
    let nightUsed = false;
    if (
      dayMealType.breakfast &&
      dayMealType.breakfast.limitStandardFoodTypeUsed == true
    ) {
      breakfastUsed = true;
    }
    if (
      dayMealType.lunch &&
      dayMealType.lunch.limitStandardFoodTypeUsed == true
    ) {
      lunchUsed = true;
    }
    if (
      dayMealType.dinner &&
      dayMealType.dinner.limitStandardFoodTypeUsed == true
    ) {
      dinnerUsed = true;
    }
    if (
      dayMealType.night &&
      dayMealType.night.limitStandardFoodTypeUsed == true
    ) {
      nightUsed = true;
    }
    if (breakfastUsed && lunchUsed && dinnerUsed && nightUsed) {
      return true;
    } else {
      return false;
    }
  },

  // 点击减号，将餐品减一
  handleMinusfood(e) {
    let _this = this;
    let menutypeIndex = e.currentTarget.dataset.menutypeindex; // 餐品类别的index
    let foodIndex = e.currentTarget.dataset.foodindex; // 在menutypeIndex的foods的index
    let tmp_mealTypeItem = this.data.mealTypeItem;
    let activeDayIndex = this.data.activeDayIndex;
    let tmp_oneFood =
      this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foodList[
        menutypeIndex
      ].foodList[foodIndex];
    //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
    // 应该是下面所有的操作都是在减1之后
    if (tmp_oneFood.foodCount > 0) {
      // 计算totalMoney, totalDeduction，totalRealMonty
      let minusFoodPrice = tmp_oneFood.foodPrice;
      if (tmp_oneFood.foodQuota) {
        let tmpstock = tmp_oneFood.foodQuota;
        let tmpfoodCount = tmp_oneFood.foodCount;
        if (
          (tmpstock.surplusNum || tmpstock.surplusNum == 0) &&
          tmpfoodCount > tmpstock.surplusNum
        ) {
          //超出库存了，则减去的价格为原价 8--28
          if (tmp_oneFood.linefoodPrice) {
            minusFoodPrice = tmp_oneFood.foodOriginalPrice;
          }
        }
      }
      tmp_oneFood.foodCount -= 1;
      //8--28添加
      if (tmp_oneFood.linefoodPrice) {
        let tmpfoodCount_more =
          tmp_oneFood.foodCount - tmp_oneFood.foodQuota.surplusNum;
        if (tmpfoodCount_more == 0 && tmp_oneFood.foodQuota.surplusNum > 0) {
          tmp_oneFood.linefoodPrice = false;
        }
      }

      //5/31判断是不是左侧标签
      let left = e.currentTarget.dataset.left;
      let leftmenuindex = e.currentTarget.dataset.leftmenuindex;
      let leftfoodindex = e.currentTarget.dataset.leftfoodindex;
      if (left) {
        //表示点击的是左侧标签
        this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foodList[
          leftmenuindex
        ].foodList[leftfoodindex].foodCount -= 1;
        this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foodList[
          leftmenuindex
        ].foodList[leftfoodindex].linefoodPrice = tmp_oneFood.linefoodPrice;
      } else {
        //表示点击的是正常餐品，要连动修改左侧标签餐品
        if (tmp_oneFood.leftMenuTypeIndex != undefined) {
          //表示正常餐品级联了左侧标签餐品
          this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foodList[
            tmp_oneFood.leftMenuTypeIndex
          ].foodList[tmp_oneFood.leftFoodIndex].foodCount -= 1;
          this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foodList[
            tmp_oneFood.leftMenuTypeIndex
          ].foodList[tmp_oneFood.leftFoodIndex].linefoodPrice =
            tmp_oneFood.linefoodPrice;
        }
      }

      this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foodList[
        menutypeIndex
      ].foodList[foodIndex] = tmp_oneFood;
      // 总的数目减1
      let temptotalCount = this.data.totalCount - 1;

      let tmp_menuCountList = this.data.menuCountList; //menu菜单右上角加1
      tmp_menuCountList[activeDayIndex][tmp_mealTypeItem][menutypeIndex] -= 1; // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整

      // 计算totalMoney, totalDeduction，totalRealMonty
      let tmptotalMoney = this.data.totalMoney - minusFoodPrice;

      let currnt_menuData =
        this.data.allMenuData[activeDayIndex][tmp_mealTypeItem];
      currnt_menuData.totalMoney -= minusFoodPrice;
      currnt_menuData.totalMoney = parseFloat(
        currnt_menuData.totalMoney.toFixed(2)
      );
      if (tmp_oneFood.canMeal) {
        //可使用餐标
        currnt_menuData.totalMoney_meal -= minusFoodPrice;
      } else {
        //计算不可使用餐标的钱的总额 2019--10--7
        let tmp_cantMealTotalMoney = this.data.cantMealTotalMoney;
        tmp_cantMealTotalMoney = parseFloat(
          (tmp_cantMealTotalMoney - minusFoodPrice).toFixed(2)
        );
        this.setData({
          cantMealTotalMoney: tmp_cantMealTotalMoney,
        });
      }

      /**
       * 超力包装需求 - 减
       */
      let tmp_allMenuData = _this.data.allMenuData;
      let tmp_mealTypeItemDetail =
        tmp_allMenuData[activeDayIndex][tmp_mealTypeItem];

      if (_this.data.limitStandard === true) {
        // 先把该别的餐品(必需具备可使用餐标属性)数量之和进行 -1
        if (tmp_oneFood.canMeal) {
          tmp_mealTypeItemDetail.mealTypeCanMealTotalCount--;
        }
        if (tmp_allMenuData[activeDayIndex].limitStandard_used == true) {
          //当天餐标已占用
          if (tmp_mealTypeItemDetail.limitStandardFoodTypeUsed == true) {
            //我餐别已占用-》可继续使用餐标-》使用old
            tmp_mealTypeItemDetail.mealType.standardPrice =
              tmp_mealTypeItemDetail.mealType.standardPriceOld;
            // 当该餐别的 mealTypeCanMealTotalCount 降低到0时，需要释放该餐别的占用餐标
            if (tmp_oneFood.canMeal) {
              if (tmp_mealTypeItemDetail.mealTypeCanMealTotalCount == 0) {
                tmp_mealTypeItemDetail.limitStandardFoodTypeUsed = false;
                tmp_allMenuData[activeDayIndex].limitStandard_used_old =
                  tmp_allMenuData[activeDayIndex].limitStandard_used;
                tmp_allMenuData[activeDayIndex].limitStandard_used =
                  _this.calculateLimitStandardUsed(
                    tmp_allMenuData[activeDayIndex]
                  );
                if (
                  tmp_allMenuData[activeDayIndex].limitStandard_used !=
                  tmp_allMenuData[activeDayIndex].limitStandard_used_old
                ) {
                  //这种情况下，要强制刷新
                  wx.showModal({
                    title: "每天只可用1次餐标",
                    content: "将清空购物车,请重新选择",
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        _this.clearFoods();
                        wx.showToast({
                          title: "已清空购物车",
                          image: "/images/msg/success.png",
                          duration: 2000,
                        });
                      }
                    },
                  });
                }
              }
            }
          } else {
            // 他餐别已占用 -》不可再使用餐标-》直接设置0
            tmp_mealTypeItemDetail.mealType.standardPrice = 0;
          }
        } else {
          if (tmp_oneFood.canMeal) {
            //该餐品的可使用餐标的属性 将决定 本次点击+是否改变该餐别占用当天餐标
            tmp_allMenuData[activeDayIndex].limitStandard_used = true;
            tmp_mealTypeItemDetail.limitStandardFoodTypeUsed = true;
          }
        }
      }

      // 这种每次重新计算的方法好吗
      let new_deduction = 0;

      //如果是企业管理员
      if (this.data.orgAdmin) {
        new_deduction = currnt_menuData.totalMoney;
      } else {
        if (
          currnt_menuData.mealSet.userCanStandardPrice &&
          currnt_menuData.mealType.standardPrice > 0
        ) {
          // 企业餐标可用并且大于0
          // 动态显示抵扣多少钱的，奇怪的要求 5/17
          if (
            currnt_menuData.totalMoney_meal <
            currnt_menuData.mealType.standardPrice
          ) {
            new_deduction = currnt_menuData.totalMoney_meal;
          } else {
            new_deduction = currnt_menuData.mealType.standardPrice;
          }

          this.handleCalculateMoney_back(currnt_menuData);
        }
      }

      let oldDeduction = currnt_menuData.deductionMoney;
      currnt_menuData.deductionMoney = parseFloat(new_deduction.toFixed(2));

      let tmp_totalMoneyRealDeduction = parseFloat(
        (
          this.data.totalMoneyRealDeduction -
          oldDeduction +
          new_deduction
        ).toFixed(2)
      );
      let tmp_realTotalMoney =
        tmptotalMoney - tmp_totalMoneyRealDeduction > 0
          ? tmptotalMoney - tmp_totalMoneyRealDeduction
          : 0;

      this.setData({
        allMenuData: this.data.allMenuData,
        totalCount: temptotalCount,
        menuCountList: tmp_menuCountList,
        totalMoney: parseFloat(tmptotalMoney.toFixed(2)),
        realTotalMoney: parseFloat(tmp_realTotalMoney.toFixed(2)),
        totalMoneyRealDeduction: tmp_totalMoneyRealDeduction,
      });

      // 只有等于0，才从购物车中删除
      if (tmp_oneFood.foodCount == 0) {
        let tempselectFoodsIndex = this.data.selectedFoodsIndex;
        tempselectFoodsIndex[activeDayIndex].count -= 1; //当天的总的个数减1
        tempselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foodList[
          menutypeIndex
        ] = tempselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foodList[
          menutypeIndex
        ].filter((item) => {
          return item != foodIndex;
        });

        this.setData({
          selectedFoodsIndex: tempselectFoodsIndex,
        });
      } else {
        let tempselectFoodsIndex = this.data.selectedFoodsIndex;
        tempselectFoodsIndex[activeDayIndex].count -= 1; //当天的总的个数减1
        this.setData({
          selectedFoodsIndex: tempselectFoodsIndex,
        });
      }
    }
  },

  // 点击购物车图标
  handleClickBox() {
    if (this.data.totalCount > 0) {
      this.setData({
        showCartFlag: !this.data.showCartFlag,
      });
      if (this.data.showCartFlag) {
        //获取计算购物车的scroll的高度所必须的参数top_1
        this.getSelectedFoods();
        this.calculteCartHeight();
      }
    }
  },
  // 在点击购物车图标查看购物车或者点击去结算时，计算菜单信息
  getSelectedFoods() {
    let tmpselectFoodsIndex = this.data.selectedFoodsIndex;
    let tmp_allData = this.data.allMenuData;
    let mealEnglistLabel = this.data.mealEnglistLabel;

    // 是1到7吗？
    for (let day = 0; day < 14; day++) {
      if (tmpselectFoodsIndex[day].count > 0) {
        for (let i in mealEnglistLabel) {
          // x 为餐时
          let tmpselectedfoods = [];
          let x = mealEnglistLabel[i];
          if (tmpselectFoodsIndex[day][x]) {
            for (let y in tmpselectFoodsIndex[day][x].foodList) {
              // y 为选择的餐品index
              let onecategoryfoods = tmp_allData[day][x].foodList[y].foodList;
              for (
                let i = 0;
                i < tmpselectFoodsIndex[day][x].foodList[y].length;
                i++
              ) {
                const onefood =
                  onecategoryfoods[tmpselectFoodsIndex[day][x].foodList[y][i]];
                if (onefood.foodCount > 0) {
                  onefood.menuItemIndex = parseInt(y);
                  onefood.foodIndex =
                    tmpselectFoodsIndex[day][x].foodList[y][i];
                  // totalPrice只有在购物车列表和订单信息那里才需要展示，所以在menu列表那边add和minus时不需要写
                  //不需要的时候就不要计算

                  if (onefood.foodQuota) {
                    //说明有库存 要不要判断不为0啊
                    let tmpstock = onefood.foodQuota;
                    let tmpfoodCount = onefood.foodCount;
                    if (
                      (tmpstock.surplusNum || tmpstock.surplusNum == 0) &&
                      tmpfoodCount > tmpstock.surplusNum
                    ) {
                      //超出库存
                      //如果不可以按原价点
                      let overCount = parseInt(
                        onefood.foodCount - tmpstock.surplusNum
                      );
                      onefood.foodTotalPrice = parseFloat(
                        (
                          onefood.foodPrice * tmpstock.surplusNum +
                          onefood.foodOriginalPrice * overCount
                        ).toFixed(2)
                      );
                    } else {
                      onefood.foodTotalPrice = parseFloat(
                        (onefood.foodPrice * onefood.foodCount).toFixed(2)
                      );
                    }
                  } else {
                    onefood.foodTotalPrice = parseFloat(
                      (onefood.foodPrice * onefood.foodCount).toFixed(2)
                    );
                  }
                  onefood.foodTotalOriginalPrice = parseFloat(
                    (onefood.foodOriginalPrice * onefood.foodCount).toFixed(2)
                  );
                  tmpselectedfoods.push(JSON.parse(JSON.stringify(onefood)));
                }
              }
            }
            tmpselectFoodsIndex[day][x].selectedFoods = tmpselectedfoods;
            //这个deductionMoney会不会不存在？需要先判断吗？不存在就让deductionMoney=0
            //TODO--5/6
            tmpselectFoodsIndex[day][x].deductionMoney =
              this.data.allMenuData[day][x].deductionMoney;
            tmpselectFoodsIndex[day][x].payMoney = parseFloat(
              (
                this.data.allMenuData[day][x].totalMoney -
                this.data.allMenuData[day][x].deductionMoney
              ).toFixed(2)
            );
          }
        }
      }
    }

    this.setData({
      selectedFoodsIndex: tmpselectFoodsIndex,
    });
  },

  closeModal() {
    this.setData({
      notUpToStandardPrice: false,
    });
  },

  refreshUser: function () {
    requestModel.getUserInfo((userInfo) => {
      let limitStandard = false;
      if (userInfo) {
        limitStandard = userInfo.limitStandard;
      }
      this.setData({
        limitStandard: limitStandard,
      });
    }, true);
  },

  //用于解决小程序的遮罩层滚动穿透
  preventTouchMove: function () {},
  /* 餐品详情 */
  handleGotoFoodDetail: function (e) {
    wx.navigateTo({
      url:
        "/pages/food/food?foodCode=" +
        e.currentTarget.dataset.foodcode +
        "&mealDate=" +
        this.data.timeInfo[this.data.activeDayIndex].mealDate +
        "&mealType=" +
        this.data.mealTypeItem +
        "&typeName=" +
        e.currentTarget.dataset.typename,
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
