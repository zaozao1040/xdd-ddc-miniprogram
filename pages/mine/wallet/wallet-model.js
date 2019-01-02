import { base } from '../../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class wallet extends base{
  /* 充值 */
  recharge(param,callback){
    let allParams = {
      url: baseUrl+'/user/RechargeOfBalance',
      type: 'POST',
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