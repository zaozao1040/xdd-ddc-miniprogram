import { home } from "../home/home-model.js";
let homeModel = new home();

import { base } from "../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 页面预加载
    preLoading_request: true,
    preLoading_force: true,

    swiperDefaultIndex: 0,
    imageWidth: wx.getSystemInfoSync().windowWidth,
    timer: null,
    canClick: true,
    showCheckFlag: false, //显示审核状态框标志 默认不显示
    registered: false,

    imagesList: {},
    //
    homeOrderList: [], //首页取餐列表
    orderStatusMap: {
      NO_PAY: "未支付",
      PAYED_WAITINT_CONFIRM: "已支付",
      CONFIRM_WAITING_MAKE: "待制作",
      MAKING: "开始制作",
      MAKED_WAITING_DELIVERY: "待配送",
      DELIVERING: "配送中",
      DELIVERED_WAITING_PICK: "待取货",
      PICKED_WAITING_EVALUATE: "待评价",
      COMPLETED_EVALUATED: "已评价",
      NO_PICK_WAITING_BACK: "超时未取货待取回",
      USER_CANCEL: "已取消",
      SYSTEM_CANCEL: "系统取消",
    },
    mealTypeMap: {
      BREAKFAST: "早餐",
      LUNCH: "午餐",
      DINNER: "晚餐",
      NIGHT: "夜宵",
    },
    mapMenutypeIconName: {
      BREAKFAST: "zao",
      LUNCH: "wu1",
      DINNER: "night",
      NIGHT: "shenye",
    },

    //
    swiperCurrentIndex: 0, //当前轮播图active的index

    noticeData: null, //记录公告内容
    hasNotice: false, //默认没有轮播公告
    showedNoticeData: [], //点击轮播公告时显示的一条公告的内容
    showOneNotice: false, //点击轮播公告时显示公告弹出框
    hasWindowNotice: false, //默认没有window公告
    showWindowNotice: false, //默认不显示window公告
    windowNoticeData: null, // window公告数据

    mealTypeMapSmall: {
      breakfast: "早餐",
      lunch: "午餐",
      dinner: "晚餐",
      night: "夜宵",
    },

    orgAdminNoMealFlag: false, //企业管理员，无点餐权限弹窗
    orgAdminMealFlag: false, //企业管理员，点餐提示弹窗
    windowHeight: 500,
    takeorderModalShowInit: true,

    // 餐品推荐
    tuijianHeight: 0,
    tuijianOneHeight: 0,
    canpintuijianList: [],
  },

  navigateToMenu() {
    wx.navigateTo({
      url: "/pages/menu/menu",
    });
  },
  //监听轮播图切换图片，获取图片的下标
  onSwiperChange: function (e) {
    this.setData({
      swiperCurrentIndex: e.detail.current,
    });
  },

  //获取首页图片
  initHome: function () {
    let param = {
      url: "/home/getHomeImage?userCode=" + wx.getStorageSync("userCode"),
    };
    requestModel.request(param, (data) => {
      this.setData({
        imagesList: data,
        preLoading_request: false, //轮播图接口来作为控制首页展示的充分条件之一
      });
    });
  },
  clickStartMeal: function () {
    if (!wx.getStorageSync("userInfo")) {
      this.gotoMenu();
    } else {
      // 针对 药明康德 企业，要先判断是否开启了“先评价后点餐”的个性化设置
      let ymkdOrgnaizeCodeList = getApp().globalData.ymkdOrgnaizeCodeList;
      let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
      let organizeCode = tmp_userInfo ? tmp_userInfo.organizeCode : "";
      // let organizeCode = wx.getStorageSync("userInfo").userInfo.organizeCode;
      let userCode = wx.getStorageSync("userInfo").userInfo.userCode;
      if (ymkdOrgnaizeCodeList.indexOf(organizeCode) != -1) {
        let param = {
          url: "/organize/getOrderNeedEvaluate?userCode=" + userCode,
        };
        requestModel.request(param, (data) => {
          if (data.status === true) {
            //不需要 先评价后点餐
            wx.showModal({
              title: "先评价后点餐",
              content: "必需先评价上一餐,才可继续点餐",
              confirmText: "去评价",
              success(res) {
                if (res.confirm) {
                  console.log("用户点击确定");
                  wx.navigateTo({
                    url:
                      "/pages/order/comment/comment?orderCode=" +
                      data.orderCode,
                  });
                } else if (res.cancel) {
                  console.log("用户点击取消");
                }
              },
            });
          } else if (data.status === false) {
            this.gotoMenu();
          } else {
            this.gotoMenu();
          }
        });
      } else {
        this.gotoMenu();
      }
    }
  },
  gotoMenu: function () {
    // 前端没有userCode信息，则先跳转到登录页
    if (!wx.getStorageSync("userCode")) {
      wx.navigateTo({
        url: "/pages/login/selectPhone/selectPhone",
      });
    } else {
      let _this = this;
      requestModel.getUserInfo((userInfo) => {
        _this.setData({
          userInfo: userInfo,
        });
        //判断是否为企业管理员，是否有点餐权限
        let a = userInfo.userType === "ORG_ADMIN" && userInfo.orgAdmin === true;

        if (
          a &&
          userInfo.userPermission &&
          userInfo.userPermission.adminMeal == true
        ) {
          //企业管理员类型，且以企业管理员身份登录

          _this.setData({
            orgAdminMealFlag: true,
          });
        } else if (
          a &&
          userInfo.userPermission &&
          userInfo.userPermission.adminMeal == false
        ) {
          //企业管理员类型，且以企业管理员身份登录
          _this.setData({
            orgAdminNoMealFlag: true,
          });
        } else {
          _this.navigateToMenu();
        }
      }, true);
    }
  },

  closeDialog() {
    this.setData({
      orgAdminNoMealFlag: false,
      orgAdminMealFlag: false,
    });
  },

  onLoad: function (options) {
    let _this = this;

    setTimeout(function () {
      // 2秒后强制展示首页
      _this.setData({
        preLoading_force: false,
      });
    }, 2000);

    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
    _this.initHome();
    _this.getNotice();
    _this.getCanpintuijianList();

    // 这个逻辑是  订单页 当没有订单时，引导用户跳转到首页的开始点餐
    if (options.fromorder) {
      _this.clickStartMeal();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 获取未评价的订单的未读信息
    this.getOrderEvaluateReplyNotRead();

    //已登录状态，直接登录
    requestModel.getUserInfo((userInfo) => {
      this.setData({
        userInfo: userInfo,
      });

      let { userStatus, canTakeDiscount } = userInfo;
      if (userStatus == "NO_CHECK") {
        //企业用户的'审核中'状态
        this.setData({
          showCheckFlag: true,
        });
        wx.hideTabBar();
      }

      if (userStatus == "NORMAL") {
        this.getTakeMealInfo();
        //获取待评价的订单信息
        this.getOrderList();
      }
      if (userInfo.userType == "VISITOR") {
        this.setData({
          showBindOrganizeFlag: true,
        });
      }
      /* 获取首页取餐信息 */
    }, true);
  },

  //没绑定企业的用户弹出去绑定弹窗
  gotoBindOrganize() {
    wx.navigateTo({
      url: "/pages/login/login?fromfrom=home",
    });
  },
  //关闭弹窗
  closeBindOrganize() {
    this.setData({
      showBindOrganizeFlag: false,
    });
  },
  /* 获取公告信息 */
  getNotice() {
    let _this = this;
    let url = "/home/getHomeNotice?userCode=" + wx.getStorageSync("userCode");
    let param = {
      url,
    };

    requestModel.request(param, (data) => {
      if (data && data.length > 0) {
        //后台是在没有公告的时候返回空数组
        let temp_noticeData = data;

        _this.setData({
          noticeData: temp_noticeData,
          hasNotice: true,
        });

        let window_noticeData = [];
        temp_noticeData.forEach((item) => {
          if (item.window) {
            window_noticeData.push(item);
          }
        });

        if (window_noticeData.length > 0) {
          _this.setData({
            showedNoticeData: window_noticeData,
            showOneNotice: true,
          });
        }
      }
    });
  },
  /* 获取待评价信息 也就是管理员回复用户后 用户小程序的个人中心标签出现红点*/
  getOrderEvaluateReplyNotRead() {
    let _this = this;
    let url =
      "/userEvaluate/getOrderReplyNotRead?userCode=" +
      wx.getStorageSync("userCode");
    let param = {
      url,
    };
    requestModel.request(param, (data) => {
      if (data.notReadNumber > 0) {
        wx.showTabBarRedDot({
          index: 2,
        });
      }
    });
  },
  // 点击轮播公告显示公告详细信息
  handleshowOneNotice(e) {
    this.setData({
      showedNoticeData: [e.currentTarget.dataset.onenotice],
      showOneNotice: true,
    });
  },
  // 轮播所有消息
  handleshowAllNotice() {
    this.setData({
      showedNoticeData: this.data.noticeData,
      showOneNotice: true,
    });
  },
  // 点击页面除（显示公告外）关闭window公告和详细公告
  closeNotice() {
    this.setData({
      showWindowNotice: false,
      showOneNotice: false,
    });
  },
  //显示window公告
  handleshowWindowNotice() {
    this.setData({
      showWindowNotice: true,
    });
  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },
  /* 获取订单评价列表 */
  getOrderList: function () {
    let _this = this;

    let param = {
      url:
        "/home/getHomeOrderEvaluate?userCode=" + wx.getStorageSync("userCode"),
    };
    requestModel.request(
      param,
      (data) => {
        _this.setData({
          orderList: data,
        });
      },
      true
    );
  },
  /* 去评价 */
  handleEvaluateOrder: function (e) {
    wx.removeStorageSync("commentOrder");
    wx.navigateTo({
      url:
        "/pages/order/comment/comment?orderCode=" +
        e.currentTarget.dataset.ordercode,
    });
  },
  /* 获取首页取餐信息 */
  getTakeMealInfo: function () {
    let _this = this;
    _this.data.takeFood = {};
    _this.setData({
      takeFood: _this.data.takeFood,
    });
    let param = {
      url: "/home/getHomeOrderPick?userCode=" + wx.getStorageSync("userCode"),
    };
    requestModel.request(
      param,
      (data) => {
        //先处理取餐信息, pickStatus==1表示待取
        let tmp_homeOrderList = [];
        data.forEach((item) => {
          if (item.pickStatus == 1 && item.status == 2) {
            if (item.orderFoodList) {
              let onefood = item.orderFoodList[0];

              let a = {};
              a.foodImage = onefood.foodImage; //图片
              a.mealTypeShow = _this.data.mealTypeMap[item.mealType]; //餐时
              a.foodName = onefood.foodName;
              a.orderCode = item.orderCode;
              a.pickAgain = item.pickAgain;
              a.cabinet = item.cabinet;
              if (onefood.takeMealStartTime && onefood.takeMealEndTime) {
                // 取餐时间
                let start = onefood.takeMealStartTime.split(" ")[1].split(":"); //时 分 秒

                let end = onefood.takeMealEndTime.split(" ")[1].split(":");

                //取餐时间顶多是到明天吗？不管了，就是明天
                let s =
                  "今天" +
                  start[0] +
                  "点" +
                  (start[1] != "00" ? start[1] + "分" : "");
                let endHours = end[0] == "00" ? 24 : end[0];
                let e =
                  endHours < start[0]
                    ? "明天" + endHours + "点"
                    : endHours + "点" + (end[1] != "00" ? end[1] + "分" : "");
                a.takeMealTimeDes = s + "到" + e;
              } else {
                let b = item.mealDate.split("-");
                a.takeMealTimeDes = b[1] + "月" + b[2] + "日";
              }

              tmp_homeOrderList.push(a);
            }
          }
        });
        _this.setData({
          homeOrderList: tmp_homeOrderList,
          swiperDefaultIndex: 0,
          // gethomeOrderList: true,
        });
      },
      true
    );
  },

  /* 去取餐 */
  handleTakeOrder: function (e) {
    //宁夏直接跳转电子凭证
    let organizeCode = wx.getStorageSync("userInfo").userInfo.organizeCode;
    let ningxiaOrgCode = getApp().globalData.ningxiaOrgnaizeCode;
    if (organizeCode === ningxiaOrgCode) {
      wx.navigateTo({
        url:
          "/pages/order/qrCode/qrCode?orderCode=" +
          e.currentTarget.dataset.ordercode,
      });
      return;
    }

    this.setData({
      showShapeFlag: false,
    });

    let _this = this;
    if (!_this.data.canClick) {
      return;
    }
    _this.data.canClick = false;

    let { ordercode, pickagain } = e.currentTarget.dataset;
    //就调用接口加载柜子号
    let param = {
      url:
        "/order/orderPickPre?userCode=" +
        wx.getStorageSync("userCode") +
        "&orderCode=" +
        ordercode,
    };
    requestModel.request(param, (data) => {
      if (data) {
        _this.setData({
          takeorderData: data,
          takeorderModalShow: true,
          takeorderModalShowInit: false,
          takeOrderCode: ordercode,
          takeOrderPickagain: pickagain,
        });

        wx.hideTabBar();
      }
    });

    if (_this.data.timer) {
      clearTimeout(_this.data.timer);
    }
    _this.data.timer = setTimeout(function () {
      _this.data.canClick = true;
    }, 2000);
  },
  closeModal() {
    if (this.data.takeorderModalShow) {
      this.setData({
        takeorderModalShow: false,
      });
      //取餐后为啥要只刷第一页的啊
    }
    wx.showTabBar();
  },

  //取餐 优化
  takeFoodOrderPlus(e) {
    let _this = this;

    let ordercode = _this.data.takeOrderCode;
    let pickagain = _this.data.takeOrderPickagain;
    let { cellNumber, cabinetNumber, cellId } = e.currentTarget.dataset.item;
    let param = {
      url:
        "/order/orderPick?userCode=" +
        wx.getStorageSync("userCode") +
        "&orderCode=" +
        ordercode +
        "&cabinetNumber=" +
        cabinetNumber +
        "&cellNumber=" +
        cellNumber +
        "&cellId=" +
        cellId +
        "&again=" +
        pickagain,
    };

    requestModel.request(param, () => {
      _this.setData({
        takeorderModalShow: false,
        takeOrderCode: null,
      });
      _this.getTakeMealInfo();
      _this.getOrderList();
      wx.showTabBar();
    });
  },

  /* 刷新用户状态信息 用于用户注册登录后，此时后台还没有审核该企业用户，当前小程序home页最上面显示button“刷新用户”*/
  handleRefreshUser: function () {
    let _this = this;
    requestModel.getUserInfo((userInfo) => {
      if (userInfo.userStatus == "NORMAL") {
        _this.setData({
          showCheckFlag: false,
        });
        wx.showToast({
          title: "登录成功",
          image: "/images/msg/success.png",
          duration: 2000,
        });

        wx.showTabBar();
        _this.initHome();
      } else if (userInfo.userStatus == "NO_CHECK") {
        wx.showToast({
          title: "企业审核中",
          image: "/images/msg/warning.png",
          duration: 3000,
        });
      } else {
        _this.setData({
          showCheckFlag: false,
        });
        wx.showToast({
          title: "审核未通过",
          image: "/images/msg/error.png",
          duration: 3000,
        });
      }
    }, true);
  },

  //用于解决小程序的遮罩层滚动穿透
  preventTouchMove: function () {},

  // 计算餐品推荐每个餐品的展示颜色背景
  getCanpintuijianColors(pages) {
    pages.map((page, pageIndex) => {
      page.map((item, index) => {
        if (index < 4) {
          item.color = "#FFF9EC";
        } else if (index >= 4 && index < 8) {
          item.color = "#F3F3FF";
        } else if (index >= 8) {
          item.color = "#FFE7E4";
        }
      });
    });
  },

  /* 获取餐品推荐 */
  getCanpintuijianList() {
    let _this = this;
    let url =
      "/promoteFoodType/promoteFoodTypeList?userCode=" +
      wx.getStorageSync("userCode");
    let param = {
      url,
    };

    requestModel.request(param, (data) => {
      if (data && data.amount > 0) {
        let pages = [];
        let tmp_list = data.list.slice();

        tmp_list.forEach((item, index) => {
          const pageNum = Math.floor(index / 12);
          if (!pages[pageNum]) {
            pages[pageNum] = [];
          }
          pages[pageNum].push(item);
        });
        _this.getCanpintuijianColors(pages);
        _this.setData({
          canpintuijianList: pages,
        });
        console.log("####### 3 #####fasd## ", pages);

        // 计算轮播图高度
        wx.getSystemInfo({
          success(res) {
            let swiperWidth = res.windowWidth - 20;
            let oneWidth = swiperWidth / 4;
            let oneHeight = oneWidth - 20 + 50 - 20;
            let tmp_lenght = tmp_list.length;
            let tmp_onBottomHeight = 0;
            let tmp_height = 0;
            if (tmp_lenght > 0 && tmp_lenght <= 4) {
              tmp_height = oneHeight + tmp_onBottomHeight;
            } else if (tmp_lenght > 4 && tmp_lenght <= 8) {
              tmp_height = (oneHeight + tmp_onBottomHeight) * 2;
            } else if (tmp_lenght > 8) {
              tmp_height = (oneHeight + tmp_onBottomHeight) * 3;
            }
            _this.setData({
              tuijianHeight: tmp_height,
              tuijianOneHeight: oneHeight,
            });
          },
        });
      }
    });
  },

  // 根据餐品类别进入点餐
  handleGotoMenuByCanpin: function (e) {
    let { tuijianitem } = e.currentTarget.dataset;

    //前端没有userCode信息，则先跳转到登录页
    wx.navigateTo({
      url: "/pages/menu/menu?typeId=" + tuijianitem.typeId,
    });
  },
});
