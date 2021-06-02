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
    oldSelectedDiscountInfo: {}, //confirm页面中，点击某个餐别，该餐别已经选中的优惠券信息
    // discountList: [{
    //   discountCode: "DIS756113103208316928",
    //   discountDesc: "五一劳动节",
    //   discountMoney: 3,
    //   discountStatus: "NOT_USE",
    //   discountType: "ALL_FOOD_TYPE",
    //   discountTypeDesc: "全品类3元券",
    //   endTime: "2020-09-30",
    //   hasLimit: false,
    //   limitMealTypeList: [],
    //   limitPayPrice: null,
    //   limitTotalPrice: null,
    //   limitUserType: null,
    //   startTime: "2020-09-09",
    //   userDiscountCode: "userDIS756144931382231040",
    //   selected: false,
    // }, {
    //   discountCode: "DIS756113103208316928",
    //   discountDesc: "五一劳动节",
    //   discountMoney: 3,
    //   discountStatus: "NOT_USE",
    //   discountType: "ALL_FOOD_TYPE",
    //   discountTypeDesc: "全品类3元券",
    //   endTime: "2020-09-30",
    //   hasLimit: false,
    //   limitMealTypeList: [],
    //   limitPayPrice: null,
    //   limitTotalPrice: null,
    //   limitUserType: null,
    //   startTime: "2020-09-09",
    //   userDiscountCode: "userDIS756144931382231030",
    //   selected: false,
    // }, {
    //   discountCode: "DIS756113103208316928",
    //   discountDesc: "五一劳动节",
    //   discountMoney: 3,
    //   discountStatus: "NOT_USE",
    //   discountType: "ALL_FOOD_TYPE",
    //   discountTypeDesc: "全品类3元券",
    //   endTime: "2020-09-30",
    //   hasLimit: false,
    //   limitMealTypeList: [],
    //   limitPayPrice: null,
    //   limitTotalPrice: null,
    //   limitUserType: null,
    //   startTime: "2020-09-09",
    //   userDiscountCode: "userDIS756144931382231020",
    //   selected: false,
    // }]
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
      oldSelectedDiscountInfo:
        getApp().globalData.publicParam.oldSelectedDiscountInfo,
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
    console.log("33333", {
      newSelectedDiscountInfo: e.detail, // 设置需要传递的参数
    });
    let _this = this;
    let tmp_publicParam = getApp().globalData.publicParam;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/combineDiscount",
      method: "post",
      data: {
        userCode: _this.data.userInfo.userCode,
        mealType: tmp_publicParam.mealDate,
        mealDate: tmp_publicParam.mealDate,
        discountCode: newSelectedDiscountInfo,
      },
    };
    console.log("####### 3 ####### ", param);

    // request(param, (resData) => {
    //   if (resData.data.code === 200) {

    //   } else {
    //     wx.showToast({
    //       title: resData.data.msg,
    //       image: "/images/msg/error.png",
    //       duration: 2000,
    //     });
    //   }
    // });

    // wx.navigateBack({
    //   delta: 1, // 回退前 delta(默认为1) 页面
    // });
  },
  /* 监听子组件：选择不使用优惠券触发事件 */
  onRemoveSelectDiscount: function () {
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。

    let prevPage = pages[pages.length - 2];

    prevPage.setData(
      {
        newSelectedDiscountInfo: {}, // 设置需要传递的参数 , 直接置空
      },
      function () {
        // setData完成后再调用
        prevPage.refreshSelectedDiscountCodeList("del"); // 先刷新已选中的优惠券code的列表
        prevPage.refreshYouhuiquanInfo("del"); // 再刷新整个confirm页面（优惠券可用数量 + 已选择优惠券抵扣情况 的展示）
      }
    );

    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    });
  },
});
