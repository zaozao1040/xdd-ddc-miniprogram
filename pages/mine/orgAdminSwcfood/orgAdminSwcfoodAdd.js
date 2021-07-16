import { base } from "../../../comm/public/request";
let requestModel = new base();
import moment from "moment";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    organizeAddressList: [],
    form: {
      userCode:"",
      address: "",
      deliveryAddressCode: "",
      mealType: "",
      mealDateList: [],
      foodList:[]
    },
    bDisable:false,
    lDisable:false,
    dDisable:false,
    nDisable:false,
    rules: {
      deliveryAddressCode: {
        required: true,
      },
      mealType: {
        required: true,
      },
      mealDateList: {
        required: true,
      },
      foodList: {
        required: true,
      },
    },
    preData: {},
    mealDateBreakfastList: [],
    mealDateLunchList: [],
    mealDateDinnerList: [],
    mealDateNightList: [],
    currentMealDateListAll: [],
    foodListAll:[],
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
      let tmp_bDisable = false
      let tmp_lDisable = false
      let tmp_dDisable = false
      let tmp_nDisable = false
      let tmp_mealType = null
      let tmp_currentMealDateListAll = []
      // 1.获取四个disable
      // 2.获取当前餐别
      if (data.breakfastList) {
        tmp_mealType = "BREAKFAST"
        data.breakfastList.forEach((item) => {
          tmp_currentMealDateListAll.push({
            value: item,
            isChecked: false,
          });
        });
      } else {
        tmp_bDisable=true
      }
      if (data.lunchList) {
        if(!tmp_mealType){
          tmp_mealType = "LUNCH"
          data.lunchList.forEach((item) => {
            tmp_currentMealDateListAll.push({
              value: item,
              isChecked: false,
            });
          });
        }
      } else {
        tmp_lDisable=true
      }
      if (data.dinnerList) {
        if(!tmp_mealType){
          tmp_mealType = "DINNER"
          data.dinnerList.forEach((item) => {
            tmp_currentMealDateListAll.push({
              value: item,
              isChecked: false,
            });
          });
        }
      } else {
        tmp_dDisable=true
      }
      if (data.nightList) {
        if(!tmp_mealType){
          tmp_mealType = "NIGHT"
          data.nightList.forEach((item) => {
            tmp_currentMealDateListAll.push({
              value: item,
              isChecked: false,
            });
          });
        }
      } else {
        tmp_nDisable=true
      }
      _this.setData({
        preData: data,
        currentMealDateListAll: tmp_currentMealDateListAll,
        bDisable:tmp_bDisable,
        lDisable:tmp_lDisable,
        dDisable:tmp_dDisable,
        nDisable:tmp_nDisable,
        form:{
          ..._this.data.form,
          mealType:tmp_mealType
        },
        foodListAll:data.foodList||[],
      });
    });
  },

  clickMealType(val) {
    let _this = this;
    if (val.detail.key == "BREAKFAST") {
      let tmp_currentMealDateListAll = []
      _this.data.preData.breakfastList.forEach((item) => {
        tmp_currentMealDateListAll.push({
          value: item,
          isChecked: false,
        });
      });
      _this.setData({
        currentMealDateListAll: tmp_currentMealDateListAll,
        form: { ..._this.data.form, mealType: "BREAKFAST" },
      });
    } else if (val.detail.key == "LUNCH") {
      let tmp_currentMealDateListAll = []
      _this.data.preData.lunchList.forEach((item) => {
        tmp_currentMealDateListAll.push({
          value: item,
          isChecked: false,
        });
      });
      _this.setData({
        currentMealDateListAll:  tmp_currentMealDateListAll,
        form: { ..._this.data.form, mealType: "LUNCH" },
      });
    } else if (val.detail.key == "DINNER") {
      let tmp_currentMealDateListAll = []
      _this.data.preData.dinnerList.forEach((item) => {
        tmp_currentMealDateListAll.push({
          value: item,
          isChecked: false,
        });
      });
      _this.setData({
        currentMealDateListAll:  tmp_currentMealDateListAll,
        form: { ..._this.data.form, mealType: "DINNER" },
      });
    } else if (val.detail.key == "NIGHT") {
      let tmp_currentMealDateListAll = []
      _this.data.preData.nightList.forEach((item) => {
        tmp_currentMealDateListAll.push({
          value: item,
          isChecked: false,
        });
      });
      _this.setData({
        currentMealDateListAll:  tmp_currentMealDateListAll,
        form: { ..._this.data.form, mealType: "NIGHT" },
      });
    }
  },
  clickMealDate(e) {
    let tmp = [...this.data.currentMealDateListAll];
    tmp.forEach((item) => {
      if (item.value == e.detail.key) {
        item.isChecked = !item.isChecked;
      }
    });

    this.setData({
      currentMealDateListAll: tmp,
    });
  },
  getMealDateList(){
    let tmp_mealDateList = []
    this.data.currentMealDateListAll.forEach(item=>{
      if(item.isChecked){
        tmp_mealDateList.push(item.value)
      }
    })
    return tmp_mealDateList
  },
  getNewFoodList(){
    let tmp_foodList = []
    this.data.foodListAll.forEach(item=>{
      if(item.foodQuantity>0){
        tmp_foodList.push({
          foodQuantity:item.foodQuantity,
          foodCode:item.foodCode,
          mark:""
        })
      }
    })
    return tmp_foodList
  },
  clickCommit(){
    
    let _this = this
    let newMealDateList  = _this.getMealDateList()
    if(newMealDateList.length==0){
      wx.showToast({
        title: '日期未选',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let newFoodList = _this.getNewFoodList()
    if(newFoodList.length==0){
      wx.showToast({
        title: '餐品未选',
        icon: 'none',
        duration: 2000
      })
      return
    }
    _this.data.form = {
      ..._this.data.form,
      userCode:_this.data.userInfo.userCode,
      mealDateList:newMealDateList,
      foodList:newFoodList
    }
    let params = {
      data: _this.data.form,
      url: "/business/addBusinessMeal",
      method: "post",
    };
    requestModel.request(params, () => {
      wx.showToast({
        title: '申请成功',
        icon: 'none',
        duration: 2000
      })
      setTimeout(function () {
        wx.reLaunch({
          url: "/pages/mine/orgAdminSwcfood/orgAdminSwcfood",
        });
      }, 2000)
    });
  },
  clickCounter(e){
    let {count,type} = e.detail
    let index = e.currentTarget.dataset.index
    if(type=='add'){
      this.data.foodListAll[index].foodQuantity++
    }else if(type=='reduce'){
      this.data.foodListAll[index].foodQuantity--
    }
  }
});
