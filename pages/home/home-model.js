import { base } from '../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class home extends base {
  /* 获取注册状态 true已注册过   false未注册 */
  getRegisteredFlag(param, callback) {
    let allParams = {
      url: baseUrl + '/login/registered',
      type: 'GET',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /* 获取轮播图 */
  getSwiperList(param, callback) {
    let allParams = {
      url: baseUrl + '/home/banner',
      type: 'GET',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  getImages(param, callback) {
    let allParams = {
      url: baseUrl + '/home/banner',
      type: 'GET',
      data: param,
      sCallback: function (data) {
        callback && callback(data);
      },
      eCallback: function () { }
    }
    this.request(allParams)
  }
  /*   // 获取轮播图 
    getSwiperList(param, callback) {
      let allParams = {
        url: baseUrl + '/home/banner',
        type: 'GET',
        data: param,
        sCallback: function (data) {
          callback && callback(data);
        },
        eCallback: function () { }
      }
      this.request(allParams)
    }
    // 获取推荐活动 
    getPromotionList(param, callback) {
      let allParams = {
        url: baseUrl + '/home/banner?adType=CENTER',
        type: 'GET',
        data: param,
        sCallback: function (data) {
          callback && callback(data);
        },
        eCallback: function () { }
      }
      this.request(allParams)
    } */
  /* 领取新人红包 */
  getNewUserGift(param, callback) {
    let allParams = {
      url: baseUrl + '/user/newUser/balance',
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
export { home }