import { Config } from 'config.js';
class boxBase {
    constructor() {
        this.baseUrl = Config.boxBaseUrl;
    }

    request(params) {
        var that = this,
            url = this.baseUrl + params.url;
        if (!params.type) {
            params.type = 'get';
        }
        wx.request({
            url: url,
            data: params.data,
            method: params.type,
            header: {
                'content-type': 'application/json',
            },
            success: function(res) {
                var code = res.statusCode.toString();
                var startChar = code.charAt(0);
                if (startChar == '2') {
                    params.sCallback && params.sCallback(res.data);
                } else {
                    that._processError(res);
                    params.eCallback && params.eCallback(res.data);
                }
            },
            fail: function(err) {
                wx.showToast({
                    title: '网络异常',
                    icon: 'none',
                    duration: 1500,
                    mask: true
                });
                return;
            }
        });
    }

    requestPromise(params) {
        var posmise = new Promise((resolve, reject) => {
            let url = this.baseUrl + params.url;
            let data = params.data;
            let method = params.type;
            let _this = this;
            wx.request({
                url: url,
                data: data,
                method: method,
                header: {
                    'content-type': 'application/json'
                },
                success: function(res) {
                    if (res.data.code == 0) {
                        resolve(res.data.data);
                    }
                },
                fail: function(err) {
                    reject(err);
                }
            });
        })
        return posmise;
    }

    _processError(err) {
        if (err.data.msg) {
            wx.showToast({
                title: err.data.msg,
                icon: 'none',
                duration: 1500,
                mask: true
            });
        }
        return;
    }


}

export { boxBase }