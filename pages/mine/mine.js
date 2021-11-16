import { base } from "../../comm/public/request";
let requestModel = new base();

//调用飞毯的接口
import config_plus from "../../comm_plus/config/config.js";
import { request as request_plus } from "../../comm_plus/public/request.js";

Page({
  data: {
    //
    windowHeight: 0,
    infoTop: 0,
    //用户信息
    canIUse: wx.canIUse("button.open-type.getUserInfo"),
    userInfo: null,

    labelList: ["换绑手机", "地址管理", "绑定企业", "服务电话"],
    labelList_no: ["换绑手机", "地址管理", "绑定企业"],
    imageList: ["me_swap", "me_address", "me_enterprise", "me_service"],
    navigatorUrl: [
      "/pages/mine/phone/phone",
      "/pages/mine/address/address",
      "/pages/mine/organize/organize",
    ],
    //客服电话
    servicePhone: null,

    //开柜取餐
    showTakeFoodLabelFlag: false,
    showPhoneModal: false,
    cabNumber: null,
    cellInfo: {},
    cellInfoDes: null,

    cc: 1,
    cabNumList: [], //柜子列表，如果柜子列表为空，就不显示‘打开柜子页面’
    modalContent: {},

    // 订单未评价个数
    notReadNumber: 0,

    // 备用餐信息
    orgadmin: "no",
    getSpareMealSetParams: {},
    spareInfo: {},
  },
  /* 获取待评价信息 */
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
      } else {
        wx.hideTabBarRedDot({
          index: 2,
        });
      }
      _this.setData({
        notReadNumber: data.notReadNumber,
      });
    });
  },
  //跳转到登录页面
  gotoLogin() {
    wx.navigateTo({
      url: "/pages/login/selectPhone/selectPhone",
    });
  },
  gotoComment() {
    wx.navigateTo({
      url: "/pages/mine/allComment/allComment",
    });
  },
  //跳转到详细资料页面
  gotoDetailInfo() {
    wx.navigateTo({
      url: "/pages/mine/information/information",
    });
  },
  //加餐
  gotoBucan() {
    let _this = this;
    requestModel.getUserInfo((userInfo) => {
      _this.setData({
        userInfo: userInfo,
      });
      let { userType, orgAdmin } = userInfo;
      if ((userType == "ORG_ADMIN" || userType == "ADMIN") && orgAdmin) {
        _this.setData({
          showPop: true,
        });
      } else {
        wx.navigateTo({
          url: "/pages/menu/bucan",
        });
      }
    }, true);
  },
  closePop() {
    this.setData({
      showPop: false,
    });
  },

  /* 跳转 */
  handleClickLabel: function (e) {
    let clickIndex = e.currentTarget.dataset.labelindex;
    let _this = this;

    if (clickIndex == 2) {
      //绑定企业
      wx.navigateTo({
        url: _this.data.navigatorUrl[clickIndex],
      });
    } else if (clickIndex == 3) {
      //客户服务
      //请求客服电话

      wx.showLoading({
        //【防止狂点2】
        title: "获取电话中",
        mask: true,
      });
      let param = {
        url: "/help/getHelp",
      };
      requestModel.request(param, (data) => {
        _this.setData({
          showPhoneModal: true,
          servicePhone: data.contactPhone,
        });

        console.log("showPhoneModal", _this.data.showPhoneModal);
      });
    } else {
      wx.navigateTo({
        url: _this.data.navigatorUrl[clickIndex],
      });
    }
  },
  handleGotoTakeFood: function () {
    let _this = this;
    //开柜取餐
    _this.setData({
      showTakeFoodModal: true,
    });
    let params = {
      url: config_plus.baseUrl + "/ningxia/getUserInfoCabinet",
      method: "GET",
      data: {
        organizeCode: _this.data.userInfo.organizeCode,
        userCode: wx.getStorageSync("userCode"),
      },
    };
    request_plus(params, (result) => {
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        let tmp_cellInfoDes =
          result.data.data.cabinetSort + " - " + result.data.data.cellShowSort;
        _this.setData({
          cellInfo: result.data.data,
          cellInfoDes: tmp_cellInfoDes,
        });
      }
    });
  },
  closePhoneModal() {
    this.setData({
      showPhoneModal: false,
    });
  },

  handleContact() {
    let _this = this;
    wx.makePhoneCall({
      phoneNumber: _this.data.servicePhone,
    });

    _this.setData({
      showPhoneModal: false,
    });
  },
  //开柜取餐
  closeTakeFoodModal() {
    this.setData({
      showTakeFoodModal: false,
    });
  },
  handleTakeFoodContact() {
    let _this = this;
    let params = {
      url: config_plus.baseUrl + "/client/cell/openCell",
      method: "POST",
      data: {
        cabinetCode: _this.data.cellInfo.cabinetCode,
        cellSort: _this.data.cellInfo.cellSort,
        userCode: wx.getStorageSync("userCode"),
      },
    };
    request_plus(params, (result) => {
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        wx.showToast({
          title: "打开成功",
          duration: 1000,
          icon: "success",
        });
      }
    });

    _this.setData({
      showTakeFoodModal: false,
    });
  },
  /*
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log("windowHeight", res.windowHeight);
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
  },
  // 如果是企业用户就切换为管理员，如果是管理员就切换为普通用户
  changeRole() {
    let _this = this;
    let ct = "";
    if (_this.data.userInfo.userType == "ORG_ADMIN") {
      ct = "企业管理员";
    } else if (_this.data.userInfo.userType == "ADMIN") {
      ct = "超级管理员";
    }

    let tmp_modalContent = {};
    tmp_modalContent.content = _this.data.userInfo.orgAdmin
      ? "您确定要从" + ct + "切换为普通用户吗?"
      : "您确定要从普通用户切换为" + ct + "吗?";
    tmp_modalContent.show = true;

    _this.setData({
      modalContent: tmp_modalContent,
    });
  },
  changeRoleModal() {
    let _this = this;
    let param = {
      url: "/user/orgAdminChange",
      method: "post",
      data: {
        userCode: _this.data.userCode,
      },
    };

    requestModel.request(param, () => {
      requestModel.getUserInfo((userInfo) => {
        _this.setData({
          userInfo: userInfo,
        });
      }, true);
      wx.showToast({
        title: "切换成功",
        icon: "none",
        duration: 2000,
      });
      _this.data.modalContent.show = false;
      _this.setData({
        modalContent: _this.data.modalContent,
      });
    });
  },
  closeModal() {
    let _this = this;
    _this.data.modalContent.show = false;
    _this.setData({
      modalContent: _this.data.modalContent,
    });
  },
  // 柜子页面
  gotoCabinetminiProgram() {
    if (
      this.data.userInfo.organizeCode == getApp().globalData.ningxiaOrgnaizeCode
    ) {
      wx.navigateTo({
        url: "/pages/mine/cabningxia/cabningxia",
      });
    } else {
      wx.navigateTo({
        url: "/pages/mine/cab/index",
      });
    }
  },

  // 点击备用餐
  clickByc(e) {
    let _this = this;
    let { orgadmin } = e.currentTarget.dataset;
    _this.setData(
      {
        orgadmin: orgadmin,
      },
      () => {
        _this.getOrganizeDeliveryAddress();
      }
    );
  },
  //获取备用餐设置
  getSpareMealSet(obj) {
    let _this = this;
    let params = {
      data: obj,
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
          // this.data.spareInfo有值 则代表请求到了结果
          if (this.data.spareInfo && this.data.spareInfo.timeStatus == false) {
            wx.showModal({
              title: "提示",
              content: "当前时间不允许",
              confirmText: "我知道了",
              showCancel: false,
              success: function (res) {},
            });
          } else if (this.data.spareInfo && this.data.spareInfo.spareNum == 0) {
            let mealTypeDes = "";
            if (this.data.spareInfo.mealType == "BREAKFAST") {
              mealTypeDes = "早餐";
            } else if (this.data.spareInfo.mealType == "LUNCH") {
              mealTypeDes = "午餐";
            } else if (this.data.spareInfo.mealType == "DINNER") {
              mealTypeDes = "晚餐";
            } else if (this.data.spareInfo.mealType == "NIGHT") {
              mealTypeDes = "夜宵";
            }
            wx.showModal({
              title: this.data.spareInfo.mealDate + "(" + mealTypeDes + ")",
              content: "暂无备用餐",
              confirmText: "我知道了",
              showCancel: false,
              success: function (res) {},
            });
          } else {
            let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
            // 如果是NGO 代表外来人员身份想要申请备用餐 每次都强制跳转到需要填写企业和企业地址
            if (
              tmp_userInfo.organizeCode == "ORGVISTORE530053156613128193" ||
              !tmp_userInfo.deliveryAddressCode
            ) {
              wx.navigateTo({
                url: "/pages/mine/orgAndaddress/orgAndaddress?frontPageFlag=spare",
              });
            } else {
              wx.navigateTo({
                url:
                  "/pages/mine/orgAdminSpare/orgAdminSpare?orgadmin=" +
                  _this.data.orgadmin,
              });
            }
          }
        }
      );
    });
  },

  // 获取企业地址列表
  getOrganizeDeliveryAddress() {
    let _this = this;
    let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
    if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
      let params = {
        data: {
          userCode: tmp_tmp_userInfo.userInfo.userCode,
        },
        url: "/organize/getOrganizeDeliveryAddress",
        method: "get",
      };
      requestModel.request(params, (res) => {
        let tmp_getSpareMealSetParams = {
          userCode: tmp_tmp_userInfo.userInfo.userCode,
          organizeCode: tmp_tmp_userInfo.userInfo.organizeCode,
          deliveryAddressCode: res[0].deliveryAddressCode,
        };
        if (Array.isArray(res) && res.length == 1) {
          _this.getSpareMealSet(tmp_getSpareMealSetParams);
        } else if (Array.isArray(res) && res.length > 1) {
          _this.setData(
            {
              getSpareMealSetParams: tmp_getSpareMealSetParams,
            },
            () => {
              res.map((item) => {
                item.name = item.address;
              });
              wx.lin.showActionSheet({
                itemList: res,
              });
            }
          );
        }
      });
    }
  },
  gotoAddfoodAdmin() {
    wx.lin.showActionSheet({
      itemList: [
        {
          name: "普通餐",
        },
        {
          name: "商务餐",
        },
      ],
    });
  },
  lintapItem(e) {
    let _this = this;
    let { index, item } = e.detail;
    if (item.address) {
      // 备用餐弹窗
      _this.getSpareMealSet({
        ..._this.data.getSpareMealSetParams,
        deliveryAddressCode: item.deliveryAddressCode,
      });
    } else {
      // 报餐弹窗
      if (index == 0) {
        wx.navigateTo({
          url: "/pages/mine/orgAdminAddfood/orgAdminAddfood",
        });
      } else if (index == 1) {
        // wx.navigateTo({
        //   url: "/pages/mine/orgAdminSwcfood/orgAdminSwcfood",
        // });
        wx.showToast({
          title: "即将上线..",
          icon: "none",
          duration: 2000,
        });
      }
    }
  },
  gotoAddfoodAdmin() {
    wx.lin.showActionSheet({
      itemList: [
        {
          name: "普通餐",
        },
        {
          name: "商务餐",
        },
      ],
    });
  },
  // 我要吐槽
  gotoSaySomething() {
    wx.navigateTo({
      url: "/pages/mine/complaint/complaint",
    });
  },
  // 我要对服务进行评分
  gotoEvaluateService() {
    wx.navigateTo({
      url: "/pages/mine/evaluateService/evaluateService",
    });
  },
  //跳转到余额
  gotoWallet() {
    wx.navigateTo({
      url: "/pages/mine/wallet/wallet?allBalance=" + this.data.allBalance,
    });
  },
  gotoDiscount() {
    wx.navigateTo({
      url: "/pages/mine/discount/discount",
    });
  },
  gotoIntegral() {
    wx.navigateTo({
      url: "/pages/mine/integral/integral?integral=" + this.data.integral,
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
    let userCode = wx.getStorageSync("userCode");
    _this.setData({
      userCode: userCode,
    });
    if (userCode) {
      requestModel.getUserInfo((userInfo) => {
        if (userInfo.organizeCode == getApp().globalData.ningxiaOrgnaizeCode) {
          //【宁夏】临时方案
          _this.setData({
            showTakeFoodLabelFlag: true,
          });
        }
        _this.setData({
          userInfo: userInfo,
          userInfoReady: true,
        });
        const query = wx.createSelectorQuery();
        query.select(".info-wrapper").boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec(function (res) {
          if (res instanceof Array && res.length > 0) {
            _this.setData({
              infoTop: res[0].top,
            });
          }
        });
      }, true);
    } else {
      const query = wx.createSelectorQuery();
      query.select(".info-wrapper").boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        if (res instanceof Array && res.length > 0) {
          _this.setData({
            infoTop: res[0].top,
          });
        }
      });
    }

    if (userCode) {
      let param = {
        url: "/user/getUserFinance?userCode=" + userCode,
      };
      requestModel.request(
        param,
        (data) => {
          _this.setData({
            allBalance: data.allBalance,
            integral: data.integral,
            discount: data.discount,
            financeReady: true,
          });
        },
        true
      );

      //重新加载内容信息
      requestModel.getUserInfo((userInfo) => {
        console.log("userInfo", userInfo);
        _this.setData({
          userInfo: userInfo,
        });
      }, true);
    }
    _this.getOrderEvaluateReplyNotRead();
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
  onPullDownRefresh: function () {
    let _this = this;
    //初始化，获取一些必要参数，如高度
    if (!_this.data.userCode) {
      wx.hideNavigationBarLoading();
      wx.stopPullDownRefresh();
      return;
    }
    wx.showNavigationBarLoading();
    //刷新积分、余额、优惠券
    let param = {
      url: "/user/getUserFinance?userCode=" + _this.data.userCode,
    };
    requestModel.request(param, (data) => {
      _this.setData({
        allBalance: data.allBalance,
        integral: data.integral,
        discount: data.discount,
      });

      requestModel.getUserInfo((userInfo) => {
        _this.setData({
          userInfo: userInfo,
        });
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }, true);
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
