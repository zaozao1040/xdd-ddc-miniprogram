import { base } from '../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class home extends base{
  /* 获取注册状态 true已注册过   false未注册 */
  getRegisteredFlag(param,callback){
    let allParams = {
      url: baseUrl+'/login/registered',
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
export { home }