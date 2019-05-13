import { base } from '../../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class phone extends base {
    /* 更换手机号 */
    changePhone(param, callback) {
        let allParams = {
            url: baseUrl + '/user/mobile',
            type: 'POST',
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.request(allParams)
    }
}
export { phone }