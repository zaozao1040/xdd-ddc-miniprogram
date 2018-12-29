// pages/mine/wallet/wallet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemStatusActiveFlag:true,
    moneyList:[[6,12,68],[108,218,318],[468,618,888]],
    itemMoneyActiveFlag:[0,2],//默认0行2列，也就是人民币68
    activeFlag1:undefined,
    activeFlag2:undefined,
    selectedMoney:undefined,
    explainDes:{
      one:'充值金额暂不支持跨平台使用',
      two:'充值金额可用于结算点餐金额，暂不支持退款、提现、转赠他人',
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
  recharge:function(){
    console.log(this.data.selectedMoney)
  }

})