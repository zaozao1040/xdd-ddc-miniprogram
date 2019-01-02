import { wallet } from './wallet-model.js'
let walletModel = new wallet()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    canClick:true,
    itemStatusActiveFlag:true,
    moneyList:[[6,12,68],[108,218,318],[468,618,888]],
    itemMoneyActiveFlag:[0,2],//默认0行2列，也就是人民币68
    activeFlag1:undefined,
    activeFlag2:undefined,
    selectedMoney:undefined,
    explainDes:{
      one:'充值金额暂不支持跨平台使用，暂不支持退款、提现、转赠他人',
      two:'若充值遇到问题请联系1855748732',
      three:'若充值遇到问题请联系1855748732',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  changeItemStatusActiveFlag:function(e){
    if(e.currentTarget.dataset.flag=='chongzhi'){
      this.setData({ 
        itemStatusActiveFlag: true
      })
    }else{
      this.setData({ 
        itemStatusActiveFlag: false
      })   
    } 
  },
  changeMoneyActiveFlag:function(e){
    this.setData({ 
      activeFlag1: e.currentTarget.dataset.activeflag1
    })
    this.setData({ 
      activeFlag2: e.currentTarget.dataset.activeflag2
    })
    this.setData({ 
      selectedMoney: e.currentTarget.dataset.selectedmoney
    })
  },
  handleRecharge:function(){
    console.log(this.data.selectedMoney)
  },
  handleRecharge:function(){
/*     let _this = this
    if (_this.data.selectedMoney){
      wx.showToast({
        title: "请选择充值金额",
        icon: "none",
        duration: 2000
      })
    }else{
      if(!_this.data.canClick){
        return
      }
      _this.data.canClick = false
      wx.showLoading({ 
        title: '添加中',
        mask: true
      })
      let param = {
        userCode: wx.getStorageSync('userInfo').userCode, 
        rechargeMoney: _this.data.selectedMoney
      }
      _this.setData({ //【防止狂点1】
        loading: true
      })
      wx.showLoading({ //【防止狂点2】
        title: '加载中',
        mask: true
      })
      walletModel.recharge(param,(res)=>{
        console.log('收到请求(充值):',res)
        if(res.code === 0){
          let tmp_userInfo = wx.getStorageSync('userInfo')
          tmp_userInfo.phoneNumber = _this.data.phone
          wx.setStorageSync('userInfo', tmp_userInfo)
          setTimeout(function(){ //提示修改手机号成功，两秒后跳转到’我的‘
            wx.switchTab({
              url: '/pages/mine/mine',
            })
            wx.hideLoading() //【防止狂点3】
            wx.showToast({
              title: '手机更换成功',
              icon: 'success',
              duration: 2000
            })
          },2000) 
        }else{
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })  
          _this.setData({
            loading: false
          })
        }
      })
    


    } */
  }, 
})