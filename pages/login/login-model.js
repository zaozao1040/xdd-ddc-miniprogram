import { base } from '../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class login extends base{
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
  /* 登出 */
  logout(){
    console.log(getApp().globalData.userInfo )
    //getApp().globalData.userInfo = null
  }
}
export { login }