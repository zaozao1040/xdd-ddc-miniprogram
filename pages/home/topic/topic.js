import { base } from "../../../comm/public/request";
import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
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
    topicList: [], //可用的优惠券列表
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
  },
});
