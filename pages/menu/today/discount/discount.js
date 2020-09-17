import {
  base
} from '../../../../comm/public/request'
let requestModel = new base()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    discountList: [],//可用的优惠券列表
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
    //   userDiscountCode: "userDIS756144931382231040",
    // }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    _this.getDiscountList()
  },

  /* 获取优惠券列表 */
  getDiscountList() {
    let _this = this
    getApp().globalData.publicArr
    let param = {
      data: getApp().globalData.publicParam,
      // data: {
      //   mealDate: "2020-09-18",
      //   mealType: "LUNCH",
      //   userCode: "USER532153350376914957",
      //   foods: {
      //     foodCode: "FOOD532153300896841728",
      //     foodQuantity: 1,
      //     markDetail: undefined,
      //   }
      // },
      url: '/userDiscount/discountOrderDetail',
      method: 'post'
    }
    requestModel.request(param, (data) => {
      _this.setData({
        discountList: data
      })

    });
  },

  /* 监听子组件：选择优惠券触发事件 */
  onChangeSelectDiscount: function (e) {
    console.log('eeee', e.detail)
    let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。

    let prevPage = pages[pages.length - 2];

    prevPage.setData({
      currentDiscountSelectedInfo: e.detail,　// 设置需要传递的参数
    }, function () {
      prevPage.getSelectedFoodsParam() // setData完成后再调用
    })

    //  prevPage.getSelectedFoodsParam() // setData完成后再调用
    wx.navigateBack({
      delta: 1, // 回退前 delta(默认为1) 页面
    })

  },
})