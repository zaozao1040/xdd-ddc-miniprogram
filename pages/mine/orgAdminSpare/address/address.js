import { base } from "../../../../comm/public/request";
let requestModel = new base();
Page({
  data: {
    timer: null,
    scrollTop: 0,
    buttonTop: 0,
    location: {},
    addressList: [],
    addressDes: "",
    userCode: "",
    organizeCode: "",
    search: "",
    addressListNoResult: false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let { userInfo } = wx.getStorageSync("userInfo");
    _this.setData({
      addressDes: userInfo.deliveryAddress,
    });
    this.data.addressCode = userInfo.deliveryAddressCode;
    this.data.userCode = userInfo.userCode;
    this.data.organizeCode = userInfo.organizeCode;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    let param = {
      url:
        "/organize/getAddressByOrganizeCode?organizeCode=" +
        _this.data.organizeCode,
    };

    requestModel.request(param, (data) => {
      _this.setData({
        addressList: data,
      });

      if (data.length == 0) {
        _this.setData({
          addressListNoResult: true, //查到企业列表无结果，则相应视图
        });
      } else {
        _this.setData({
          addressListNoResult: false,
        });
      }
    });
  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {},

  selectDefaultAddress: function (e) {
    this.setData({
      addressDes: e.currentTarget.dataset.addressdes,
    });
    this.data.addressCode = e.currentTarget.dataset.addresscode;
  },
  changeDefaultAddress: function () {
    let _this = this;
    if (!_this.data.addressCode) {
      wx.showToast({
        title: "请先选择一个地址",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    } else {
      let param = {
        userCode: _this.data.userCode,
        deliveryAddressCode: _this.data.addressCode,
        organizeCode: _this.data.organizeCode,
      };

      let params = {
        data: param,
        url: "/user/updateDeliveryAddress",
        method: "post",
      };

      requestModel.request(params, () => {
        // 刷新
        requestModel.getUserInfo(() => {}, true);

        _this.data.timer = setTimeout(function () {
          wx.navigateBack({
            delta: 1, // 回退前 delta(默认为1) 页面
          });

          wx.showToast({
            title: "地址选择成功",
            image: "/images/msg/success.png",
            duration: 2000,
          });
        }, 2000);
      });
    }
  },
});
