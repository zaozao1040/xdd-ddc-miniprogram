import { logUrlList } from "./logUrl.js";
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
      if (logUrlList.indexOf(params.logKey) !== -1) {
        if (result.data && result.data.code == 200) {
          let userInfo = wx.getStorageSync("userInfo").userInfo;
          let tmp_obj = {
            a_key: params.logKey,
            b_user:
              userInfo.userName +
              "/" +
              userInfo.organizeName +
              "/" +
              userInfo.userCode +
              "/" +
              userInfo.organizeCode,
            c_req: {
              url: params.url,
              method: params.method || "GET",
              data: tmp_data,
              header: {
                "content-type": "application/json",
                "X-Requested-With": "XMLHttpRequest",
              },
            },
            d_resp: result.data,
          };
          let obj = {
            ...tmp_obj,
            e_json: JSON.stringify(tmp_obj),
          };
          logger.error("REQ", obj);
          console.log("####### logger ####### ", obj);
        }
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
