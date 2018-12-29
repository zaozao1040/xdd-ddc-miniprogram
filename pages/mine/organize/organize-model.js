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
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
}
export { organize }