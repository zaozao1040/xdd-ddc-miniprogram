import { base } from '../../comm/public/base'
class order extends base{
  getOrderData(param,callback){
    let allParams = {
      url: 'http://localhost:8888/xddRequest/order.json',
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