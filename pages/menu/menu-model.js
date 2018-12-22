import { base } from '../../comm/public/base'
class menu extends base{
  getMenuData(param,callback){
    let allParams = {
      url: 'http://localhost:8888/xddRequest/menu.json',
      //url: 'http://localhost:8888/menu.json',
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
export { menu }