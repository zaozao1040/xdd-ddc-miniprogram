import { base } from '../../comm/public/base'
const app = getApp()  
const baseUrl = app.globalData.baseUrl
class confirm extends base{
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
export { confirm }