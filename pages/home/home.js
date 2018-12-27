import { home } from '../home/home-model.js'
let homeModel = new home()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    registered: false,
    userInfo:null,
    swiperInfo: null,
    promotionInfo: null,
    wel: "",
    propagandaList: ['比外卖便宜','全程保温','食品更安全','急速退款'],
    propagandaIconArr:['bianyihuo2','peisong','shipinanquan-','tuikuan'],
  },
  initHome:function(){
    let _this = this
    /* **********设置轮播图数据********** */
    this.setData({
      swiperInfo: [{
        url: 'https://img.4008823823.com.cn/kfcios/Banner/Banner_1_c80749057bfc4ad68d06af90bb809d25.jpg'
      }, {
        url: 'https://img.4008823823.com.cn/kfcios/Banner/Banner_1_d1c9737fad7d42df8b593bb7ae696e7c.jpg'
      }, {
        url: 'https://img.4008823823.com.cn/kfcios/Banner/Banner_1_c6e80bd6dbc5420b886937f217efc40d.jpg'
      }],
      promotionInfo: [{
        url: 'https://fuss10.elemecdn.com/d/d4/16ff085900d62b8d60fa7e9c6b65dpng.png?imageMogr/format/webp/thumbnail/!240x160r/gravity/Center/crop/240x160/'
      }, {
          url: 'https://fuss10.elemecdn.com/b/e1/0fa0ed514c093a7138b0b9a50d61fpng.png?imageMogr/format/webp/thumbnail/!240x160r/gravity/Center/crop/240x160/'
      }]
    })
    /* **********设置欢迎时间********** */
    var t = new Date().getHours();
    t >= 6 && t < 11 ? this.setData({
      wel: "早上好"
    }) : t >= 11 && t < 13 ? this.setData({
      wel: "中午好"
    }) : t >= 13 && t < 18 ? this.setData({
      wel: "下午好"
    }) : this.setData({
      wel: "晚上好"
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */

  onLoad: function (options) {
    this.initHome()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    /* **********判断是否已注册********** */
    wx.login({
      success: function(res){
        if(res.code){
          let param = {
            code: res.code   
          }
          homeModel.getRegisteredFlag(param,(res)=>{
            console.log('是否已注册:',res)
            if(res.code === 0){
              if(res.data === true){
                _this.setData({
                  registered:true
                })
                //既然已经注册，就直接自动登录，即从缓存读信息
                let tmp_userInfo = wx.getStorageSync('userInfo')
                _this.setData({
                  userInfo:tmp_userInfo
                })
              }
            }
          })
        }
      }
    })
  },

  logout:function(){
    wx.removeStorageSync('userInfo')
    wx.navigateTo({
      url: '/pages/login/login',
    })
    wx.showToast({
      title: '注销成功',
      icon: 'success',
      duration: 2000
    })
  }


})