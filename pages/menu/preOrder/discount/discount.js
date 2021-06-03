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
    discountList: [], //可用的优惠券列表
    combineDiscountInfo: {}, //confirm页面中，点击某个餐别，该餐别已经选中的优惠券信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    _this.setData({
      combineDiscountInfo: getApp().globalData.publicParam.combineDiscountInfo,
    });

    _this.getDiscountList();
  },

  /* 获取优惠券列表 */
  getDiscountList() {
    let _this = this;
    let param = {
      data: getApp().globalData.publicParam,
      url: "/userDiscount/discountOrderDetail",
      method: "post",
    };
    requestModel.request(param, (data) => {
      _this.setData({
        discountList: data,
      });
    });
  },

  /* 监听子组件：选择一张优惠券触发事件 */
  onChangeSelectDiscount: function (e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_onChangeSelectDiscount",
      time: 1000,
      success: () => {
        let tmp_publicParam = getApp().globalData.publicParam;
        let param = {
          url: config.baseUrlPlus + "/v3/cart/combineDiscount",
          method: "post",
          data: {
            userCode: wx.getStorageSync("userInfo").userInfo.userCode,
            mealType: tmp_publicParam.mealType,
            mealDate: tmp_publicParam.mealDate,
            userDiscountCode: e.detail.userDiscountCode,
            discountMoney: e.detail.discountMoney,
          },
        };
        request(param, (resData) => {
          if (resData.data.code === 200) {
            let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
            let prevPage = pages[pages.length - 2];
            prevPage.getPreOrderInfo();
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
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
    });
  },
  /* 监听子组件：选择不使用优惠券触发事件 */
  onRemoveSelectDiscount: function () {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_onRemoveSelectDiscount",
      time: 1000,
      success: () => {
        let tmp_publicParam = getApp().globalData.publicParam;
        let param = {
          url: config.baseUrlPlus + "/v3/cart/combineDiscount",
          method: "post",
          data: {
            userCode: wx.getStorageSync("userInfo").userInfo.userCode,
            mealType: tmp_publicParam.mealType,
            mealDate: tmp_publicParam.mealDate,
            discountCode: null,
            discountMoney: null,
          },
        };
        request(param, (resData) => {
          if (resData.data.code === 200) {
            let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
            let prevPage = pages[pages.length - 2];
            prevPage.getPreOrderInfo();
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
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
    });
  },
});
