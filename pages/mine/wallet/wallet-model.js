import { base } from '../../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class wallet extends base {
  /* 请求充值返送列表 */
  getGiftList(param, callback) {
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
  /* 充值 */
  RechargeBalance(param, callback) {
    let allParams = {
      url: baseUrl + '/user/RechargeOfBalance',
      type: 'POST',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 获取交易记录列表 */
  getRechargeList(param, callback) {
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
  /* 获取钱包信息 */
  getWalletData(param, callback) {
    let allParams = {
      url: baseUrl + '/user/balance',
      type: 'get',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }

}
export { wallet }