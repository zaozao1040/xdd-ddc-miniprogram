import { base } from '../../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class address extends base{
  /* 获取地址列表 */
  getaddressList(param,callback){
    let allParams = {
      url: baseUrl+'/organize/address',
      type: 'get',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 默认地址选择 */
  commitDefaultAddress(param,callback){
    let allParams = {
      url: baseUrl+'/user/address/default',
      type: 'put',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
}
export { address }