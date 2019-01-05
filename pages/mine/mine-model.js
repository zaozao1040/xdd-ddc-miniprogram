import { base } from '../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class mine extends base{
  /* 获取我的参数 */
  getMineData(param,callback){
    let allParams = {
      url: baseUrl+'/login/refreshUser',
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
export { mine }