import { base } from "../../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 10, // 每页条数
    hasMoreDataFlag: true, //是否还有更多数据  默认还有

    loadingData: false,
    list: [],
    //送餐地址
    organizeAddressList: [],
    currentAddressIndex: 0,
    deliveryAddressCode: "",
    address: "",

    value: 0,
    date: "",
    mealType: "",
    mealTypeNameList: {
      BREAKFAST: "早餐",
      LUNCH: "午餐",
      DINNER: "晚餐",
      NIGHT: "夜宵",
    },
    list: [],
    userCode: "",
    quantity: 0,
    canadd: true,
    hasdata: false,
    hasalready: false,
    remarkCount: 0,
    markDetail: [],
    popContent: {},
    modalContent: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let _this = this;
    let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
    if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
      let tmp_userInfo = tmp_tmp_userInfo.userInfo;
      _this.setData(
        {
          userInfo: tmp_userInfo,
        },
        () => {
          _this.loadData();
        }
      );
    }
  },
  loadData() {
    this.getList();
  },
  getList() {
    let _this = this;
    _this.setData({
      loadingData: true,
    });
    let page = _this.data.page;
    let limit = _this.data.limit;
    let param = {
      url:
        "/business/listBusinessMeal?userCode=" +
        _this.data.userInfo.userCode +
        "&page=" +
        _this.data.page +
        "&limit=" +
        _this.data.limit,
    };
    requestModel.request(param, (data) => {
      console.log("@@@@@@@ 2 @@@@@@@ ", data);
      let tmp_list = data.list;
      if (page == 1) {
        _this.setData({
          list: tmp_list,
        });
      } else {
        _this.setData({
          list: _this.data.list.concat(tmp_list),
        });
      }
      //下面开始分页
      if (page * limit >= data.amount) {
        _this.setData({
          hasMoreDataFlag: false,
        });
      } else {
        _this.setData({
          hasMoreDataFlag: true,
          page: page + 1,
        });
      }
    });
  },
  clickAdd() {
    wx.navigateTo({
      url: "/pages/mine/orgAdminSwcfood/orgAdminSwcfoodAdd",
    });
  },
});
