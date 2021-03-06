import { base } from "../../../comm/public/request";
let requestModel = new base();
Page({
  data: {
    timer: null,
    frontPageFlag: null, //代表前一个页面的标志
    scrollTop: 0,
    buttonTop: 0,
    location: {},
    addressList: [],
    addressCode: "aaaa",
    addressDes: "",
    organizeCode: "",
    search: "",
    addressListNoResult: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    if (options.frontPageFlag) {
      this.setData({
        frontPageFlag: options.frontPageFlag,
      });
    }
    requestModel.getUserInfo((userInfo) => {
      _this.setData({
        addressDes: userInfo.deliveryAddress,
        addressCode: userInfo.deliveryAddressCode,
      });
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    //请求地址列表，以便选择后提交
    requestModel.getUserCode((userCode) => {
      _this.data.userCode = userCode;
      let param = {
        url: "/organize/getOrganizeDeliveryAddress?userCode=" + userCode,
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
    });
  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {},

  selectDefaultAddress: function (e) {
    this.setData({
      addressDes: e.currentTarget.dataset.addressdes,
      addressCode: e.currentTarget.dataset.addresscode,
    });
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
      };

      let params = {
        data: param,
        url: "/user/userSetDefaultAddress",
        method: "post",
      };
      requestModel.request(params, () => {
        // 刷新
        requestModel.getUserInfo(() => {}, true);
        _this.data.timer = setTimeout(function () {
          if (_this.data.frontPageFlag == "confirm") {
            let pages = getCurrentPages();

            let prevPage = pages[pages.length - 2];

            prevPage.setData(
              {
                address: _this.data.addressDes, // 地址中文描述 其实就是addressName
                newAddressCode: _this.data.addressCode, // 地址投柜code 其实就是deliveryAddressCode
              },
              function () {
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                });
              }
            );
          } else if (_this.data.frontPageFlag == "spare") {
            wx.navigateBack({
              delta: 1, // 回退前 delta(默认为1) 页面
            });
          } else {
            wx.switchTab({
              url: "/pages/mine/mine",
            });
          }

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
