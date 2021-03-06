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
    bgImg: "",
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
          foodList: resData.recommendGoodDTOList,
          bgImg: resData.detailImage,
        });
      }
    });
  },
  clickImg: function (e) {
    let item = e.currentTarget.dataset.item;
    let tmp_page = item.page;
    wx.navigateTo({
      url: tmp_page,
      fail: function (err) {
        wx.showToast({
          title: "餐品失效",
          image: "/images/msg/error.png",
          duration: 2000,
        });
      },
    });
  },
});
