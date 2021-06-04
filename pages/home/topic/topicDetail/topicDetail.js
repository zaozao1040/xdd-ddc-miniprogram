import { base } from "../../../../comm/public/request";
import config from "../../../../comm_plus/config/config.js";
import { request } from "../../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    topicDetailInfo: {},
    foodList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTopicDetailInfo(options.id);
  },
  getTopicDetailInfo: function (id) {
    let _this = this;
    let param = {
      url: "/themeRecommend/getThemeRecommendById?id=" + id,
    };
    requestModel.request(param, (resData) => {
      _this.setData({
        topicDetailInfo: resData,
      });

      _this.getTopicDetailFoodList(id);
    });
  },
  getTopicDetailFoodList: function (id) {
    let _this = this;
    let param = {
      url:
        "/themeRecommend/getRecommendGoods?id=" +
        id +
        "&userCode=" +
        wx.getStorageSync("userInfo").userInfo.userCode,
    };
    requestModel.request(param, (resData) => {
      if (resData) {
        _this.setData({
          foodList: resData,
        });
      }
    });
  },
});
