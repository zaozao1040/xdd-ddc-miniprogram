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
      mealType: "",
      mealDateList: [],
    },
    rules: {
      deliveryAddressCode: {
        required: true,
      },
    },
    preData: {},
    mealDateListAll: [],
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
            ..._this.form,
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
          mealDateListAll: tmp,
          form: { ..._this.data.form, mealType: "BREAKFAST" },
        });
      } else if (data.lunchList) {
        let tmp = [];
        data.lunchList.forEach((item) => {
          tmp.push({
            value: item,
            isChecked: false,
          });
        });
        _this.setData({
          preData: data,
          mealDateListAll: tmp,
          form: { ..._this.data.form, mealType: "LUNCH" },
        });
      } else if (data.dinnerList) {
        let tmp = [];
        data.dinnerList.forEach((item) => {
          tmp.push({
            value: item,
            isChecked: false,
          });
        });
        _this.setData({
          preData: data,
          mealDateListAll: tmp,
          form: { ..._this.data.form, mealType: "DINNER" },
        });
      } else if (data.nightList) {
        let tmp = [];
        data.nightList.forEach((item) => {
          tmp.push({
            value: item,
            isChecked: false,
          });
        });
        _this.setData({
          preData: data,
          mealDateListAll: tmp,
          form: { ..._this.data.form, mealType: "NIGHT" },
        });
      }
    });
  },
  clickMealType(val) {
    let _this = this;
    if (val.detail.key == "BREAKFAST") {
      _this.setData({
        mealDateListAll: _this.data.preData.breakfastList,
        form: { ..._this.data.form, mealType: "BREAKFAST" },
      });
    } else if (val.detail.key == "LUNCH") {
      _this.setData({
        mealDateListAll: _this.data.preData.lunchList,
        form: { ..._this.data.form, mealType: "LUNCH" },
      });
    } else if (val.detail.key == "DINNER") {
      _this.setData({
        mealDateListAll: _this.data.preData.dinnerList,
        form: { ..._this.data.form, mealType: "DINNER" },
      });
    } else if (val.detail.key == "NIGHT") {
      _this.setData({
        mealDateListAll: _this.data.preData.nightList,
        form: { ..._this.data.form, mealType: "NIGHT" },
      });
    }
  },
  clickMealDate(e) {
    console.log("@@@@@@@ 2 @@@@@@@ ", e);
    let tmp = [...this.data.mealDateListAll];
    tmp.forEach((item) => {
      if (item.value == e.detail.key) {
        item.isChecked = !item.isChecked;
      }
    });
    console.log("@@@@@@@ 2 @@@@@@@ ", tmp);

    this.setData({
      mealDateListAll: tmp,
    });
  },
});
