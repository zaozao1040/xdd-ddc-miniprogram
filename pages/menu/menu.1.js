// pages/time/time.js
import moment from "../../comm/script/moment"
import { menu } from './menu-model.js'
let menuModel = new menu()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top_0: 0,
    top_1: 0,
    top_2: 0,
    windowHeight: 0,
    timeActiveFlag:0, //默认今天
    foodtypeActiveFlag:1, //默认午餐
    menutypeActiveFlag:0, 
    boxActiveFlag: false,//默认关闭
    //四个重要的数据
    selectedFoods:[],
    cacheMenuDataAll:[[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]], //7行4列数组，用于存所有选中的数据---当前所有数据
    totalMoney: 0,
    totalCount:0,
    
    mapMenutype: ['早餐','午餐','晚餐','夜宵'],
    mapMenutypeIconName: ['zaocan1','wucan','canting','xiaoye-'],
    timeInfo: [{
      year:moment().format('YYYY'),
      month:moment().format('MM'),
      day:moment().format('DD'),
    },{
      year:moment().add(1,'day').format('YYYY'),
      month:moment().add(1,'day').format('MM'),
      day:moment().add(1,'day').format('DD'),
    },{
      year:moment().add(2,'day').format('YYYY'),
      month:moment().add(2,'day').format('MM'),
      day:moment().add(2,'day').format('DD'),
    },{
      year:moment().add(13,'day').format('YYYY'),
      month:moment().add(13,'day').format('MM'),
      day:moment().add(13,'day').format('DD'),
    },{
      year:moment().add(4,'day').format('YYYY'),
      month:moment().add(4,'day').format('MM'),
      day:moment().add(4,'day').format('DD'),
    },{
      year:moment().add(5,'day').format('YYYY'),
      month:moment().add(5,'day').format('MM'),
      day:moment().add(5,'day').format('DD'),
    },{
      year:moment().add(6,'day').format('YYYY'),
      month:moment().add(6,'day').format('MM'),
      day:moment().add(6,'day').format('DD'),
    }],
    scrollToView: 'id_0',
    listHeight: [], //这个数组记录每个餐类的"之前所有餐类描述+所有具体餐品"的占用高度值
    timer: null
  },
  getMenuDataByCache: function(){  //setData设置menuData为缓存数据，这样可以同步到模板渲染
    //console.log('cacheMenuDataAll',this.data.cacheMenuDataAll)
    let that = this
    let tmp = that.data.cacheMenuDataAll[that.data.timeActiveFlag][that.data.foodtypeActiveFlag]
    if(tmp!=null){
      that.setData({
        menuData: tmp
      })      
    }else{
      that.getMenuDataByResponse()
    }
  },
  handleChangeTimeActive: function(e){
    this.setData({
      timeActiveFlag: e.currentTarget.dataset.timeindex
    })
    this.getMenuDataByCache()
  },
  handleChangeFoodtypeActive: function(e){
    this.setData({
      foodtypeActiveFlag: e.currentTarget.dataset.foodtypeindex
    })
    this.getMenuDataByCache()
  },
  handleChangeMenutypeActive: function(e){
    this.setData({
      menutypeActiveFlag: e.currentTarget.dataset.menutypeindex,
      scrollToView: 'order' + e.currentTarget.dataset.menutypeindex,
    })
    //console.log(this.data.scrollToView)
  },
  selectedFoodsAdd: function(e){
    let that = this
    var selectedFoods = that.data.selectedFoods 
    var a_selectedFoods = {
      day: e.currentTarget.dataset.day,
      dayInfo: [{
        foodType: e.currentTarget.dataset.foodtype,
        foodTypeInfo:[{
          food_id: e.currentTarget.dataset.foodid,
          food_price:  e.currentTarget.dataset.foodprice,
          food_total_price: e.currentTarget.dataset.foodprice,//这个总价实在是因为微信小程序模板中不识别parseFloat，只能这里转换
          food_name:  e.currentTarget.dataset.foodname,
          food_picpath: e.currentTarget.dataset.picpath,
          __food_index: e.currentTarget.dataset.foodindex,
          __menutype_index: e.currentTarget.dataset.menutypeindex,
          food_count: 1
        }]
      }]
    }
    var tmp_length = 0
    if(selectedFoods==''){
      selectedFoods.push(a_selectedFoods)
    }else{ 
      tmp_length = selectedFoods.length //缓存length，提升性能
      for(var i=0;i<tmp_length;i++){
        if(selectedFoods[i].day == e.currentTarget.dataset.day){
        //if(selectedFoods[i].day == that.data.timeActiveFlag){
          tmp_length = selectedFoods[i].dayInfo.length //缓存length，提升性能
          for(var j=0;j<tmp_length;j++){
            //if(selectedFoods[i].dayInfo[j].foodType == that.data.foodtypeActiveFlag){  //-----这里出过问题，
            if(selectedFoods[i].dayInfo[j].foodType == e.currentTarget.dataset.foodtype){
              tmp_length = selectedFoods[i].dayInfo[j].foodTypeInfo.length  //缓存length，提升性能
              for(var k=0;k<tmp_length;k++){
                console.log(tmp_length)
                if(selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_id == e.currentTarget.dataset.foodid){
                  selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_count++ //这种情况直接 计数器+1
                  selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_total_price = (parseFloat(selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_total_price) + parseFloat(selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_price)).toFixed(2)
                  k= tmp_length //跳出循环，提升性能
                }else{
                  if(k == tmp_length-1){  //便利到最后一个了，还没有相等的，就push进这个新的
                    selectedFoods[i].dayInfo[j].foodTypeInfo.push({
                      food_id: e.currentTarget.dataset.foodid,
                      food_price:  e.currentTarget.dataset.foodprice,
                      food_total_price: e.currentTarget.dataset.foodprice,
                      food_name:  e.currentTarget.dataset.foodname,
                      food_picpath: e.currentTarget.dataset.picpath,
                      __food_index: e.currentTarget.dataset.foodindex,
                      __menutype_index: e.currentTarget.dataset.menutypeindex,
                      food_count: 1
                    })
                  }
                }
              }
              j= tmp_length //跳出循环
            }else{
              if(j == tmp_length-1){   //便利到最后一个了，还没有相等的，就push进这个新的
                selectedFoods[i].dayInfo.push({
                  foodType: e.currentTarget.dataset.foodtype,
                  foodTypeInfo:[{
                    food_id: e.currentTarget.dataset.foodid,
                    food_price:  e.currentTarget.dataset.foodprice,
                    food_total_price: e.currentTarget.dataset.foodprice,
                    food_name:  e.currentTarget.dataset.foodname,
                    food_picpath: e.currentTarget.dataset.picpath,
                    __food_index: e.currentTarget.dataset.foodindex,
                    __menutype_index: e.currentTarget.dataset.menutypeindex,
                    food_count: 1
                  }]
                })                
              }

            }
          }
          i= tmp_length //跳出循环
        }else{
          if(i == tmp_length-1){   //便利到最后一个了，还没有相等的，就push进这个新的
            selectedFoods.push({
              day: e.currentTarget.dataset.day,
              dayInfo: [{
                foodType: e.currentTarget.dataset.foodtype,
                foodTypeInfo:[{
                  food_id: e.currentTarget.dataset.foodid,
                  food_price:  e.currentTarget.dataset.foodprice,
                  food_total_price: e.currentTarget.dataset.foodprice,
                  food_name:  e.currentTarget.dataset.foodname,
                  food_picpath: e.currentTarget.dataset.picpath,
                  __food_index: e.currentTarget.dataset.foodindex,
                  __menutype_index: e.currentTarget.dataset.menutypeindex,
                  food_count: 1
                }]
              }]
            })         
          }
        }
      }
    }
    app.globalData.selectedFoods = selectedFoods //全局更新
    this.setData({   //添加或减少结束后，setData一定要把全局的赋给他
      selectedFoods : app.globalData.selectedFoods
    })
    console.log('全局selectedFoods:',app.globalData.selectedFoods)
    //console.log('selectedFoods:',JSON.stringify(this.data.selectedFoods))
  },

  selectedFoodsMinus: function(e){
    let that = this
    var selectedFoods = that.data.selectedFoods 
    var tmp_length = selectedFoods.length //缓存length，提升性能
    for(var i=0;i<tmp_length;i++){
      if(selectedFoods[i].day == e.currentTarget.dataset.day){
        tmp_length = selectedFoods[i].dayInfo.length //缓存length，提升性能
        for(var j=0;j<tmp_length;j++){
          if(selectedFoods[i].dayInfo[j].foodType == e.currentTarget.dataset.foodtype){
            tmp_length = selectedFoods[i].dayInfo[j].foodTypeInfo.length  //缓存length，提升性能
            for(var k=0;k<tmp_length;k++){
              if(selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_id == e.currentTarget.dataset.foodid){
                selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_count-- //这种情况直接 计数器-1
                selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_total_price = (parseFloat(selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_total_price) - parseFloat(selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_price)).toFixed(2)
                if(selectedFoods[i].dayInfo[j].foodTypeInfo[k].food_count == 0){ //如果count降到0 则直接删掉这个结构
                  selectedFoods[i].dayInfo[j].foodTypeInfo.splice(k,1)
                  //console.log('selectedFoods[i].dayInfo[j].foodTypeInfo',selectedFoods[i].dayInfo[j].foodTypeInfo)
                  if(selectedFoods[i].dayInfo[j].foodTypeInfo.length==0){
                    selectedFoods[i].dayInfo.splice(j,1)
                    //console.log('selectedFoods[i].dayInfo',selectedFoods[i].dayInfo)
                    if(selectedFoods[i].dayInfo.length==0){
                      selectedFoods.splice(i,1)
                      //console.log('selectedFoods',selectedFoods)
                    }
                  }
                }
                k= tmp_length //跳出循环，提升性能
              }
            }
            j= tmp_length //跳出循环
          }
        }
        i= tmp_length //跳出循环
      }
    }
    app.globalData.selectedFoods = selectedFoods //全局更新
    this.setData({   //添加或减少结束后，setData一定要把全局的赋给他
      selectedFoods : app.globalData.selectedFoods
    })
    console.log('----',app.globalData.selectedFoods)
  },

  handleAddfood: function(e){
    let that = this
    /* **********模板数字响应式 + 存储下来点击的具体餐品的下标以及对应类别下标********** */
    let menutypeIndex = e.currentTarget.dataset.menutypeindex
    let foodIndex = e.currentTarget.dataset.foodindex 
    let tmp_menuData = that.data.cacheMenuDataAll[e.currentTarget.dataset.day][e.currentTarget.dataset.foodtype] //一、这个数据结构是为了数字响应式显示
    if(!tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].food_count){
      tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].food_count = 1
    }else{
      tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].food_count ++
    }
    tmp_menuData.day = e.currentTarget.dataset.day  //这两行是为了更新这个临时menuData的day和foodType
    tmp_menuData.foodType = e.currentTarget.dataset.foodtype
    tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].__food_index = foodIndex  //这两行是为了存储两个下标
    tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].__menutype_index = menutypeIndex

    console.log('e:',e.currentTarget.dataset)
    console.log('e menuData:',this.data.menuData)
    /* **********cache大数组更新********** */
    let tmp_cacheMenuDataAll = that.data.cacheMenuDataAll
    tmp_cacheMenuDataAll[e.currentTarget.dataset.day][e.currentTarget.dataset.foodtype]= tmp_menuData
    app.globalData.cacheMenuDataAll = tmp_cacheMenuDataAll //全局更新
    that.setData({   //添加或减少结束后，setData一定要把全局的赋给他
      cacheMenuDataAll : app.globalData.cacheMenuDataAll
    })
    console.log('全局大数组cacheMenuDataAll:',app.globalData.cacheMenuDataAll)
    /* **********购物车响应式********** */
    //console.log('eeeeee',e.currentTarget.dataset)
    that.selectedFoodsAdd(e)
    //总计数
    app.globalData.totalCount = app.globalData.totalCount + 1
    that.setData({  
      totalCount : app.globalData.totalCount
    })
    //总价格
    app.globalData.totalMoney = (parseFloat(app.globalData.totalMoney) + parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2)
    that.setData({  
      totalMoney : app.globalData.totalMoney 
    })
    
  },
  handleMinusfood: function(e){
    let that = this
    /* **********数字响应式********** */
    let menutypeIndex = e.currentTarget.dataset.menutypeindex
    let foodIndex = e.currentTarget.dataset.foodindex
    let tmp_menuData = that.data.cacheMenuDataAll[e.currentTarget.dataset.day][e.currentTarget.dataset.foodtype] //一、这个数据结构是为了数字响应式显示
    if(tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].food_count>0){
      tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].food_count --
    }else{
      tmp_menuData.foodList[menutypeIndex].food_date[foodIndex].food_count = 0
    }
    /* **********cache大数组更新********** */
    let tmp_cacheMenuDataAll = that.data.cacheMenuDataAll
    tmp_cacheMenuDataAll[1][1]= tmp_menuData
    app.globalData.cacheMenuDataAll = tmp_cacheMenuDataAll //全局更新
    that.setData({   //添加或减少结束后，setData一定要把全局的赋给他
      cacheMenuDataAll : app.globalData.cacheMenuDataAll
    })
    console.log('大数组cacheMenuDataAll:',that.data.cacheMenuDataAll)
    /* **********购物车响应式********** */
    that.selectedFoodsMinus(e)  
    //总计数
    app.globalData.totalCount = app.globalData.totalCount - 1
    that.setData({  
      totalCount : app.globalData.totalCount
    })
    //总价格
    app.globalData.totalMoney = (parseFloat(app.globalData.totalMoney) - parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2)
    that.setData({  
      totalMoney : app.globalData.totalMoney 
    })
  },
  handleClickBox: function(){
    let that = this
    that.setData({
      boxActiveFlag: !that.data.boxActiveFlag
    })
    if(that.data.boxActiveFlag == true){ //获取计算购物车的scroll的高度所必须的参数top_1 top_2
      const query_1 = wx.createSelectorQuery()
      query_1.select('.c_scrollPosition_1_forCalculate').boundingClientRect()
      query_1.selectViewport().scrollOffset()
      query_1.exec(function (res) {
        console.log('yy',res)
        that.setData({
          top_1: res[0].height // #the-id节点的占用高度
        })
      })
    }
  },
  initMenu: function(){
    let that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    const query_0 = wx.createSelectorQuery()
    query_0.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query_0.selectViewport().scrollOffset()
    query_0.exec(function (res) {
      that.setData({
        top_0: res[0].top // #the-id节点的占用高度
      })
      console.log('top_0',that.data.top_0)
    })
    const query_2 = wx.createSelectorQuery()
    query_2.select('.c_scrollPosition_2_forCalculate').boundingClientRect()
    query_2.selectViewport().scrollOffset()
    query_2.exec(function (res) {
      that.setData({
        top_2: res[0].top // #the-id节点的上边界坐标
      })
      console.log('top_2',that.data.top_2)
    })
  },
  getMenuDataByResponse: function(){
    let that = this
    //获取后台数据
    let param = {
      timeActiveFlag:that.data.timeActiveFlag,
      foodtypeActiveFlag:that.data.foodtypeActiveFlag,
    }
    menuModel.getMenuData(param,(res)=>{
      let resData = res.data
      resData.day = parseInt(that.data.timeActiveFlag)  //新增加的两项，加上后面会出现的food_count，一共新增加三项
      resData.foodType = parseInt(that.data.foodtypeActiveFlag)

      let tmp_cacheMenuDataAll = that.data.cacheMenuDataAll
      tmp_cacheMenuDataAll[that.data.timeActiveFlag][that.data.foodtypeActiveFlag]= resData
      that.setData({   
        cacheMenuDataAll : tmp_cacheMenuDataAll
      })
      that.calculateHeight()
    })
  },
  handleClearFoods: function(){
    let that = this
    that.setData({   
      selectedFoods : [],
      totalCount: 0,
      totalMoney: 0,
    })
    that.getMenuDataByResponse() //重新请求是为了清空数据中的各种food_count
    setTimeout(function(){
      that.setData({   
        boxActiveFlag : !that.data.boxActiveFlag
      })
    },1000)
  },
  handleScroll: function(e){
    let that = this
    if (that.data.timer){
      clearTimeout(that.data.timer)
    }
    that.data.timer = setTimeout(()=>{
      let scrollY = e.detail.scrollTop
      //console.log(e.detail.scrollTop)
      let listHeightLength = that.data.listHeight.length
      for (let i = 0; i < listHeightLength; i++) {
        let height1 = that.data.listHeight[i]
        let height2 = that.data.listHeight[i + 1];//listHeight[length]返回undefined,所以可以用!height2做判断不是最后一个
        if (scrollY >= height1 && scrollY < height2) {    
          console.log('当前menutypeIndex是：',i)
          if(i!=that.data.menutypeActiveFlag){
            that.setData({   
              menutypeActiveFlag : i+1
            }) 
          }
        }
      }
    },50)
  },
  calculateHeight: function () {
    let that = this
    let tmp_listHeight = [0] //首元素置为0 下面的循环次数为 rect.length-1 就能保证不会多出一次
    let totalHeight = 0
    wx.createSelectorQuery().selectAll('.c_foodPosition_forCalculate').boundingClientRect(function (rect) {
      for (let i = 0; i< rect.length-1; i++){
        totalHeight = totalHeight + rect[i].height
        tmp_listHeight.push(totalHeight)
      }
      that.setData({   
        listHeight : tmp_listHeight
      })
      console.log('listHeight:',that.data.listHeight)
    }).exec() 
    
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    //初始化，获取一些必要参数，如高度
    that.initMenu()
    console.log('~~~~',app.globalData.cacheMenuDataAll[that.data.timeActiveFlag][that.data.foodtypeActiveFlag])
    if(app.globalData.cacheMenuDataAll[that.data.timeActiveFlag][that.data.foodtypeActiveFlag]){
      that.setData({   
        cacheMenuDataAll : app.globalData.cacheMenuDataAll,
        selectedFoods : app.globalData.selectedFoods
      })
    }else{
      that.getMenuDataByResponse() //获取后台数据并setData响应式模板
    }
    if(app.globalData.totalCount){
      that.setData({   
        totalCount : app.globalData.totalCount
      })
    }
    if(app.globalData.totalMoney){
      that.setData({   
        totalMoney : app.globalData.totalMoney
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
/*     console.log('1111122222全局selectedFoods:',app.globalData.selectedFoods)
    console.log('3333344444全局大数组cacheMenuDataAll:',app.globalData.cacheMenuDataAll)
    console.log('woyaode大数组cacheMenuDataAll:',this.data.cacheMenuDataAll) */
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})