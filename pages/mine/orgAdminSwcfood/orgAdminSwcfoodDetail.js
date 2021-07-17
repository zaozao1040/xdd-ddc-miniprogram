import { base } from "../../../comm/public/request";
let requestModel = new base();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    info:{},
    tmp_foodList:[],
    dialogStatus:false

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
  onLoad: function (options) {    
    let _this = this;
    let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
    if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
      let tmp_userInfo = tmp_tmp_userInfo.userInfo;
      _this.setData(
        {
          userInfo: tmp_userInfo,
        }
      );
    }
    console.log('####### 3 ####### ',getApp().globalData.swcItem);
    let swcItem = getApp().globalData.swcItem
    _this.setData({
      info:swcItem,
      tmp_foodList:JSON.parse(JSON.stringify(swcItem.foodList))
    });
  },



  clickCommit: function () {
    
    this.setData({
      dialogStatus:  true
    });
  },

  clickConfirm: function () {

    let _this = this

   let tmp_form = {
      userCode:_this.data.userInfo.userCode,
      orderSpecialCode:_this.data.info.orderSpecialCode,
      foodList:_this.data.tmp_foodList
    }
   
    let params = {
      data: tmp_form,
      url: "/business/updateBusinessMeal",
      method: "post",
    };
    requestModel.request(params, () => {
      wx.showToast({
        title: '修改成功',
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
      this.data.tmp_foodList[index].foodQuantity++
    }else if(type=='reduce'){
      this.data.tmp_foodList[index].foodQuantity--
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})