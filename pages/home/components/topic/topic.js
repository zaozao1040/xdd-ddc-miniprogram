import { base } from "../../../../comm/public/request";
import config from "../../../../comm_plus/config/config.js";
import { request } from "../../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Component({
  /* 通信数据 */
  properties: {
    discountList: Array,
    useType: {
      type: String,
      value: 0,
    },
    selectedDiscountInfo: {
      type: Object,
      value: {},
    },
  },
  /* 私有数据 */
  data: {
    topicList: [],
    topicListPlus: [],
    curTopicInfo: {},
  },
  lifetimes: {
    ready: function () {
      let _this = this;
      _this.getTopicList();
    },
  },
  methods: {
    getTopicList: function () {
      let _this = this;
      let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
      if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
        let tmp_userInfo = tmp_tmp_userInfo.userInfo;
        let param = {
          url:
            "/themeRecommend/getOrganizeThemeRecordList?userCode=" +
            tmp_userInfo.userCode,
        };
        requestModel.request(param, (resData) => {
          let tmp_list = [];
          for (var i = 0; i < resData.length; i += 2) {
            tmp_list.push(resData.slice(i, i + 2));
          }
          _this.setData({
            topicList: resData,
            topicListPlus: tmp_list,
          });
        });
      }
    },
    getTopicFoodList: function () {
      let _this = this;
      let param = {
        url:
          "/themeRecommend/getRecommendGoods?id=" + _this.data.curTopicInfo.id,
      };
      requestModel.request(param, (resData) => {
        _this.setData({
          curTopicInfo: resData,
        });
      });
    },
    navigateToTopic: function () {
      wx.navigateTo({
        url: "/pages/home/topic/topic",
      });
    },
    navigateToTopicDetail: function (e) {
      let item = e.currentTarget.dataset.item;
      wx.navigateTo({
        url: "/pages/home/topic/topicDetail/topicDetail?id=" + item.id,
      });
    },
  },
});
