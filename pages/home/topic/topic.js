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
    topicList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    _this.getTopicList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  getTopicList: function () {
    let _this = this;
    let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
    let param = {
      url:
        "/themeRecommend/getOrganizeThemeRecordList?userCode=" +
        tmp_userInfo.userCode,
    };
    requestModel.request(param, (resData) => {
      _this.setData({
        topicList: resData,
      });
    });
  },
  navigateToTopicDetail: function (e) {
    let item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: "/pages/home/topic/topicDetail/topicDetail?id=" + item.id,
    });
  },
});
