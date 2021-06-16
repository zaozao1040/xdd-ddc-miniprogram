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
    foodLabelTypeListData:[]
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
      let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
      if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
        let tmp_userInfo = tmp_tmp_userInfo.userInfo;
        let param = {
          url: "/v3/getFoodLabelTypeList?typeId=2&userCode=" +
          tmp_userInfo.userCode,
        };
        requestModel.request(param, (resData) => {
          if (resData && resData.length > 0) {
            _this.setData(
              {
                labelList: resData,
                activeLabelId: resData[0].id,
                tuijianList: resData[0].foodLabelTypeList,
                foodLabelTypeListData:resData
              }
            );
          }
        });
      }

    },


    clickLabel: function (e) {
      let _this = this;
      let {item,index} = e.currentTarget.dataset;
      _this.setData({
        activeLabelId: item.id,
        tuijianList: _this.data.foodLabelTypeListData[index].foodLabelTypeList,
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
