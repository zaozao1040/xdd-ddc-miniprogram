import { food } from './food-model.js'
let foodModel = new food()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemStatusActiveFlag:false,
    foodCode: undefined,
    foodInfo: {},
    btnFlag:'all',
    ratingsInfo: [],
    ratingsInfoAll:[],
    hasContentFlag: false,
    hasImgFlag:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    //获取后台数据
    let param = {
      //dateId:options.dateId
      dateId:16043//先调试
    }
    wx.showLoading({ 
      title: '加载中'
    })
    foodModel.getFoodInfo(param,(res)=>{
      console.log('获取后台数据（菜品详情）：',res)
      _this.data.foodCode = res.data.foodCode //存储下来，为了后面获取菜品的评价列表使用
      if(res.code === 0){
        wx.hideLoading() 
        _this.setData({
          foodInfo: res.data
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /* 获取评价列表 */
  getRatings:function(){
    let _this = this
    //获取后台数据
    let param = {
      //foodCode:_this.data.foodCode
      foodCode:2222//先调试
    }
    wx.showLoading({ 
      title: '加载中'
    })
    foodModel.getRatingsData(param,(res)=>{
      console.log('获取后台数据（评价详情）：',res)
      if(res.code === 0){
        wx.hideLoading() 
        _this.data.ratingsInfoAll = res.data //用于过滤
        _this.setData({
          ratingsInfo: res.data
        })
      }
    })
  },
  /* 切换标题 */
  changeItemStatusActiveFlag:function(e){
    let _this = this
    if(e.currentTarget.dataset.flag=='detail'){
      _this.setData({ 
        itemStatusActiveFlag: true
      })
    }else{
      _this.setData({ 
        itemStatusActiveFlag: false
      }) 
      _this.getRatings()  
    } 
  },
  /* 过滤 */
  getFilterList:function(){
    console.log('jj',this.data.btnFlag,this.data.hasContentFlag,this.data.hasImgFlag,)
    let _this = this
    let newRatingsInfo = []
    console.log(_this.data.ratingsInfoAll)
    _this.data.ratingsInfoAll.forEach(element => {
      //星级
      if(_this.data.btnFlag == 'all'){
        element.showFlag = true
      }
      if(_this.data.btnFlag == 'fivestar'){
        if(element.star == 5){
          element.showFlag = true
        }else{
          element.showFlag = false
        }
      }
      //内容
      if(_this.data.hasContentFlag == false){
        element.showFlag = true
      }
      if(_this.data.hasContentFlag == true){
        if(element.content){
          element.showFlag = true
        }else{
          element.showFlag = false
        }
      }
      //有图
      if(_this.data.hasImgFlag == false){
        element.showFlag = true
      }
      if(_this.data.hasImgFlag == true){
        if(element.images){
          element.showFlag = true
        }else{
          element.showFlag = false
        }
      }
/*       //最后根据这个showFlag判断该不该展示
      if(element.showFlag == true){
        newRatingsInfo.push(element)
      }
      _this.setData({ 
        ratingsInfo: newRatingsInfo
      }) */
    })
    console.log('4444',this.data.newRatingsInfo)
  },
  /* 切换评价标签 */
  changeBtnActiveFlag:function(e){
    if(e.currentTarget.dataset.flag=='all'){
      this.data.btnFlag = 'all'
      this.setData({ 
        btnFlag: 'all'
      })
      this.getFilterList()
    }else{
      this.data.btnFlag = 'fivestar'
      this.setData({ 
        btnFlag: 'fivestar'
      }) 
      this.getFilterList()  
    }
  },
  /* 切换 是否内容 标签 */
  changeHasContentFlag:function(){
    //this.data.hasContentFlag = !this.data.hasContentFlag
    this.setData({ 
      hasContentFlag: !this.data.hasContentFlag
    }) 
    this.getFilterList()
  },
  /* 切换 是否有图 标签 */
  changeHasImgFlag:function(){
    //this.data.hasImgFlag = !this.data.hasImgFlag
    this.setData({ 
      hasImgFlag: !this.data.hasImgFlag
    }) 
    this.getFilterList()
  },




})