import { base } from "../../comm/public/request";
let requestModel = new base();
Page({
  data: {
    userName: null,
    userCode: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let _this = this;
    requestModel.getUserInfo((userInfo) => {
      _this.setData({
        userName: userInfo.userName,
        userCode: userInfo.userCode,
      });
    });
  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {},

  gotoNext: function () {
    if (this.data.userName) {
      wx.navigateTo({
        url: "/pages/login/next?userName=" + this.data.userName,
      });
    } else {
      wx.showToast({
        title: "真实姓名必填",
        icon: "none",
        duration: 2000,
      });
    }
  },

  nameInput: function (e) {
    this.setData({
      userName: e.detail.value,
    });
  },
});
