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
    popContent: {},
    modalContent: {},
    modalIndex: 0, //1:删除一条，2：删除全部，3：删除未完成的
    /**
     *
     */
    showDialogAdd: false,
    preOrderList: [],
    mark: null,
    quantity: 1,
    currentMealDate: null,
    currentMealType: null,
    currentFoodCode: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
    _this.getScrollHeight();
    _this.getPreOrderInfo();
  },
  getPreOrderInfo: function () {
    let _this = this;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/previewOrder",
      method: "post",
      data: {
        ..._this.data.reqData,
        userCode: wx.getStorageSync("userInfo").userInfo.userCode,
      },
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        _this.setData({
          preOrderList: resData.data.data.cartResDtoList,
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
          preOrderList: resData,
        });
      },
      true
    );
  },
  getScrollHeight() {
    let _this = this;
    const query_1 = wx.createSelectorQuery();
    query_1.select("#c_warpper_calculation").boundingClientRect();
    query_1.selectViewport().scrollOffset();
    query_1.exec(function (res) {
      _this.setData({
        scrollHeight: res[0].height, // #the-id节点的上边界坐标
      });
    });
  },

  closeDialogAdd() {
    this.setData({
      showDialogAdd: false,
    });
  },
  donothing() {
    console.log("阻止事件冒泡");
  },
  clickAdd(e) {
    let _this = this;

    //添加备注
    let { mealdate, mealtype, fooditem } = e.currentTarget.dataset;
    _this.setData({
      showDialogAdd: true,
      currentMealDate: mealdate,
      currentMealType: mealtype,
      currentFoodCode: fooditem.foodCode,
    });
  },
  clickDel(e) {
    let _this = this;

    //添加备注
    let { mealdate, mealtype, fooditem, markitem } = e.currentTarget.dataset;
    _this.setData({
      currentMealDate: mealdate,
      currentMealType: mealtype,
      currentFoodCode: fooditem.foodCode,
      currentMarkDetail: {
        mark: markitem.mark,
        quantity: markitem.quantity,
      },
    });
    wx.showModal({
      title: "确定删除?",
      content: "",
      success(res) {
        if (res.confirm) {
          console.log("用户点击确定");
          _this.confirmDel();
        } else if (res.cancel) {
          console.log("用户点击取消");
        }
      },
    });
  },
  inputRemarkName(e) {
    this.setData({
      mark: e.detail.value,
    });
  },
  inputRemarkCount(e) {
    this.setData({
      quantity: e.detail.value,
    });
  },

  add() {
    this.setData({
      quantity: this.data.quantity + 1,
    });
  },
  minus() {
    if (this.data.quantity == 1) {
      wx.showToast({
        title: "至少1份",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else {
      this.setData({
        quantity: this.data.quantity - 1,
      });
    }
  },

  confirmAdd() {
    let _this = this;
    if (!_this.data.quantity) {
      wx.showToast({
        title: "数量必填",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    } else if (_this.data.quantity < 1) {
      wx.showToast({
        title: "数量至少1份",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    } else if (!_this.data.mark) {
      wx.showToast({
        title: "内容必填",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    }
    let param = {
      url: config.baseUrlPlus + "/v3/cart/addFoodMarkDetail",
      method: "post",
      data: {
        userCode: wx.getStorageSync("userInfo").userInfo.userCode,
        foodCode: _this.data.currentFoodCode,
        mealDate: _this.data.currentMealDate,
        mealType: _this.data.currentMealType,
        markDetail: {
          mark: _this.data.mark,
          quantity: _this.data.quantity,
        },
      },
    };
    wx.showLoading();
    request(param, (resData) => {
      if (resData.data.code === 200) {
        wx.showToast({
          title: "添加成功",
          duration: 2000,
        });
        _this.closeDialogAdd();
        _this.getPreOrderInfo();
      } else if (resData.data.code == 401) {
        wx.showToast({
          title: "超出数量",
          image: "/images/msg/error.png",
          duration: 2000,
        });
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
      wx.hideLoading();
    });
  },
  confirmDel() {
    let _this = this;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/deleteFoodMarkDetail",
      method: "post",
      data: {
        userCode: wx.getStorageSync("userInfo").userInfo.userCode,
        foodCode: _this.data.currentFoodCode,
        mealDate: _this.data.currentMealDate,
        mealType: _this.data.currentMealType,
        markDetail: _this.data.currentMarkDetail,
      },
    };
    wx.showLoading();
    request(param, (resData) => {
      if (resData.data.code === 200) {
        wx.showToast({
          title: "删除成功",
          duration: 2000,
        });
        _this.closeDialogAdd();
        _this.getPreOrderInfo();
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
      wx.hideLoading();
    });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
