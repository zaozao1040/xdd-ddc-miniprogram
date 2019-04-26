import { base } from '../../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class addfood extends base {

    goperateWithUrl(param, url, method, callback) {
        let allParams = {
            url: baseUrl + url,
            type: method,
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.request(allParams)
    }


    /* 加餐 */
    increaseFood(param, callback) {
        let allParams = {
            url: baseUrl + "/orgadmin/supplementary/increase",
            type: 'post',
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.request(allParams)
    }

}
export { addfood }