import { base } from '../../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class confirm extends base {
    /* 菜单提交 */
    commitConfirmMenuData(param, callback) {
            let allParams = {
                url: baseUrl + '/order/generateOrder',
                type: 'post',
                data: param,
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.request(allParams)
        }
        /* 从后台获取金额 */
    calculateOrderMoney(param, callback) {
        let allParams = {
            url: baseUrl + '/order/calc',
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
export { confirm }