class base {
  request(params) {
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
            'content-type': 'application/json'
        },
        success: function(res) {
          if(res.data.code==1001){
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


  requestWithCatch(params,cacheTime) {
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
          if(res.data.code==1001){
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