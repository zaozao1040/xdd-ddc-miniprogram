import { base } from "../../../comm/public/request";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    lStepClass: {
      color: "#f79c4c",
    },
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  onShow() {
    this.getList();
  },
  getList: function () {
    let _this = this;
    let param = {
      url:
        "/recommendReward/invitationRecord?userCode=" +
        wx.getStorageSync("userInfo").userInfo.userCode,
    };
    requestModel.request(param, (resData) => {
      if (resData && resData.length > 0) {
        _this.setData({
          list: resData || [],
        });
      }
    });
  },
  clickYq: function () {
    wx.navigateTo({
      url: "/pages/home/tjyjyq/tjyjyq",
    });
  },
});
