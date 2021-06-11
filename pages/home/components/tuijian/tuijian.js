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
        url: "/v3/getFoodLabelTypeList",
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
    // 点击购物车icon，将餐品加1
    clickCart(e) {
      let _this = this;
      let { item } = e.currentTarget.dataset;
      let tmp_item = {
        ...item,
        mealDate: _this.data.activeMealDate,
        mealType: _this.data.activeMealType,
      };

      _this.addOneFood(tmp_item);
    },
    addOneFood(item) {
      let _this = this;
      let param = {
        url: config.baseUrlPlus + "/v3/cart/addCart",
        method: "post",
        data: {
          userCode: wx.getStorageSync("userInfo").userInfo.userCode,
          foodCode: item.foodCode,
          foodName: item.foodName,
          foodPrice: item.foodPrice,
          foodQuantity: 1,
          mealDate: item.mealDate,
          mealType: item.mealType,
          image: item.image,
        },
      };
      request(param, (resData) => {
        if (resData.data.code === 200) {
          wx.showToast({
            title: "添加成功",
            duration: 2000,
          });
          _this.getPayInfo();

          _this.getCartList();
        } else {
          wx.showToast({
            title: resData.data.msg,
            image: "/images/msg/error.png",
            duration: 2000,
          });
        }
      });
    },
    navigateToTopic: function (e) {
      wx.navigateTo({
        url:
          "/pages/menu/foodDetail/foodDetail?foodCode=" +
          e.currentTarget.dataset.foodcode,
      });
    },
  },
});
