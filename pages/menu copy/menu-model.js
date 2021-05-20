import { base } from '../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class menu extends base{
/*   getMenuData(param,callback){
    let allParams = {
      url: 'http://192.168.1.123:8080/food/foods',
      //url: 'http://localhost:8888/xddRequest/menu.json',
      //url: 'http://localhost:8888/menu.json',
      type: 'get',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  } */
  /* 获取后台时间信息 */
  getTimeData(param,callback){
    let allParams = {
      url: baseUrl+'/food/date',
      type: 'get',
      data: param,
      sCallback: function (res) {
        console.log('收到请求(七天日期):',res)
        wx.hideLoading()
        if(res.code === 0){
          callback(res.data) //七天日期通过回调返回给调用者
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })  
        }
      },
      eCallback: function () { }
    }
/*     wx.showLoading({ 
      title: '日期加载中',
      mask: true
    }) */
    /* 发送请求到后端 */
    this.request(allParams)
  }
  /* 获取后台菜单信息 */
  getMenuData(param,callback){
    let allParams = {
      url: baseUrl+'/food/foods',
      type: 'get',
      data: param,
      sCallback: function (res) {
        console.log('收到请求(指定日期、餐时的菜单):',res)
        wx.hideLoading()
        if(res.code === 0){
          callback(res.data) //通过回调返回给调用者
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })  
        }
      },
      eCallback: function () { }
    }
    wx.showLoading({ 
      title: '菜单加载中',
      mask: true
    })
    /* 发送请求到后端 */
    this.request(allParams)
  }
  /* 菜单提交 */
  commitMenuData(param,callback){
    let allParams = {
      url: baseUrl+'/food/foods',
      type: 'post',
      data: param,
      sCallback: function (res) {
        console.log('收到请求(提交菜单):',res)
        wx.hideLoading()
        if(res.code === 0){
          callback(res.data) //通过回调返回给调用者
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })  
        }
      },
      eCallback: function () { }
    }
    wx.showLoading({ 
      title: '菜单提交中',
      mask: true
    })
    /* 发送请求到后端 */
    this.request(allParams)
  }  
}
export { menu }