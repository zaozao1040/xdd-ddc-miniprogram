import { Config } from 'config.js';
class base {
    constructor() {
        this.baseUrl = Config.baseUrl;
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
                'content-type': 'application/x-www-form-urlencoded',
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
                console.log(err);
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
    request2(params) {
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
                console.log(err);
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

export { base }