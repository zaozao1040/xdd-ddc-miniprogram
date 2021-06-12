import { base } from "../../../../comm/public/request";
import config from "../../../../comm_plus/config/config.js";
import { request } from "../../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Component({
  /* 通信数据 */
  properties: {},
  /* 私有数据 */
  data: {
    tuijianList: [],
    labelList: [],
    activeLabelId: -1,
    foodInfo: {},
  },
  lifetimes: {
    ready: function () {
      let _this = this;
      _this.getLabelList();
    },
  },
  methods: {
    getLabelList: function () {
      let _this = this;
      let param = {
        url: "/v3/getFoodLabelTypeList?typeId=2",
      };
      requestModel.request(param, (resData) => {
        if (resData && resData.length > 0) {
          _this.setData(
            {
              labelList: resData,
              activeLabelId: resData[0].id,
            },
            () => {
              _this.getfoodList(resData[0].id);
            }
          );
        }
      });
    },

    getfoodList: function (labelId) {
      let _this = this;
      let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;
      let param = {
        url:
          "/v3/getLabelFoodList?userCode=" +
          tmp_userInfo.userCode +
          "&labelId=" +
          labelId,
      };
      requestModel.request(param, (resData) => {
        _this.setData({
          tuijianList: resData,
        });
      });
    },
    clickLabel: function (e) {
      let _this = this;
      let item = e.currentTarget.dataset.item;
      _this.getfoodList(item.id);
      _this.setData({
        activeLabelId: item.id,
      });
    },

    gotoFoodDetail: function (e) {
      let foodCode = e.currentTarget.dataset.item.foodCode;
      wx.navigateTo({
        url: "/pages/menu/foodDetail/foodDetail?foodCode=" + foodCode,
      });
    },
    //加入购物车
    handleAddtoCart(e) {
      let tmpData = {
        foodCode: e.currentTarget.dataset.item.foodCode,
      };
      this.setData({
        foodInfo: e.currentTarget.dataset.item,
      });
      this.selectComponent("#mealDateType").show(tmpData);
    },
  },
});
