import { base } from '../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class mine extends base {
    /* 获取我的参数 */
    getMineData(param, callback) {
            let allParams = {
                url: baseUrl + '/login/refreshUser',
                type: 'POST',
                data: param,
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 获取我的参数 */
    getUserInfo(url, param, callback) {
            let allParams = {
                url: baseUrl + url,
                type: 'GET',
                data: param,
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 获取短信验证码 */
    getVerificationCode(param, callback) {
            let allParams = {
                url: baseUrl + '/utils/phone/verify',
                type: 'POST',
                data: param,
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 获取企业列表- 根据经纬度 */
    getOrganizeListByLocation(param, callback) {
            let allParams = {
                url: baseUrl + '/organize/organizes/longAndLat',
                type: 'GET',
                data: param,
                sCallback: function(data) { callback && callback(data) },
                eCallback: function() {}
            }
            this.requestWithCatch(allParams)
        }
        /* 获取客服电话 */
    getServicePhoneData(param, callback) {
        let allParams = {
            url: baseUrl + '/help/help',
            type: 'GET',
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.requestWithCatch(allParams)
    }


    /* 切换为为管理员，切换为普通用户*/
    changeUserRole(param, callback) {
        let allParams = {
            url: baseUrl + '/user/orgadmin',
            type: 'POST',
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.requestWithCatch(allParams)
    }
}
export { mine }