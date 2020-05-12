import { base } from "../../comm/public/request";
let requestModel = new base();
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

    cc: 1,
    cabNumList: [], //柜子列表，如果柜子列表为空，就不显示‘打开柜子页面’
    modalContent: {},
  },
  //跳转到登录页面
  gotoLogin() {
    let getWxUserInfo = wx.getStorageSync("getWxUserInfo");

    if (!getWxUserInfo) {
      wx.navigateTo({
        url: "/pages/login/authority/authority",
      });
      //无 userCode，则到登录页面
    } else {
      wx.navigateTo({
        url: "/pages/login/selectPhone/selectPhone",
      });
    }
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
  gotoAddfood() {
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
          url: "/pages/mine/addfood/addfood",
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
  /*     handleContact(e) {
            console.log(e.path)
            console.log(e.query)
        }, */
  /**
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
    let tmp_organizeCode = this.data.userInfo.organizeCode;
    let tmpArr = [
      "ORG613694937074106368",
      "ORG627182825342369792",
      "ORG530059864655790080",
    ]; //艾尔福 奥力拓 东宾电池 这三家企业的智能柜页面，使用旧的
    console.log(
      "99",
      this.data.userInfo.organizeCode,
      tmpArr.indexOf(tmp_organizeCode)
    );
    if (tmpArr.indexOf(tmp_organizeCode) == -1) {
      wx.navigateTo({
        url: "/pages/mine/cab/index",
      });
    } else {
      wx.navigateTo({
        url: "/pages/mine/cabold/index",
      });
    }
  },
  gotoAddfoodAdmin() {
    wx.navigateTo({
      url: "/pages/mine/orgAdminAddfood/orgAdminAddfood",
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
        _this.setData({
          userInfo: userInfo,
          userInfoReady: true,
        });
        const query = wx.createSelectorQuery();
        query.select(".info-wrapper").boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec(function (res) {
          _this.setData({
            infoTop: res[0].top,
          });
        });
      }, true);
    } else {
      const query = wx.createSelectorQuery();
      query.select(".info-wrapper").boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        _this.setData({
          infoTop: res[0].top,
        });
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

  //用于推荐有赏的接口
  gotoShare() {
    let extendUrl = "https://share.91dcan.cn/";
    wx.navigateTo({
      url: "/pages/home/link?extendUrl=" + extendUrl + "&title=推荐有赏",
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
