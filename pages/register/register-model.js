import { base } from '../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class register extends base{
  /* 注册 */
  register(param,callback){
    let allParams = {
      url: baseUrl+'/login/register',
      type: 'POST',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 获取短信验证码 */
  getVerificationCode(param,callback){
    let allParams = {
      url: baseUrl+'/utils/phone/verify',
      type: 'POST',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 登录 */
  login(param,callback){
    let allParams = {
      url: baseUrl+'/login/login',
      type: 'POST',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 获取企业列表- 根据经纬度 */
  getOrganizeListByLocation(param,callback){
    let allParams = {
      url: baseUrl+'/organize/organizes/longAndLat',
      type: 'GET',
      data: param,
      sCallback: function (data) { callback && callback(data)},
      eCallback: function () { }
    }
    this.request(allParams)
  }
}
export { register }