import { base } from '../../../comm/public/base'
const app = getApp()
const baseUrl = app.globalData.baseUrl
class menu extends base {

    getAddfoodData(param, callback, anotherCallback) {
        let allParams = {
            url: baseUrl + '/extra/foods',
            type: 'get',
            data: param,
            sCallback: function(res) {
                console.log('收到请求(加餐所有信息):', baseUrl)
                console.log('收到请求(加餐所有信息):', res)
                wx.hideLoading()
                if (res.code === 0) {
                    callback(res.data)
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        duration: 2000
                    })
                    anotherCallback()
                }
            },
            eCallback: function() {}
        }

        this.request(allParams)
    }


}
export { menu }