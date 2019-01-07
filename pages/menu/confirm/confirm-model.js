import { base } from '../../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class confirm extends base{
  /* 菜单提交 */
  commitConfirmMenuData(param,callback){
    let allParams = {
      url: baseUrl+'/order/newOrder',
      type: 'post',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }  

}
export { confirm }