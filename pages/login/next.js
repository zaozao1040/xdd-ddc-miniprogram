import { base } from "../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    showAddressFlag: false,
    organizeName: null,
    organizeNickName: null,
    organizeCode: null,
    canRequest: false,
    organizeList: [],
    userName: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("======= op ======= ", options);
    this.setData({
      userName: options.userName,
    });
  },

  organizeNameInput: function (e) {
    let _this = this;
    _this.setData({
      organizeName: e.detail.value,
    });
  },
  search: function () {
    let _this = this;
    if (_this.data.organizeName) {
      let param = {
        url: "/v3/getOrganizeList?organizeName=" + _this.data.organizeName,
      };
      requestModel.request(param, (data) => {
        _this.setData({
          organizeList: data,
          showAddressFlag: true,
        });
      });
    } else {
      wx.showToast({
        title: "请输入企业",
        icon: "none",
        duration: 2000,
      });
    }
  },
  clickOrg: function (e) {
    let item = e.currentTarget.dataset.item;
    this.setData({
      organizeName: item.organizeName,
      organizeCode: item.organizeCode,
      organizeNickName: item.organizeNickName,
      showAddressFlag: false,
    });
  },
  /* 绑定企业 */
  bindOrganize: function () {
    //点击注册，先获取个人信息，这个是微信小程序的坑，只能通过这个button来实现
    let _this = this;
    if (_this.data.userName == "") {
      wx.showToast({
        title: "请输入姓名",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else if (_this.data.organizeCode == "") {
      wx.showToast({
        title: "请选择企业",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else {
      requestModel.getUserCode((userCode) => {
        let param = {
          userCode: userCode,
          userName: _this.data.userName,
          organizeCode: _this.data.organizeCode,
        };

        let params = {
          data: param,
          url: "/user/bindOrganize",
          method: "post",
        };

        requestModel.request(params, () => {
          requestModel.getUserInfo(() => {}, true);
          wx.reLaunch({
            //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
            url: "/pages/home/home",
          });

          wx.showToast({
            title: "登录成功",
            image: "/images/msg/success.png",
            duration: 2000,
          });
        });
      });
    }
  },
});
