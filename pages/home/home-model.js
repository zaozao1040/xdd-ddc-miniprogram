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
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 获取轮播图 */
    getSwiperList(param, callback) {
        let allParams = {
            url: baseUrl + '/home/banner',
            type: 'GET',
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.requestWithCatch(allParams)
    }
    getImages(param, callback) {
            let allParams = {
                url: baseUrl + '/home/banner',
                type: 'GET',
                data: param,
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.requestWithCatch(allParams)
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
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 获取首页取餐信息 */
    getTakeMealInfo(param, callback) {
        let allParams = {
            url: baseUrl + '/home/orders',
            type: 'get',
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.request(allParams)
    }


    // 获取后台公告信息
    getNotice(param, callback) {
        let allParams = {
                url: baseUrl + '/home/notice',
                type: 'get',
                data: param,
                sCallback: function(res) {
                    callback && callback(res);

                },
                eCallback: function() {}
            }
            /* 发送请求到后端 */
        this.request(allParams)
    }

}
export { home }