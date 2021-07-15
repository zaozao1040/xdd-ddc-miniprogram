import { base } from "../../../comm/public/request";
let requestModel = new base();
import moment from "moment";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    organizeAddressList: [],
    form: {
      address: "",
      deliveryAddressCode: "",
      mealType: "LUNCH",
      mealDateList: [],
    },
    rules: {
      deliveryAddressCode: {
        required: true,
      },
    },
    preData: {},
    mealDateBreakfastList: [],
    mealDateLunchList: [],
    mealDateDinnerList: [],
    mealDateNightList: [],
    currentMealDateListAll: [],
  },

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
    this.getOrganizeAddressList();
    this.getBusinessMealPre();
  },
  clickSheet(e) {
    this.setData({
      form: {
        ...this.form,
        deliveryAddressCode: e.detail.item.deliveryAddressCode,
        address: e.detail.item.address,
      },
    });
  },

  clickXzAddress() {
    this.data.organizeAddressList.forEach((item) => {
      item.name = item.address;
    });
    wx.lin.showActionSheet({
      itemList: this.data.organizeAddressList,
    });
  },

  getOrganizeAddressList() {
    let _this = this;
    let param = {
      url:
        "/organize/listOrganizeDeliveryAddress?userCode=" +
        _this.data.userInfo.userCode,
    };
    requestModel.request(param, (data) => {
      if (data instanceof Array && data.length > 0) {
        _this.setData({
          organizeAddressList: data,
          form: {
            ..._this.data.form,
            deliveryAddressCode: data[0].deliveryAddressCode,
            address: data[0].address,
          },
        });
      }
    });
  },
  getBusinessMealPre() {
    let _this = this;
    let param = {
      url:
        "/business/getBusinessMealPre?userCode=" + _this.data.userInfo.userCode,
    };
    requestModel.request(param, (data) => {
      if (data.breakfastList) {
        let tmp = [];
        data.breakfastList.forEach((item) => {
          tmp.push({
            value: item,
            isChecked: false,
          });
        });
        _this.setData({
          preData: data,
          mealDateBreakfastList: tmp,
        });
      } else {
        _this.setData({
          preData: data,
          mealDateBreakfastList: [],
        });
      }
      if (data.lunchList) {
        let tmp = [];
        data.lunchList.forEach((item) => {
          tmp.push({
            value: item,
            isChecked: false,
          });
        });
        _this.setData({
          preData: data,
          mealDateLunchList: tmp,
          currentMealDateListAll: tmp, //默认午餐
        });
      } else {
        _this.setData({
          preData: data,
          mealDateLunchList: [],
        });
      }
      if (data.dinnerList) {
        let tmp = [];
        data.dinnerList.forEach((item) => {
          tmp.push({
            value: item,
            isChecked: false,
          });
        });
        _this.setData({
          preData: data,
          mealDateDinnerList: tmp,
        });
      } else {
        _this.setData({
          preData: data,
          mealDateDinnerList: [],
        });
      }
      if (data.nightList) {
        let tmp = [];
        data.nightList.forEach((item) => {
          tmp.push({
            value: item,
            isChecked: false,
          });
        });
        _this.setData({
          preData: data,
          mealDateNightList: tmp,
        });
      } else {
        _this.setData({
          preData: data,
          mealDateNightList: [],
        });
      }
    });
  },

  clickMealType(val) {
    let _this = this;
    if (val.detail.key == "BREAKFAST") {
      _this.setData({
        currentMealDateListAll: _this.data.mealDateBreakfastList,
        form: { ..._this.data.form, mealType: "BREAKFAST" },
      });
    } else if (val.detail.key == "LUNCH") {
      _this.setData({
        currentMealDateListAll: _this.data.mealDateLunchList,
        form: { ..._this.data.form, mealType: "LUNCH" },
      });
    } else if (val.detail.key == "DINNER") {
      _this.setData({
        currentMealDateListAll: _this.data.mealDateDinnerList,
        form: { ..._this.data.form, mealType: "DINNER" },
      });
    } else if (val.detail.key == "NIGHT") {
      _this.setData({
        currentMealDateListAll: _this.data.mealDateNightList,
        form: { ..._this.data.form, mealType: "NIGHT" },
      });
    }
  },
  clickMealDate(e) {
    console.log("@@@@@@@ 2 @@@@@@@ ", e);
    let tmp = [...this.data.currentMealDateListAll];
    tmp.forEach((item) => {
      if (item.value == e.detail.key) {
        item.isChecked = !item.isChecked;
      }
    });
    console.log("@@@@@@@ 2 @@@@@@@ ", tmp);

    this.setData({
      currentMealDateListAll: tmp,
    });
  },
  submit() {
    console.log("@@@@@@@ 2 @@@@@@@ ");
  },
});
