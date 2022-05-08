import { base } from "../../../comm/public/request";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";

let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 有奖
    dcyjList: [],
    dcyjInfo: {
      yd: 0,
      ks: "",
      js: "",
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    let tmp_userInfo = wx.getStorageSync("userInfo");
    if (tmp_userInfo) {
      _this.setData(
        {
          userInfo: tmp_userInfo.userInfo,
        },
        () => {
          _this.loadData();
        }
      );
    }
  },
  loadData: function () {
    this.getDcyjList();
  },
  getDcyjList: function () {
    let _this = this;
    let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
    if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
      let tmp_userInfo = tmp_tmp_userInfo.userInfo;
      let param = {
        url: "/orderReward/getRewardSet?userCode=" + tmp_userInfo.userCode,
      };
      requestModel.request(param, (resData) => {
        if (
          resData &&
          resData.completedDTOList &&
          resData.completedDTOList.length > 0
        ) {
          let len = resData.completedDTOList.length;
          for (let i = 0; i < len; i++) {
            resData.completedDTOList[i].week = [
              "一",
              "二",
              "三",
              "四",
              "五",
              "六",
              "日",
            ][i];
          }
          _this.setData({
            dcyjList: resData.completedDTOList || [],
            dcyjInfo: {
              yd: resData.alreadyDay,
              ks: resData.completedDTOList[0].date,
              js: resData.completedDTOList[len - 1].date,
            },
          });
        }
      });
    }
  },
  clickLq: function (e) {
    let _this = this;

    let { item } = e.currentTarget.dataset;
    if (item.ifReceive != 1) {
      wx.showToast({
        title: "不可领取",
        icon: "none",
      });
      return;
    }
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_tmp",
      time: 1000,
      success: () => {
        let [userCode, rewardSetCode, rewardIntegralNum, date] = [
          _this.data.userInfo.userCode,
          item.rewardSetCode,
          item.rewardIntegralNum,
          item.date,
        ];
        let param = {
          url:
            "/orderReward/receivePoint?userCode=" +
            userCode +
            "&rewardSetCode=" +
            rewardSetCode +
            "&rewardIntegralNum=" +
            rewardIntegralNum +
            "&date=" +
            date,
        };
        requestModel.request(param, (resData) => {
          if (resData) {
            wx.showToast({
              title: "已获得积分",
              icon: "none",
            });
            setTimeout(() => {
              _this.loadData();
            }, 2000);
          }
        });
      },
    });
  },
});
