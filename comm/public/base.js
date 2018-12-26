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