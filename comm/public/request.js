const baseUrl = getApp().globalData.baseUrl

class base {
    request(params, sCallback) {
        wx.request({
            url: baseUrl + params.url,
            data: params.data || {}, //这个是不是可以传null或者undefined？
            method: params.method || 'GET',
            header: {
                'content-type': 'application/json'
            },
            success: result => {
                let { data, code } = result.data
                    // 成功
                if (code == 200) {
                    sCallback && sCallback(data);
                } else if (code == 1001) {
                    //清除缓存，同时：
                    //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
                    wx.removeStorageSync('userInfo')
                    wx.reLaunch({
                        url: '/pages/home/home',
                    })
                }

            },
            fail: error => {
                console.log(error)
            }
        });
    }

    // 获取用户信息
    getUserInfo() {
        let { userInfo, time } = wx.getStorageSync('userInfo')
            // 如果上次获取时间超过30分钟，就再次拉取
        let duration = ((new Date()).getTime() - time.getTime()) / 60000 > 30
        if (duration) {
            let param = {
                url: 'user/getUserInfo?userCode=' + wx.getStorageSync('userCode')
            }
            this.request(param, data => {
                let userInfo = {}
                userInfo.userInfo = data
                userInfo.time = new Date()
                wx.setStorageSync('userInfo', userInfo)
            })
            return data
        } else {
            return userInfo
        }
    }

    requestWithCatch(params, cacheTime) {
        var that = this
        var url = params.url;
        if (!params.type) {
            params.type = 'get';
        }
        wx.request({
            url: url,
            data: params.data,
            method: params.type,
            header: {
                'content-type': 'application/json',
                'cache-control': 'max-age=300' //缓存五分钟
            },
            success: function(res) {
                if (res.data.code == 1001) {
                    //清除缓存，同时：
                    //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
                    wx.removeStorageSync('userInfo')
                    wx.reLaunch({
                        url: '/pages/home/home',
                    })
                }
                params.sCallback && params.sCallback(res.data);
            },
            fail: function(err) {
                //console.log(err)
                //that._processError(err);
            }
        });
    }
}
export {
    base
}