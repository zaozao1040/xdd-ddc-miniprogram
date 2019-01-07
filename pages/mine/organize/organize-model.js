import { base } from '../../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class organize extends base{
  /* 更换企业 */
  changeOrganize(param,callback){
    let allParams = {
      url: baseUrl+'/user/organize',
      type: 'POST',
      data: param,
      sCallback: function (data) {
        //这个容错是 因为两个小程序的缓存都叫userInfo，强制跳转首页会刷新这个信息，否则用户必须手动到首页点击退出，然后登陆重新刷新
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
}
export { organize }