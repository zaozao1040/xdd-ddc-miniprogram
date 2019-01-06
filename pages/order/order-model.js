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
}
export { order }