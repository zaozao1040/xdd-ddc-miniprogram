import { base } from '../../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class discount extends base{
  /* 获取优惠券列表 */
  getDiscountList(param,callback){
    let allParams = {
      url: baseUrl+'/user/discount/discounts',
      type: 'GET',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
}
export { discount }