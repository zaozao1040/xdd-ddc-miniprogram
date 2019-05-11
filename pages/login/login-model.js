import { base } from '../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class login extends base {
    /* 登录 */
    login(param, callback) {
            let allParams = {
                url: baseUrl + '/login/wechatLogin',
                type: 'POST',
                data: param,
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 绑定企业 */
    bindOrganize(param, callback) {
            let allParams = {
                url: baseUrl + '/user/organize',
                type: 'POST',
                data: param,
                sCallback: function(data) { callback && callback(data) },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 获取企业列表- 根据经纬度 */
    getOrganizeListByLocation(url, param, callback) {
        let allParams = {
            url: baseUrl + url,
            type: 'GET',
            data: param,
            sCallback: function(data) { callback && callback(data) },
            eCallback: function() {}
        }
        this.request(allParams)
    }
}
export { login }