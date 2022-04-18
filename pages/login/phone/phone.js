var t = require("../../../comm/script/helper");
import { base } from "../../../comm/public/request";
let requestModel = new base();
Page({
  data: {
    phone: "",
    code: "",
    firstCode: true,
    waitTime: -1,
    bindShow: false,
    loginType: "phone",
    name: "",
    password: "",
    bindOrganizeFlag: false, //绑定企业弹框
  },
  //新用户 - 选择绑定（代表是企业用户），赋值缓存后跳转到登录页面
  gotoBind() {
    this.setData({
      bindOrganizeFlag: false,
    });

    wx.redirectTo({
      url: "/pages/login/login",
    });
  },
  //新用户 - 选择不绑定（代表是普通用户），赋值缓存后直接跳转到home页
  cancelBind() {
    this.setData({
      bindOrganizeFlag: false,
    });
    wx.switchTab({
      url: "/pages/home/home",
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {},
  phoneInput: function (e) {
    this.setData({
      phone: e.detail.value,
    });
  },
  nameInput: function (e) {
    this.setData({
      name: e.detail.value,
    });
  },
  pwdInput: function (e) {
    this.setData({
      password: e.detail.value,
    });
  },
  codeInput: function (e) {
    this.setData({
      code: e.detail.value,
    });
  },
  changeValidateType(e) {
    if (this.data.loginType == "phone") {
      this.setData({
        loginType: "namePwd",
      });
      wx.setNavigationBarTitle({ title: "用户名登录" });
    } else {
      this.setData({
        loginType: "phone",
      });
      wx.setNavigationBarTitle({ title: "验证码登录" });
    }
  },
  sendCode: function () {
    let _this = this;
    if (t._validCellPhone(_this.data.phone)) {
      //获取短信验证码
      let param = {
        url: "/login/smsCode?phoneNumber=" + _this.data.phone + "&smsType=1",
      };
      requestModel.request(param, () => {
        wx.showToast({
          title: "发送成功",
          image: "/images/msg/success.png",
          duration: 2000,
        });
        _this.setData({
          firstCode: false,
        });
        let countdown = 60;
        for (var i = 60; i >= 0; i--) {
          setTimeout(function () {
            _this.setData({
              waitTime: countdown,
            });
            countdown--;
          }, 1000 * i);
        }
      });
    } else {
      wx.showToast({
        title: "手机必须11位数字",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    }
  },
  // 用户名密码登录
  loginWithNamePwd() {
    let param = {};
    param.account = this.data.name;
    param.password = this.data.password;
    let params = {
      url: "/login/accountLogin",
      method: "post",
      data: param,
    };
    requestModel.request(params, (data) => {
      //刷新userInfo
      wx.setStorageSync("userCode", data.userCode);

      wx.switchTab({
        url: "/pages/home/home",
      });
      wx.showToast({
        title: "登录成功",
        image: "/images/msg/success.png",
        duration: 2000,
      });
    });
  },
  loginByPhone: function () {
    let _this = this;
    if (t._validCellPhone(_this.data.phone)) {
      if (_this.data.code == "") {
        wx.showToast({
          title: "请输入验证码",
          image: "/images/msg/error.png",
          duration: 2000,
        });
      } else {
        wx.login({
          success: function (res) {
            if (res.code) {
              let { avatarUrl, nickName, gender } =
                wx.getStorageSync("getWxUserInfo");
              let param = {
                smsCode: _this.data.code, //短信验证码
                phoneNumber: _this.data.phone,
                encryptedData: {
                  code: res.code,
                },
                userInfo: {
                  headImage: avatarUrl,
                  nickName: nickName,
                  sex: gender,
                },
              };
              let params = {
                data: param,
                url: "/login/phoneCodeLogin",
                method: "post",
              };

              requestModel.request(params, (data) => {
                wx.setStorageSync("userCode", data.userCode);
                if (data.newUser == true) {
                  //新用户 弹出是否绑定企业的模态框 TODO 5/14
                  _this.setData({
                    bindOrganizeFlag: true,
                  });
                } else {
                  //老用户 直接进入home页面
                  wx.switchTab({
                    url: "/pages/home/home",
                  });
                  wx.showToast({
                    title: "登录成功",
                    image: "/images/msg/success.png",
                    duration: 1000,
                  });
                }
              });
            }
          },
        });
      }
    } else {
      wx.showToast({
        title: "手机必须11位数字",
        image: "/images/msg/error.png",
        duration: 2000,
      });
    }
  },
  goback() {
    wx.switchTab({
      url: "/pages/mine/mine",
    });
  },
});
