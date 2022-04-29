// pages/home/tjyj/tjyj.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    lStepClass: {
      color: "#f79c4c",
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  onShow() {},

  clickYq: function () {
    wx.navigateTo({
      url: "/pages/home/tjyjyq/tjyjyq",
    });
  },
});
