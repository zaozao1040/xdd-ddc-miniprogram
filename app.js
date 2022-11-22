const mtjwxsdk = require("./utils/mtj-wx-sdk.js");
import { request } from "./comm_plus/public/request.js";
App({
  globalData: {
   //  baseUrl: "https://wx.api.91dcan.cn", //线上真实数据，发a布使用！！！！！！！！！！
    // baseUrl: "https://test.91dcan.cn/wx/api", //测试服务器
    //   baseUrl: "http://192.168.10.208:9082", //陈震
    //  baseUrl: "http://192.168.10.203:9082", //曹功德
    //   baseUrl: "http://192.168.10.202:9082", //徐爱国
    baseUrl: "http://192.168.10.203:9082", //李川

    baseUrlFlyingCarpet: "https://smartcabinet.91dcan.cn", //飞毯线上真实数据，发布使用！！！！！！！！！！
    //  baseUrlFlyingCarpet: "http://192.168.10.207:9084", //李川

    version: "v3.5.5",

    xddOrgnaizeCode: "ORG530051032172986376", // xdd的orgnaizeCode,线上真实数据，测试用！！！！！！！！！！
    ningxiaOrgnaizeCode: "ORG717398064662446080", // 宁夏的orgnaizeCode,线上真实数据，发布使用！！！！！！！！！！
    ymkdOrgnaizeCodeList: [
      "ORG578644919455973376",
      "ORG750349351406141440",
      "ORG803565354977722368",
      "ORG530051032172986376",
      "ORG963427064847925248",
    ], // 药明康德的orgnaizeCode列表,线上真实数据，发布使用！！！！！！！！！！
    aomeikaiOrgnaizeCode: "ORG619447125926871040", // 奥美凯的orgnaizeCode,线上真实数据，发布使用！！！！！！！！！！
    chaolibaozhuangOrgnaizeCode: "ORG707884806851133440", // 奥美凯的orgnaizeCode,线上真实数据，发布使用！！！！！！！！！！
    // ymkdOrgnaizeCodeList: ["ORG530051032172986376"], // 药明康德的orgnaizeCode列表,线上真实数据，发布使用！！！！！！！！！！
    NGOOrgnaizeCode: "ORGVISTORE530053156613128193", // NGO的orgnaizeCode,线上真实数据，发布使用！！！！！！！！！！

    // -------------------  下面的配置不需改变  -------------------
    userInfo: null,
    selectedFoods: [],
    totalCount: 0,
    totalMoney: 0, //总价格
    realMoney: 0, //实际价格
    totalCount: 0,

    // 公共临时变量（数组）
    publicArr: [],
    publicParam: {},
    // 商务餐
    swcItem: {},

    // 屏幕尺寸 标题栏高度等
    statusBarHeight: 0,
    titleBarHeight: 0,
    totalBarHeight: 0,
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    let _this = this;
    //计算自定义状态栏高度
    wx.getSystemInfo({
      success: (res) => {
        _this.globalData.statusBarHeight = res.statusBarHeight;
        _this.globalData.titleBarHeight =
          wx.getMenuButtonBoundingClientRect().bottom +
          wx.getMenuButtonBoundingClientRect().top -
          res.statusBarHeight * 2;
        _this.globalData.totalBarHeight =
          res.statusBarHeight + _this.globalData.titleBarHeight;
        console.log("自定义标题栏高度: ", _this.globalData.totalBarHeight);
      },
      fail() {
        _this.globalData.statusBarHeight = 0;
        _this.globalData.titleBarHeight = 0;
      },
    });
    wx.loadFontFace({
      family: "PingFang-SC-Medium",
      source:
        'url("https://oss.91dcan.cn/miniprogram/fonts/PingFangMedium.ttf")',
      success: function () {},
    });
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        console.log(res.hasUpdate);
      });

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: "更新提示",
          content: "新版本已经准备好，是否重启应用？",
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate();
            }
          },
        });
      });
      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
        wx.showModal({
          title: "更新提示",
          content: "新版本下载失败",
          showCancel: false,
        });
      });
    }

    this.clearFoods(); //清空购物车
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    this.checkUpdate();
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {},

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {},
  /**
   * 强制更新
   */
  checkUpdate() {
    if (wx.canIUse("getUpdateManager")) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: "更新提示",
              content: "新版本已经准备好,点击确认重启应用",
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              },
            });
          });
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: "已经有新版本了哟~",
              content: "新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~",
            });
          });
        }
      });
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: "提示",
        content:
          "当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。",
      });
    }
  },
  clearFoods() {
    // 清空购物车
    let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
    if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
      let param = {
        url:
          this.globalData.baseUrl +
          "/v3/cart/deleteShoppingCart?userCode=" +
          tmp_tmp_userInfo.userInfo.userCode,
        method: "post",
      };
      request(param, (resData) => {
        if (resData.data.code === 200) {
          console.log("======= app onLaunch 清空购物车成功 ~ ======= ");
        }
      });
    }
  },
});
