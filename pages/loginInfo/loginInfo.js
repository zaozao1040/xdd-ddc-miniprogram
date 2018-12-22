// pages/loginInfo/loginInfo.js
var t = require("../../comm/script/helper")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: '18551585569',
    nameInput: '',
    enterpriseInput:'',
    nickNameInput:'',
    gender: 0,
    selectM: "on",
    selectW: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  },
  nameInput: function (e) {
    this.setData({
      nameInput: e.detail.value
    });
  },
  enterpriseInput: function (e) {
    this.setData({
      enterpriseInput: e.detail.value
    });
  },
  nickNameInput: function (e) {
    this.setData({
      nickNameInput: e.detail.value
    });
  },
  register: function () {
    if (this.data.nameInput == '') {
      wx.showToast({
        title: "请输入姓名",
        icon: "none",
        duration: 2000
      })
      return
    }
    if (this.data.enterpriseInput == '') {
      wx.showToast({
        title: "请输入企业名字",
        icon: "none",
        duration: 2000
      })
      return
    }
    if (this.data.nickNameInput == '') {
      wx.showToast({
        title: "请输入昵称",
        icon: "none",
        duration: 2000
      })
      return
    }
    wx.request({
      url: 'login.php',
      data: {
        nameInput: this.data.nameInput,
        enterpriseInput: this.data.enterpriseInput,
        nickNameInput: this.data.nickNameInput,
        gender: this.data.gender
      },
      success(res) {
        //-----------处理
        wx.navigateTo({
          url: '../loginInfo/loginInfo?phone=' + this.data.phone,
        })
      }
    })
  },
  radioChange: function (e) {
    console.log(e.detail.value)
  },
  setGender: function (e) {
    this.data.gender = e.target.dataset.gender
    this.data.gender == 0 ? this.setData({
      selectW: "un",
      selectM: "on"
    }) : this.setData({
      selectM: "un",
      selectW: "on"
    });
    console.log('this.data.gender:', this.data.gender)
  },
})