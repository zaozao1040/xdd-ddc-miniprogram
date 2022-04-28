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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  clickYq: function () {
    wx.navigateTo({
      url: "/pages/home/tjyjyq/tjyjyq",
    });
  },
});
