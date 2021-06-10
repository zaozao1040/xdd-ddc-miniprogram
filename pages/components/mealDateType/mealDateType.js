import { base } from "../../../comm/public/request";
import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Component({
  /* 通信数据 */
  properties: {
    foodInfo: {
      type: Object,
      value: {},
    },
  },
  /* 私有数据 */
  data: {
    //
    mealDateAndTypeList: [],
    rightList: [],
    show: false,
    activeLeftItem: {},
    activeRightItem: {},
  },
  /* 生命周期 */
  pageLifetimes: {
    show() {},
  },
  methods: {
    // closeModal: function (e) {
    //   this.triggerEvent("closemodal");
    // },
    // handleConfirm: function (e) {
    //   this.triggerEvent("handleconfirm", e.currentTarget.dataset.modalparam);
    // },
    show(data) {
      let foodCode = data.foodCode;
      this.getMealDateAndType(foodCode);
    },
    // 获取指定餐品的排餐日期和餐别
    getMealDateAndType(foodCode) {
      let _this = this;
      let param = {
        url:
          config.baseUrlPlus +
          "/themeRecommend/getCanAddCartMealDateAndMealType?userCode=" +
          wx.getStorageSync("userCode") +
          "&foodCode=" +
          foodCode,
        method: "get",
      };
      request(param, (resData) => {
        if (resData.data.code === 200) {
          if (resData.data.data && resData.data.data.length > 0) {
            let tmp_mealTypeList = resData.data.data[0].mealTypeList;
            _this.setData({
              mealDateAndTypeList: resData.data.data,
              rightList: tmp_mealTypeList,
              show: true,
              activeLeftItem: resData.data.data[0],
              activeRightItem: tmp_mealTypeList[0],
            });
          } else {
            wx.showToast({
              title: "未排餐",
              image: "/images/msg/error.png",
              duration: 2000,
            });
          }
        } else {
          wx.showToast({
            title: resData.data.msg,
            image: "/images/msg/error.png",
            duration: 2000,
          });
        }
      });
    },
    clickLeftItem: function (e) {
      let { item } = e.currentTarget.dataset;
      console.log("@@@@@@@ 2 @@@@@@@ ", item);
      this.setData({
        activeLeftItem: item,
      });
    },
    clickRightItem: function (e) {
      let { item } = e.currentTarget.dataset;
      console.log("@@@@@@@ 2 @@@@@@@ ", item);
      this.setData({
        activeRightItem: item,
      });
    },
    closeMask() {
      this.setData({
        show: false,
      });
    },
    handleDonothing() {},
    clickConfirm() {
      this.addOneFood();
    },
    addOneFood() {
      let _this = this;
      let param = {
        url: config.baseUrlPlus + "/v3/cart/addCart",
        method: "post",
        data: {
          userCode: wx.getStorageSync("userInfo").userInfo.userCode,
          foodCode: _this.data.foodInfo.foodCode,
          foodName: _this.data.foodInfo.foodName,
          foodPrice: _this.data.foodInfo.foodPrice,
          foodQuantity: 1,
          mealDate: _this.data.activeLeftItem.mealDate,
          mealType: _this.data.activeRightItem.value,
          image: _this.data.foodInfo.image,
        },
      };
      wx.showLoading();
      request(param, (resData) => {
        if (resData.data.code === 200) {
          wx.showToast({
            title: "添加成功",
            duration: 2000,
          });
          wx.hideLoading();
          _this.setData({
            show: false,
          });
        } else {
          wx.showToast({
            title: resData.data.msg,
            image: "/images/msg/error.png",
            duration: 2000,
          });
        }
      });
    },
  },
});
