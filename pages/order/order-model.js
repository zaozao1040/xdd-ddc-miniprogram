import { base } from '../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class order extends base{
  /* 获取全部订单列表 */
  getOrderList(param,callback){
    let allParams = {
      url: baseUrl+'/order/orderList',
      type: 'get',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 取消订单 */
  cancelOrder(param,callback){
    let allParams = {
      url: baseUrl+'/order/cancelOrder',
      type: 'put',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 再次下单 */
  secondpayOrder(param,callback){
    let allParams = {
      url: baseUrl+'/order/orderPayOnceAgain',
      type: 'post',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 评价 */
  evaluateOrder(param,callback){
    let allParams = {
      url: baseUrl+'/order/evaluate',
      type: 'post',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 取餐 */
  takeOrder(param,callback){
    let allParams = {
      url: baseUrl+'/order/takeMeal',
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
export { order }