import moment from "../../comm/script/moment"
import { food } from './food-model.js'
let foodModel = new food()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    canClick: true,
    listCanGet: true,
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 20, // 每页条数
    hasMoreDataFlag: true,//是否还有更多数据  默认还有
    itemStatusActiveFlag: true,
    //
    windowHeight: 0,
    scrollTop: 0,
    //
    foodCode: undefined,
    foodInfo: {},
    btnFlag: 'all',
    ratingsInfoList: [],
    ratingsListNoResult: false,
    ratingsInfoListAll: [],
    hasContentFlag: false,
    hasImgFlag: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      dateId: options.dateId
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    //获取后台数据
    let param = {
      dateId: _this.data.dateId
    }
    wx.showLoading({
      title: '加载中'
    })
    foodModel.getFoodInfo(param, (res) => {
      console.log('获取后台数据（菜品详情）：', res)
      _this.data.foodCode = res.data.foodCode //存储下来，为了后面获取菜品的评价列表使用
      if (res.code === 0) {
        wx.hideLoading()
        _this.setData({
          foodInfo: res.data
        })
      }
    })
  },
  initRatings: function () {
    let _this = this
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    const query = wx.createSelectorQuery()
    query.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].top // #the-id节点的上边界坐标
      })
    })
  },
  /* 获取评价列表 */
  getRatings: function () {
    let _this = this
    if (!_this.data.listCanGet) {
      return
    }
    _this.data.listCanGet = false
    //获取后台数据
    let param = {
      foodCode: _this.data.foodCode,
      page: _this.data.page,
      limit: _this.data.limit,
    }
    wx.showLoading({
      title: '加载中'
    })
    foodModel.getRatingsData(param, (res) => {
      console.log('获取后台数据（评价详情）：', res)
      wx.hideLoading()
      if (res.code === 0) {
        let tmp_ratingsInfoList = res.data
        tmp_ratingsInfoList.forEach(element => {
          element.evaluateTime = moment(element.evaluateTime).format('YYYY-MM-DD HH:mm:ss')
        })
        //下面开始分页
        if (tmp_ratingsInfoList.length < _this.data.limit) {
          if (tmp_ratingsInfoList.length === 0) {
            wx.showToast({
              image: '../../images/msg/warning.png',
              title: '没有更多数据'
            })
            _this.setData({
              hasMoreDataFlag: false
            })
          } else {
            _this.setData({
              ratingsInfoList: _this.data.ratingsInfoList.concat(tmp_ratingsInfoList), //concat是拆开数组参数，一个元素一个元素地加进去
              hasMoreDataFlag: false
            })
          }
        } else {
          console.log(_this.data.ratingsInfoList)
          _this.setData({
            ratingsInfoList: _this.data.ratingsInfoList.concat(tmp_ratingsInfoList), //concat是拆开数组参数，一个元素一个元素地加进去
            hasMoreDataFlag: true,
            page: _this.data.page + 1
          })
        }
      }
    })
  },
  /* 切换标题 */
  changeItemStatusActiveFlag: function (e) {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    setTimeout(function () {
      _this.data.canClick = true
    }, 500)
    if (e.currentTarget.dataset.flag == 'detail') {
      _this.setData({
        itemStatusActiveFlag: true
      })
    } else if(e.currentTarget.dataset.flag == 'ratings') {
      _this.setData({
        itemStatusActiveFlag: false
      })
      _this.initRatings()
      _this.getRatings() //获取该food的评论列表
    } else {}

  },
  /* 过滤 */
  /*  getFilterList:function(){
     console.log('jj',this.data.btnFlag,this.data.hasContentFlag,this.data.hasImgFlag,)
     let _this = this
     let newratingsInfoList = []
     console.log(_this.data.ratingsInfoListAll)
     let tmp_ratingsInfoListAll = _this.data.ratingsInfoListAll
     tmp_ratingsInfoListAll.forEach(element => {
       //星级
       if(_this.data.btnFlag == 'all'){
         element.showFlag1 = true
       }else{
         if(element.star == 5){
           console.log('55555')
           element.showFlag1 = true
         }else{
           console.log('66666')
           element.showFlag = false
         }        
       }
       //内容
       if(_this.data.hasContentFlag == false){
         element.showFlag = true
       }else{
         if(element.content){
           element.showFlag = true
         }else{
           element.showFlag = false
         }        
       }
       //有图
       if(_this.data.hasImgFlag == false){
         element.showFlag = true
       }else{
         if(element.images){
           element.showFlag = true
         }else{
           element.showFlag = false
         }        
       }
       //最后根据这个showFlag判断该不该展示
       if(element.showFlag == true){
         newratingsInfoList.push(element)
       }
       _this.setData({ 
         ratingsInfoList: newratingsInfoList
       })
     })
     console.log('4444',tmp_ratingsInfoListAll)
   }, */
  /* 切换评价标签 */
  changeBtnActiveFlag: function (e) {
    if (e.currentTarget.dataset.flag == 'all') {
      this.data.btnFlag = 'all'
      this.setData({
        btnFlag: 'all'
      })
      //this.getFilterList()
    } else {
      this.data.btnFlag = 'fivestar'
      this.setData({
        btnFlag: 'fivestar'
      })
      //this.getFilterList()  
    }
  },
  /* 切换 是否内容 标签 */
  changeHasContentFlag: function () {
    //this.data.hasContentFlag = !this.data.hasContentFlag
    this.setData({
      hasContentFlag: !this.data.hasContentFlag
    })
    //this.getFilterList()
  },
  /* 切换 是否有图 标签 */
  changeHasImgFlag: function () {
    //this.data.hasImgFlag = !this.data.hasImgFlag
    this.setData({
      hasImgFlag: !this.data.hasImgFlag
    })
    //this.getFilterList()
  },




})