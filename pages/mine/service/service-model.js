import { base } from '../../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class service extends base{
  /* 获取客服内容列表 */
  getServiceList(param,callback){
    let allParams = {
      url: baseUrl+'/help/question',
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
export { service }