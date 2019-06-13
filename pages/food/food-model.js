import { base } from '../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class food extends base {
    /* 获取餐品详情 */
    getFoodInfo(param, callback) {
            let allParams = {
                url: baseUrl + '/food/detail',
                type: 'get',
                data: param,
                sCallback: function(data) {
                    callback && callback(data);
                },
                eCallback: function() {}
            }
            this.requestWithCatch(allParams)
        }
        /* 获取评价列表 */
    getRatingsData(param, callback) {
        let allParams = {
            url: baseUrl + '/food/food/evaluates',
            type: 'get',
            data: param,
            sCallback: function(data) {
                callback && callback(data);
            },
            eCallback: function() {}
        }
        this.requestWithCatch(allParams)
    }

}
export { food }