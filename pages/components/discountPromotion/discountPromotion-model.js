import { base } from '../../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class discountPromotion extends base{
  /* 领取优惠券 */
  takeDiscount(param,callback){
    let allParams = {
      url: baseUrl+'/order/newOrder',
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
export { discountPromotion }