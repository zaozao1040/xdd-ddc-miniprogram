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
    timeout: 120000,
    url: params.url,
    method: params.method || "GET",
    data:
      params.method === "get" || params.method === "GET"
        ? tmp_data
        : JSON.stringify(tmp_data),
    header: {
      "content-type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      // 'ddc_sso_sessionid': getApp().globalData.ddc_sso_sessionid
    },
    success: (result) => {
      // let {
      // 	data,
      // 	code,
      // 	msg
      // } = result.data
      // if (code !== 200) {
      // 	console.log('ssss', code, data, result, msg)
      // 	uni.showToast({
      // 		title: msg,
      // 	});
      // }
      sCallback && sCallback(result);
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
