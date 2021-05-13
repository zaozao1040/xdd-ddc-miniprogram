import { base } from "../../../comm/public/request";
let requestModel = new base();
Page({
  data: {
    scrollTop: 0,
    buttonTop: 0,
    location: {},
    userName: "",

    organizeList: [],
    organize: "",
    organizeCode: "",
    search: "",
    organizeListNoResult: false,

    // 投柜地址
    deliveryAddressList: [],
    deliveryAddressCode: "",
    deliveryAddressName: "",

    // 决定下面列表显示哪个
    showOrganize: false,
    showDelivery: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    requestModel.getUserInfo((userInfo) => {
      let { userName, nickName, userType, userStatus, organizeName } = userInfo;
      _this.setData(
        {
          userName: userName || nickName,
          userType: userType,
          userStatus: userStatus,
        },
        () => {
          _this.initAddress();
        }
      );
    });
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
    let tmp_selectOrganizeInfo = wx.getStorageSync("selectOrganizeInfo");
    if (tmp_selectOrganizeInfo.organizeCode) {
      _this.setData({
        organizeCode: tmp_selectOrganizeInfo.organizeCode,
        organize: tmp_selectOrganizeInfo.organizeName,
      });
    }
    if (tmp_userInfo.deliveryAddressCode) {
      _this.setData({
        deliveryAddressCode: tmp_userInfo.deliveryAddressCode,
        deliveryAddressName: tmp_userInfo.deliveryAddress,
      });

      console.log(
        "####### 3 ####### ",
        _this.data.deliveryAddressName,
        _this.data.deliveryAddressCode
      );
    }
    this.getOrganizeDeliveryAddress(tmp_selectOrganizeInfo.organizeCode);
  },

  onShow: function () {},
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {},
  initAddress: function () {
    let _this = this;
    const query = wx.createSelectorQuery();
    query.select(".c_scrollPosition_forCalculate").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].top, // #the-id节点的上边界坐标
      });
    });
    const query_1 = wx.createSelectorQuery();
    query_1.select(".c_buttonPosition_forCalculate").boundingClientRect();
    query_1.selectViewport().scrollOffset();
    query_1.exec(function (res) {
      _this.setData({
        buttonTop: res[0].top, // #the-id节点的上边界坐标
      });
    });
    console.log("bindChecking", _this.data.bindChecking);
    console.log("canBinding", _this.data.canBinding);
  },
  clickOrganize: function () {
    this.setData({
      showOrganize: true,
      showDelivery: false,
    });
  },
  clickDelivery: function () {
    this.setData({
      showOrganize: false,
      showDelivery: true,
    });
  },
  selectOrganize: function (e) {
    this.setData({
      organize: e.currentTarget.dataset.organizename,
      organizeCode: e.currentTarget.dataset.organizecode,
      showOrganize: false,
    });

    wx.showToast({
      title: "选择成功",
      image: "/images/msg/success.png",
      duration: 2000,
    });
    this.getOrganizeDeliveryAddress(e.currentTarget.dataset.organizecode);
  },
  selectOrganizeAddress: function (e) {
    this.setData({
      deliveryAddressName: e.currentTarget.dataset.name,
      deliveryAddressCode: e.currentTarget.dataset.code,
      showDelivery: false,
    });
    wx.showToast({
      title: "选择成功",
      image: "/images/msg/success.png",
      duration: 2000,
    });
  },
  getOrganizeDeliveryAddress: function (organizeCode) {
    let _this = this;
    //请求地址列表，以便选择后提交
    requestModel.getUserCode((userCode) => {
      _this.data.userCode = userCode;
      let param = {
        url: "/organize/getAddressByOrganizeCode?organizeCode=" + organizeCode,
      };

      requestModel.request(param, (data) => {
        if (data.length == 1) {
          _this.setData({
            deliveryAddressList: data,
            deliveryAddressCode: data[0].deliveryAddressCode,
            deliveryAddressName: data[0].address,
            showDelivery: false,
          });
        } else if (data.length > 1) {
          _this.setData({
            deliveryAddressList: data,
            deliveryAddressCode: "",
            deliveryAddressName: "",
            showDelivery: true,
          });
        }
      });
    });
  },
  nameInput: function (e) {
    this.setData({
      userName: e.detail.value,
    });
  },

  organizeInput: function (e) {
    this.setData({
      organize: e.detail.value,
    });
  },
  searchInput: function (e) {
    let _this = this;
    _this.handleSearchOrganizes(e.detail.value);
  },
  handleSearchOrganizes(organizeName) {
    let _this = this;

    if (_this.data.userType == "ADMIN") {
      let urlp = encodeURI(
        "userCode=" + _this.data.userCode + "&organizeName=" + organizeName
      );
      let param = {
        url: "/organize/getOrganizeList?" + urlp,
      };
      //请求企业列表
      requestModel.request(param, (data) => {
        _this.setData({
          deliveryAddressCode: false,
          organizeList: data,
          organizeCode: "",
          showOrganize: true,
        });
        if (data.length == 0) {
          _this.setData({
            organizeListNoResult: true, //查到企业列表无结果，则相应视图
          });
        } else {
          _this.setData({
            organizeListNoResult: false,
          });
        }
      });
    } else if (organizeName.length >= 2) {
      let urlP = encodeURI(
        "userCode=" +
          _this.data.userCode +
          "&longitude=0&latitude=0&organizeName=" +
          organizeName
      );
      let param = {
        url: "/organize/organizeList?" + urlP,
      };

      //请求企业列表
      requestModel.request(param, (data) => {
        _this.setData({
          deliveryAddressCode: false,
          organizeList: data,
          organizeCode: "",
          showOrganize: true,
        });
        if (data.length == 0) {
          _this.setData({
            organizeListNoResult: true, //查到企业列表无结果，则相应视图
          });
        } else {
          _this.setData({
            organizeListNoResult: false,
          });
        }
        console.log(
          "$$$$$$$ 4 $$$$$$$ ",
          _this.data.showOrganize,
          _this.data.organizeList
        );
      });
    }
  },

  commit: function () {
    let _this = this;
    if (!_this.data.userName) {
      wx.showToast({
        title: "请输入姓名",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else if (!_this.data.organizeCode) {
      wx.showToast({
        title: "请选择企业",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else if (!_this.data.deliveryAddressCode) {
      wx.showToast({
        title: "请输入企业地址",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else {
      let param = {
        userCode: _this.data.userCode,
        deliveryAddressCode: _this.data.deliveryAddressCode,
        organizeCode: _this.data.organizeCode,
      };

      let params = {
        data: param,
        url: "/user/updateDeliveryAddress",
        method: "post",
      };

      requestModel.request(params, () => {
        // 刷新
        requestModel.getUserInfo(() => {}, true);
        wx.showToast({
          title: "地址选择成功",
          image: "/images/msg/success.png",
          duration: 2000,
        });
        wx.setStorageSync("selectOrganizeInfo", {
          organizeCode: _this.data.organizeCode,
          organizeName: _this.data.organize,
        });
        _this.data.timer = setTimeout(function () {
          wx.navigateTo({
            url: "/pages/mine/orgAdminSpare/orgAdminSpare?orgadmin=no",
          });
        }, 2000);
      });
    }
  },

  goback() {
    wx.switchTab({
      url: "/pages/mine/mine",
    });
  },
});
