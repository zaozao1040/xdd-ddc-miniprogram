import { logUrlErrorList, logUrlInfoList } from "./logUrl.js";
const logManager = wx.getRealtimeLogManager();
const logger = logManager.tag("plugin-onUserTapSth");

export function request(params, sCallback, eCallback, cCallback) {
  let baseData = {
    // loginCode: getApp().globalData.userInfo.adminCode,
    // limit: 100,
    // page: 1,
  };
  if (params.needLoading) {
    wx.showLoading({
      title: "加载中",
      mask: true,
    });
  }

  let tmp_data =
    {
      ...baseData,
      ...params.data,
    } || {};
  wx.request({
    timeout: 120000, //超时时间设置为2分钟，目的是飞毯的一些批量操作智能柜，耗时较长
    url: params.url,
    method: params.method || "GET",
    data:
      params.method === "get" || params.method === "GET"
        ? tmp_data
        : JSON.stringify(tmp_data),
    header: {
      "content-type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    success: (result) => {
      sCallback && sCallback(result);
      // 下面处理日志

      if (result.data && result.data.code !== 200) {
        if (logUrlErrorList.indexOf(params.logKey) !== -1) {
          let userInfo = wx.getStorageSync("userInfo").userInfo;
          let obj = {
            a_user:
              userInfo.userName +
              "/" +
              userInfo.organizeName +
              "/" +
              userInfo.phoneNumber +
              "/" +
              userInfo.userCode +
              "/" +
              userInfo.organizeCode,
            b_req: {
              url: params.url,
              data: tmp_data,
            },
            c_resp: result.data,
          };
          logger.error(userInfo.userName, obj);
          console.log("####### error ####### ", params.url);
        }
      }
      if (logUrlInfoList.indexOf(params.logKey) !== -1) {
        let userInfo = wx.getStorageSync("userInfo").userInfo;
        let obj = {
          a_user:
            userInfo.userName +
            "/" +
            userInfo.organizeName +
            "/" +
            userInfo.phoneNumber +
            "/" +
            userInfo.userCode +
            "/" +
            userInfo.organizeCode,
          b_req: {
            url: params.url,
            data: tmp_data,
          },
          c_resp: result.data,
        };
        logger.info(userInfo.userName, obj);
        console.log("####### info ####### ", params.url);
      }
    },
    fail: (error) => {
      console.log("请求报错(" + params.url + "):", error);
    },
    complete: (res) => {
      if (params.needLoading) {
        wx.hideLoading();
      }
    },
  });
}
