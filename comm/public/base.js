class base {
  request(params) {
/*     var app = getApp(); */
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
/*   _processError(err) {
    if (typeof err.data.msg == undefined) {
        return;
    }
    if (err.data.msg) {
        wx.showToast({
            title: err.data.msg,
            icon: 'none',
            duration: 1500,
            mask: true
        });
    }
    return;
  } */
}
export {
  base
}