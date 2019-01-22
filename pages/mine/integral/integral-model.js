import { base } from '../../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class integral extends base {
  /* 获取交易记录列表 */
  getIntegralList(param, callback) {
    let allParams = {
      url: baseUrl + '/user/balanceRecords',
      type: 'get',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 积分兑换 */
  handleExchange(param, callback) {
    let allParams = {
      url: baseUrl + '/user/integralExchangeBalance',
      type: 'post',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
}
export { integral }