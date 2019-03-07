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
    timeInfo: [],
    top_0: 0,
    top_1: 0,
    top_2: 0,
    /*     height_2: 0, */
    height_3: 0,
    windowHeight: 0,
    /* 这六个变量存储查询参数 */
    timeActiveFlag: 0, //默认今天
    timeDesActive: '', //选中的日期描述，如‘2018-12-22’
    timeWeakDesActive: '',//选中的星期几描述，如'星期五'
    foodtypeActiveFlag: 1, //默认餐别是该用户所在企业拥有餐标数组中的第一个
    foodtypeDesActive: '', //选中的餐别描述，如‘LUNCH’
    foodtypeChDesActive: '', //选中的餐别中文描述，如‘午餐’
    mealLabelUsedActive: undefined,
    organizeMealLabelActive: undefined,



    menutypeActiveFlag: 0,
    boxActiveFlag: false,//默认关闭
    loading: false,
    timer: null,
    canClick: true,
    //6个重要的数据
    selectedFoods: [],
    cacheMenuDataAll: [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]], //7行4列数组，用于存所有选中的数据---当前所有数据
    totalMoney: 0,
    totalCount: 0,
    totalMoneyRealDeduction: 0, //实际额度总金额
    realMoney: 0,//实际总价格，也就是自费价格

    activeSelectedFoods: [], //当前天当前餐的选中菜单 每点击一次+ 或者 -，都记录一下这个值

    mapMenutype: ['早餐', '午餐', '晚餐', '夜宵'],
    mapMenutypeIconName: ['zaocan1', 'wucan', 'canting', 'xiaoye-'],
    scrollToView: 'id_0',
    listHeight: [], //这个数组记录每个餐类的"之前所有餐类描述+所有具体餐品"的占用高度值
    timer: null,

    foodLabels: null,
    scrollLintenFlag: true, //默认允许触发滚动事件
    showBackToTopFlag: false, //显示返回scroll顶部的标志
  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {
    if (this.data.timer) {
      clearTimeout(this.data.timer)
    }
  },
  getMenuData: function () {  //setData设置menuData为缓存数据，这样可以同步到模板渲染
    //console.log('cacheMenuDataAll',this.data.cacheMenuDataAll)
    let _this = this
    //let tmp = _this.data.cacheMenuDataAll[_this.data.timeActiveFlag][_this.data.foodtypeActiveFlag]
    let tmp = app.globalData.cacheMenuDataAll[_this.data.timeActiveFlag][_this.data.foodtypeActiveFlag] //取全局，取完后setData更新本地
    if (tmp != null) {
      _this.setData({
        cacheMenuDataAll: app.globalData.cacheMenuDataAll
      })
      if (tmp.foodLabels != null) {
        _this.refreshLabelActiveList()
      }
    } else {
      _this.getMenuDataByResponse()
    }
  },
  handleChangeTimeActive: function (e) {
    let _this = this
    let flag = _this.checkStandardPriceTotal() //金额低于餐标的计算检查-总体，在切换日期或餐时的时候触发
    if (flag === true) { //需要提示
      wx.showModal({
        title: '未达餐标金额(¥' + _this.data.activeSelectedFoods.organizeMealLabel + ')' , 
        content: _this.data.timeDesActive +'(' + _this.data.timeWeakDesActive +')' + _this.data.foodtypeChDesActive + ':\r\n' + 
          '金额(¥' + _this.data.activeSelectedFoods.foodTypeTotalRealMoney + ')低于餐标,请继续选餐',
        showCancel: false,
        confirmText: '返回'
      })
    } else {
      let tmp = parseInt(e.currentTarget.dataset.timeindex)//传过来的字符串，要转化成number格式
      _this.data.timeActiveFlag = tmp
      _this.data.timeDesActive = e.currentTarget.dataset.arrangedate
      _this.setData({
        timeActiveFlag: tmp,
        timeDesActive: e.currentTarget.dataset.arrangedate,
        timeWeakDesActive:e.currentTarget.dataset.dateweak
      })
      _this.getMenuData()
    }
  },
  handleChangeFoodtypeActive: function (e) {
    let _this = this
    let flag = _this.checkStandardPriceTotal() //金额低于餐标的计算检查-总体，在切换日期或餐时的时候触发
    if (flag === true) { //需要提示
      wx.showModal({
        title: '未达餐标金额(¥' + _this.data.activeSelectedFoods.organizeMealLabel + ')' , 
        content: _this.data.timeDesActive +'(' + _this.data.timeWeakDesActive +')' + _this.data.foodtypeChDesActive + ':\r\n' + 
          '金额(¥' + _this.data.activeSelectedFoods.foodTypeTotalRealMoney + ')低于餐标,请继续选餐',
        showCancel: false,
        confirmText: '返回'
      })
    } else {
      let tmp = parseInt(e.currentTarget.dataset.foodtypeindex)//传过来的字符串，要转化成number格式
      _this.data.foodtypeActiveFlag = tmp
      _this.data.foodtypeDesActive = e.currentTarget.dataset.mealtype
      _this.setData({
        foodtypeActiveFlag: tmp,
        foodtypeDesActive: e.currentTarget.dataset.mealtype,
        foodtypeChDesActive:e.currentTarget.dataset.mealtypechdes
      })
      _this.getMenuData()
    }
  },
  handleChangeMenutypeActive: function (e) {
    let _this = this
    _this.setData({
      menutypeActiveFlag: e.currentTarget.dataset.menutypeindex,
      scrollToView: 'order' + e.currentTarget.dataset.menutypeindex,
      scrollLintenFlag: false, //默认不要触发滚动事件
    })
    if (_this.data.timer) {
      clearTimeout(_this.data.timer)
    }
    _this.data.timer = setTimeout(function () {
      _this.setData({
        scrollLintenFlag: true, //默认不要触发滚动事件
      })
    }, 500)
    //console.log(this.data.scrollToView)
  },
  calculatetotalMoneyRealDeduction: function () {
    let _this = this
    let tmp_totalMoneyRealDeduction = 0
    _this.data.selectedFoods.forEach((element1) => {
      element1.dayInfo.forEach((element2) => {
        if (element2.mealLabelFlag == true) {
          if (parseFloat(element2.foodTypeTotalRealMoney) < parseFloat(element2.organizeMealLabel)) { //该天该餐的自费总额比餐标还小
            tmp_totalMoneyRealDeduction = parseFloat((parseFloat(tmp_totalMoneyRealDeduction) + parseFloat(element2.foodTypeTotalRealMoney)).toFixed(2))
          } else {
            tmp_totalMoneyRealDeduction = parseFloat((parseFloat(tmp_totalMoneyRealDeduction) + parseFloat(element2.organizeMealLabel)).toFixed(2))
          }
        }
      })
    })
    this.setData({
      totalMoneyRealDeduction: tmp_totalMoneyRealDeduction
    })
  },
  selectedFoodsAdd: function (e) {
    let _this = this
    var selectedFoods = app.globalData.selectedFoods //取全局，取完后setData更新本地
    var a_selectedFoods = {
      day: e.currentTarget.dataset.day,
      dayDes: e.currentTarget.dataset.daydes,
      dayInfo: [{
        foodType: e.currentTarget.dataset.foodtype,
        foodTypeDes: e.currentTarget.dataset.foodtypedes,
        mealLabelFlag: _this.data.mealLabelUsedActive,
        organizeMealLabel: _this.data.organizeMealLabelActive,
        foodTypeTotalRealMoney: parseFloat(e.currentTarget.dataset.foodprice),//【兼容修改】该天该餐时的自费总额
        foodTypeInfo: [{
          foodCode: e.currentTarget.dataset.foodcode,
          foodPrice: parseFloat(e.currentTarget.dataset.foodprice),
          foodTotalPrice: parseFloat(e.currentTarget.dataset.foodprice),//这个总价实在是因为微信小程序模板中不识别parseFloat，只能这里转换
          foodName: e.currentTarget.dataset.foodname,
          foodImage: e.currentTarget.dataset.foodimage,
          __food_index: e.currentTarget.dataset.foodindex,//
          __menutype_index: e.currentTarget.dataset.menutypeindex,
          foodCount: 1,
          stockLeftNum: e.currentTarget.dataset.stockleftnum,
          homebuyingRestrictions: e.currentTarget.dataset.homebuyingrestrictions
        }]
      }]
    }
    var tmp_length = 0
    if (selectedFoods == '') {
      selectedFoods.push(a_selectedFoods)
    } else {
      tmp_length = selectedFoods.length //缓存length，提升性能
      for (var i = 0; i < tmp_length; i++) {
        if (selectedFoods[i].day == e.currentTarget.dataset.day) {
          //if(selectedFoods[i].day == _this.data.timeActiveFlag){
          tmp_length = selectedFoods[i].dayInfo.length //缓存length，提升性能
          for (var j = 0; j < tmp_length; j++) {
            //if(selectedFoods[i].dayInfo[j].foodType == _this.data.foodtypeActiveFlag){  //-----这里出过问题，
            if (selectedFoods[i].dayInfo[j].foodType == e.currentTarget.dataset.foodtype) {
              tmp_length = selectedFoods[i].dayInfo[j].foodTypeInfo.length  //缓存length，提升性能
              for (var k = 0; k < tmp_length; k++) {
                if (selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodCode == e.currentTarget.dataset.foodcode) {
                  selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodCount++ //这种情况直接 计数器+1
                  selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodTotalPrice = parseFloat((parseFloat(selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodTotalPrice) + parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2))
                  //【兼容修改】计算：该天该餐时的自费总额
                  selectedFoods[i].dayInfo[j].foodTypeTotalRealMoney = parseFloat((parseFloat(selectedFoods[i].dayInfo[j].foodTypeTotalRealMoney) + parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2))
                  k = tmp_length //跳出循环，提升性能
                } else {
                  if (k == tmp_length - 1) {  //便利到最后一个了，还没有相等的，就push进这个新的
                    selectedFoods[i].dayInfo[j].foodTypeInfo.push({
                      foodCode: e.currentTarget.dataset.foodcode,
                      foodPrice: parseFloat(e.currentTarget.dataset.foodprice),
                      foodTotalPrice: parseFloat(e.currentTarget.dataset.foodprice),
                      foodName: e.currentTarget.dataset.foodname,
                      foodImage: e.currentTarget.dataset.foodimage,
                      __food_index: e.currentTarget.dataset.foodindex,
                      __menutype_index: e.currentTarget.dataset.menutypeindex,
                      foodCount: 1,
                      stockLeftNum: e.currentTarget.dataset.stockleftnum,
                      homebuyingRestrictions: e.currentTarget.dataset.homebuyingrestrictions
                    })
                    //【兼容修改】计算：该天该餐时的自费总额
                    selectedFoods[i].dayInfo[j].foodTypeTotalRealMoney = parseFloat((parseFloat(selectedFoods[i].dayInfo[j].foodTypeTotalRealMoney) + parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2))
                  }
                }
              }
              j = tmp_length //跳出循环
            } else {
              if (j == tmp_length - 1) {   //便利到最后一个了，还没有相等的，就push进这个新的
                selectedFoods[i].dayInfo.push({
                  foodType: e.currentTarget.dataset.foodtype,
                  foodTypeDes: e.currentTarget.dataset.foodtypedes,
                  mealLabelFlag: _this.data.mealLabelUsedActive,
                  organizeMealLabel: _this.data.organizeMealLabelActive,
                  foodTypeTotalRealMoney: parseFloat(e.currentTarget.dataset.foodprice),//【兼容修改】
                  foodTypeInfo: [{
                    foodCode: e.currentTarget.dataset.foodcode,
                    foodPrice: parseFloat(e.currentTarget.dataset.foodprice),
                    foodTotalPrice: parseFloat(e.currentTarget.dataset.foodprice),
                    foodName: e.currentTarget.dataset.foodname,
                    foodImage: e.currentTarget.dataset.foodimage,
                    __food_index: e.currentTarget.dataset.foodindex,
                    __menutype_index: e.currentTarget.dataset.menutypeindex,
                    foodCount: 1,
                    stockLeftNum: e.currentTarget.dataset.stockleftnum,
                    homebuyingRestrictions: e.currentTarget.dataset.homebuyingrestrictions
                  }]
                })
              }
            }
          }
          i = tmp_length //跳出循环
        } else {
          if (i == tmp_length - 1) {   //便利到最后一个了，还没有相等的，就push进这个新的
            selectedFoods.push({
              day: e.currentTarget.dataset.day,
              dayDes: e.currentTarget.dataset.daydes,
              dayInfo: [{
                foodType: e.currentTarget.dataset.foodtype,
                foodTypeDes: e.currentTarget.dataset.foodtypedes,
                mealLabelFlag: _this.data.mealLabelUsedActive,
                organizeMealLabel: _this.data.organizeMealLabelActive,
                foodTypeTotalRealMoney: parseFloat(e.currentTarget.dataset.foodprice),//【兼容修改】
                foodTypeInfo: [{
                  foodCode: e.currentTarget.dataset.foodcode,
                  foodPrice: parseFloat(e.currentTarget.dataset.foodprice),
                  foodTotalPrice: parseFloat(e.currentTarget.dataset.foodprice),
                  foodName: e.currentTarget.dataset.foodname,
                  foodImage: e.currentTarget.dataset.foodimage,
                  __food_index: e.currentTarget.dataset.foodindex,
                  __menutype_index: e.currentTarget.dataset.menutypeindex,
                  foodCount: 1,
                  stockLeftNum: e.currentTarget.dataset.stockleftnum,
                  homebuyingRestrictions: e.currentTarget.dataset.homebuyingrestrictions
                }]
              }]
            })
          }
        }
      }
    }
    app.globalData.selectedFoods = selectedFoods //全局更新
    this.setData({   //添加或减少结束后，setData一定要把全局的赋给他
      selectedFoods: app.globalData.selectedFoods
    })
    console.log('全局selectedFoods:', app.globalData.selectedFoods)

    _this.checkStandardPriceCurrent(selectedFoods, e.currentTarget.dataset.day, e.currentTarget.dataset.foodtype) // 金额低于餐标的计算检查-当前，在点击+ -时触发 
    _this.calculatetotalMoneyRealDeduction()
  },

  selectedFoodsMinus: function (e) {
    let _this = this
    var selectedFoods = app.globalData.selectedFoods //取全局，取完后setData更新本地
    var tmp_length = selectedFoods.length //缓存length，提升性能
    for (var i = 0; i < tmp_length; i++) {
      if (selectedFoods[i].day == e.currentTarget.dataset.day) {
        tmp_length = selectedFoods[i].dayInfo.length //缓存length，提升性能
        for (var j = 0; j < tmp_length; j++) {
          if (selectedFoods[i].dayInfo[j].foodType == e.currentTarget.dataset.foodtype) {
            tmp_length = selectedFoods[i].dayInfo[j].foodTypeInfo.length  //缓存length，提升性能
            for (var k = 0; k < tmp_length; k++) {
              if (selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodCode == e.currentTarget.dataset.foodcode) {
                selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodCount-- //这种情况直接 计数器-1
                selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodTotalPrice = parseFloat((parseFloat(selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodTotalPrice) - parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2))
                //【兼容修改】该天该餐时的自费总额
                selectedFoods[i].dayInfo[j].foodTypeTotalRealMoney = parseFloat((parseFloat(selectedFoods[i].dayInfo[j].foodTypeTotalRealMoney) - parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2))
                if (selectedFoods[i].dayInfo[j].foodTypeInfo[k].foodCount == 0) { //如果count降到0 则直接删掉这个结构
                  selectedFoods[i].dayInfo[j].foodTypeInfo.splice(k, 1)
                  //console.log('selectedFoods[i].dayInfo[j].foodTypeInfo',selectedFoods[i].dayInfo[j].foodTypeInfo)
                  if (selectedFoods[i].dayInfo[j].foodTypeInfo.length == 0) {
                    selectedFoods[i].dayInfo.splice(j, 1)
                    //console.log('selectedFoods[i].dayInfo',selectedFoods[i].dayInfo)
                    if (selectedFoods[i].dayInfo.length == 0) {
                      selectedFoods.splice(i, 1)
                      //console.log('selectedFoods',selectedFoods)
                    }
                  }
                }
                k = tmp_length //跳出循环，提升性能
              }
            }
            j = tmp_length //跳出循环
          }
        }
        i = tmp_length //跳出循环
      }
    }
    app.globalData.selectedFoods = selectedFoods //全局更新
    this.setData({   //添加或减少结束后，setData一定要把全局的赋给他
      selectedFoods: app.globalData.selectedFoods
    })
    _this.checkStandardPriceCurrent(selectedFoods, e.currentTarget.dataset.day, e.currentTarget.dataset.foodtype) // 金额低于餐标的计算检查-当前，在点击+ -时触发 
    _this.calculatetotalMoneyRealDeduction()
  },

  handleAddfood: function (e) {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    /*     wx.showLoading({
          title: '添加中',
          mask: true
        }) */
    /* **********模板数字响应式 + 存储下来点击的具体餐品的下标以及对应类别下标********** */
    let day = e.currentTarget.dataset.day
    let foodType = e.currentTarget.dataset.foodtype
    let menutypeIndex = e.currentTarget.dataset.menutypeindex
    let foodIndex = e.currentTarget.dataset.foodindex
    let tmp_menuData = app.globalData.cacheMenuDataAll[day][foodType] //一、这个数据结构是为了数字响应式显示
    // console.log("******",day,foodType,app.globalData.cacheMenuDataAll,app.globalData.cacheMenuDataAll[day][foodType],tmp_menuData)
    let tmp_foodCount = tmp_menuData.foods[menutypeIndex].foods[foodIndex].foodCount
    console.log(tmp_foodCount, e.currentTarget.dataset.homebuyingrestrictions, e.currentTarget.dataset.stockleftnum)
    if ((e.currentTarget.dataset.homebuyingrestrictions) && (tmp_foodCount === e.currentTarget.dataset.homebuyingrestrictions || e.currentTarget.dataset.homebuyingrestrictions === 0)) {
      wx.showToast({
        title: '已超限购',
        image: '../../images/msg/error.png',
        duration: 2000
      })
    } else if ((e.currentTarget.dataset.stockleftnum) && (tmp_foodCount === e.currentTarget.dataset.stockleftnum || e.currentTarget.dataset.stockleftnum === 0)) {
      wx.showToast({
        title: '库存不足',
        image: '../../images/msg/error.png',
        duration: 2000
      })
    } else {
      if (!tmp_foodCount) {
        tmp_menuData.foods[menutypeIndex].foods[foodIndex].foodCount = 1
      } else {
        tmp_menuData.foods[menutypeIndex].foods[foodIndex].foodCount++
      }
      tmp_menuData.day = e.currentTarget.dataset.day  //这两行是为了更新这个临时menuData的day和foodType
      tmp_menuData.foodType = e.currentTarget.dataset.foodtype
      tmp_menuData.foods[menutypeIndex].foods[foodIndex].__food_index = foodIndex  //这两行是为了存储两个下标,foodIndex表示这个food在后台数据中的餐类（左侧分类）中的下标
      tmp_menuData.foods[menutypeIndex].foods[foodIndex].__menutype_index = menutypeIndex //menutypeIndex表示这个food在后台数据中的餐类（左侧分类）在餐类列表中的下标
      console.log('e:', e.currentTarget.dataset)
      console.log('e menuData:', _this.data.menuData)
      /* **********主菜单视图响应式--操作cacheMenuDataAll大数组********** */
      let tmp_cacheMenuDataAll = app.globalData.cacheMenuDataAll
      tmp_cacheMenuDataAll[day][foodType] = tmp_menuData
      app.globalData.cacheMenuDataAll = tmp_cacheMenuDataAll //全局更新
      _this.setData({   //添加或减少结束后，setData一定要把全局的赋给他
        cacheMenuDataAll: app.globalData.cacheMenuDataAll
      })
      console.log('全局大数组cacheMenuDataAll:', app.globalData.cacheMenuDataAll)
      /* **********购物车视图响应式--操作selectedFoods********** */
      _this.selectedFoodsAdd(e)
      //总计数
      app.globalData.totalCount = app.globalData.totalCount + 1
      _this.setData({
        totalCount: app.globalData.totalCount
      })
      //总价格
      app.globalData.totalMoney = parseFloat((parseFloat(app.globalData.totalMoney) + parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2))
      //app.globalData.realMoney = (parseFloat(app.globalData.totalMoney) - parseFloat(_this.data.totalMoneyRealDeduction)).toFixed(2)
      let tmp_realMoney = parseFloat((parseFloat(app.globalData.totalMoney) - parseFloat(_this.data.totalMoneyRealDeduction)).toFixed(2)) //-------相减错误
      if (tmp_realMoney < 0) { //需要处理这个额度大于实际付款的情况，虽然几乎不可能发生，但是还要容错
        tmp_realMoney = 0
      }
      app.globalData.realMoney = tmp_realMoney
      _this.setData({
        totalMoney: app.globalData.totalMoney,
        realMoney: app.globalData.realMoney
      })
      _this.setData({
        totalMoney: app.globalData.totalMoney,
        realMoney: app.globalData.realMoney
      })
    }
    if (_this.data.timer) {
      clearTimeout(_this.data.timer)
    }
    _this.data.timer = setTimeout(function () {
      _this.data.canClick = true
    }, 300)
    /*     wx.hideLoading() */
  },
  handleMinusfood: function (e) {
    let _this = this
    if (!_this.data.canClick) {
      return
    }
    _this.data.canClick = false
    wx.showLoading({
      title: '添加中',
      mask: true
    })
    /* **********数字响应式********** */
    let day = e.currentTarget.dataset.day
    let foodType = e.currentTarget.dataset.foodtype
    let menutypeIndex = e.currentTarget.dataset.menutypeindex
    let foodIndex = e.currentTarget.dataset.foodindex
    let tmp_menuData = app.globalData.cacheMenuDataAll[day][foodType] //一、这个数据结构是为了数字响应式显示
    if (tmp_menuData.foods[menutypeIndex].foods[foodIndex].foodCount > 0) {
      tmp_menuData.foods[menutypeIndex].foods[foodIndex].foodCount--
    } else {
      tmp_menuData.foods[menutypeIndex].foods[foodIndex].foodCount = 0
    }
    console.log('e:', e.currentTarget.dataset)
    console.log('e menuData:', _this.data.menuData)
    /* **********主菜单视图响应式--操作cacheMenuDataAll大数组********** */
    let tmp_cacheMenuDataAll = app.globalData.cacheMenuDataAll
    tmp_cacheMenuDataAll[day][foodType] = tmp_menuData
    app.globalData.cacheMenuDataAll = tmp_cacheMenuDataAll //全局更新
    _this.setData({   //添加或减少结束后，setData一定要把全局的赋给他
      cacheMenuDataAll: app.globalData.cacheMenuDataAll
    })
    console.log('大数组cacheMenuDataAll:', _this.data.cacheMenuDataAll)
    /* **********购物车视图响应式--操作selectedFoods********** */
    _this.selectedFoodsMinus(e)
    //总计数
    app.globalData.totalCount = app.globalData.totalCount - 1
    _this.setData({
      totalCount: app.globalData.totalCount
    })
    //总价格
    app.globalData.totalMoney = parseFloat((parseFloat(app.globalData.totalMoney) - parseFloat(e.currentTarget.dataset.foodprice)).toFixed(2))
    //app.globalData.realMoney = (parseFloat(app.globalData.totalMoney) - parseFloat(_this.data.totalMoneyRealDeduction)).toFixed(2)
    let tmp_realMoney = parseFloat((parseFloat(app.globalData.totalMoney) - parseFloat(_this.data.totalMoneyRealDeduction)).toFixed(2))
    if (tmp_realMoney < 0) { //需要处理这个额度大于实际付款的情况，虽然几乎不可能发生，但是还要容错
      tmp_realMoney = 0
    }
    app.globalData.realMoney = tmp_realMoney
    _this.setData({
      totalMoney: app.globalData.totalMoney,
      realMoney: app.globalData.realMoney
    })
    if (_this.data.timer) {
      clearTimeout(_this.data.timer)
    }
    _this.data.timer = setTimeout(function () {
      _this.data.canClick = true
    }, 300)
    wx.hideLoading()
  },
  handleClickBox: function () {
    let _this = this
    _this.setData({
      boxActiveFlag: !_this.data.boxActiveFlag
    })
    if (_this.data.boxActiveFlag == true) { //获取计算购物车的scroll的高度所必须的参数top_1 top_2
      const query_1 = wx.createSelectorQuery()
      query_1.select('.c_scrollPosition_1_forCalculate').boundingClientRect()
      query_1.selectViewport().scrollOffset()
      query_1.exec(function (res) {
        _this.setData({
          top_1: res[0].height // #the-id节点的占用高度
        })
      })
    }
  },
  /* 菜品详情 */
  handleGotoFoodDetail: function (e) {
    wx.navigateTo({
      url: '/pages/food/food?dateId=' + e.currentTarget.dataset.dateid,
    })
  },
  /* 标签过滤 */
  handleChangeFoodLabel: function (e) {
    let _this = this
    let tmp_foodLabels = _this.data.foodLabels
    let tmp_length = tmp_foodLabels.length
    for (let i = 0; i < tmp_length; i++) {
      if (tmp_foodLabels[i].labelId == e.currentTarget.dataset.labelid) {
        if (tmp_foodLabels[i].active) {
          tmp_foodLabels[i].active = false
        } else {
          tmp_foodLabels[i].active = true
        }
        break
      }
    }
    _this.setData({
      foodLabels: tmp_foodLabels
    })
    _this.refreshLabelActiveList()
  },
  initMenu: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        //console.log('windowHeight',res.windowHeight)
        _this.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    const query_0 = wx.createSelectorQuery()
    query_0.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query_0.selectViewport().scrollOffset()
    query_0.exec(function (res) {
      if (res[0] != null) {
        _this.setData({
          top_0: res[0].top // #the-id节点的占用高度
        })
      }
      //console.log('top_0',res[0])
    })
    const query_2 = wx.createSelectorQuery()
    query_2.select('.c_scrollPosition_2_forCalculate').boundingClientRect()
    query_2.selectViewport().scrollOffset()
    query_2.exec(function (res) {
      _this.setData({
        top_2: res[0].top,
        /*         height_2: res[0].height */
      })
      //console.log('top_2',res[0])
      //console.log('windowHeight',_this.data.windowHeight)
    })
    const query_3 = wx.createSelectorQuery()
    query_3.select('.c_labelPosition_forCalculate').boundingClientRect()
    query_3.selectViewport().scrollOffset()
    query_3.exec(function (res) {
      if (res[0] != null) {
        _this.setData({
          height_3: res[0].height // #the-id节点的占用高度
        })
      }
    })
  },
  /* 获取七天日期 */
  getTimeDataByResponse: function () {
    let _this = this
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode
    }
    menuModel.getTimeData(param, function (res) { //回调获取七天列表，赋给本地timeInfo
      let resData = res
      resData.userOrderDateVO.forEach(element => {
        element.dateShort = element.date.substring(8)
        element.dateWeak = moment(element.date).format('dddd')
      })
      _this.setData({ //首次进入的active的日期信息，保存下来
        timeDesActive: res.userOrderDateVO[0].date, 
        timeWeakDesActive: res.userOrderDateVO[0].dateWeak, 
        timeInfo: resData
      })
      //首次进入的active餐品信息，保存下来
      if (resData.userOrderMealTypeVO.LUNCH) { 
        _this.setData({
          foodtypeActiveFlag: 1,
          foodtypeDesActive: 'LUNCH',
          foodtypeChDesActive: '午餐'
        })
      } else if (resData.userOrderMealTypeVO.DINNER) {
        _this.setData({
          foodtypeActiveFlag: 2,
          foodtypeDesActive: 'DINNER',
          foodtypeChDesActive: '晚餐'
        })
      } else if (resData.userOrderMealTypeVO.BREAKFAST) {
        _this.setData({
          foodtypeActiveFlag: 0,
          foodtypeDesActive: 'BREAKFAST',
          foodtypeChDesActive: '早餐'
        })
      } else if (resData.userOrderMealTypeVO.NIGHT) {
        _this.setData({
          foodtypeActiveFlag: 3,
          foodtypeDesActive: 'NIGHT',
          foodtypeChDesActive: '夜宵'
        })
      } else {
        //所有餐标都是false，则设置为4
      }
      _this.getMenuDataByResponse()
    })
  },
  getMenuDataByResponse: function () {
    let _this = this
    //获取后台数据
    let param = {
      arrangeDate: _this.data.timeDesActive,
      mealType: _this.data.foodtypeDesActive,
      userCode: wx.getStorageSync('userInfo').userCode,
    }
    menuModel.getMenuData(param, (res) => {
      let resData = res
      resData.deadlineDes = moment(resData.deadline).calendar()
      let tmp_cacheMenuDataAll = app.globalData.cacheMenuDataAll
      tmp_cacheMenuDataAll[_this.data.timeActiveFlag][_this.data.foodtypeActiveFlag] = resData
      if (resData.foodLabels != null) {
        //下面 标签数组本地化
        if (_this.data.foodLabels == null || _this.data.foodLabels.length == 0) {
          let tmp_foodLabels = []
          resData.foodLabels.forEach((element) => {
            tmp_foodLabels.push({
              labelId: element.labelId,
              labelName: element.labelName,
              active: false //true代表激活状态 false代表普通状态  默认普通状态
            })
          })
          _this.setData({
            foodLabels: tmp_foodLabels
          })
        }
        _this.refreshLabelActiveList()
      }
      _this.calculateHeight()
      _this.data.mealLabelUsedActive = resData.mealLabelFlag
      _this.data.organizeMealLabelActive = resData.organizeMealLabel
      _this.setData({   //这里放在最后，是为了让异步setData最后再刷新，防止页面闪动
        cacheMenuDataAll: tmp_cacheMenuDataAll,
        /*         mealLabelUsedActive: resData.mealLabelFlag, 
                organizeMealLabelActive: resData.organizeMealLabel */
      })
    })
  },
  /* 刷新标签的显示列表 */
  refreshLabelActiveList: function () {
    let _this = this

    let tmp_cacheMenuDataCurrent = app.globalData.cacheMenuDataAll[_this.data.timeActiveFlag][_this.data.foodtypeActiveFlag]
    let tmp_selectedFoodLabelsIdsArr = [] //用于存储选中状态的标签id，例如：[2,3] 注意是选中的
    if (_this.data.foodLabels != null) {
      _this.data.foodLabels.forEach((element) => {
        if (element.active == true) {
          tmp_selectedFoodLabelsIdsArr.push(element.labelId)
        }
      })
      //console.log('tmp_selectedFoodLabelsIdsArr',tmp_selectedFoodLabelsIdsArr)
      //console.log('tmp_cacheMenuDataCurrent',tmp_cacheMenuDataCurrent)
      tmp_cacheMenuDataCurrent.foods.forEach((element1) => {
        element1.foods.forEach((element2) => {
          //tmp_foodLabelsIdsArr标签数组是tagId数组的子集，则该food就要设置active：true
          let tmp_length = tmp_selectedFoodLabelsIdsArr.length
          if (tmp_selectedFoodLabelsIdsArr.length == 0) { //如果是空数组，则直接所有food设置为true显示
            element2.active = true
          } else {
            for (let i = 0; i < tmp_length; i++) {
              //if(tmp_selectedFoodLabelsIdsArr.indexOf(element2.tagId[i])==-1){ //如果不包含
              if (element2.foodLabel.indexOf(tmp_selectedFoodLabelsIdsArr[i]) == -1) { //如果不包含
                element2.active = false  //直接设置该food隐藏
                break
              }
              if (i == tmp_length - 1) {
                element2.active = true //tagId循环到最后一个了，前面都没break，说明这个也被包含，要设置为true
              }
            }
          }
        })
      })
      let tmp_cacheMenuDataAll = app.globalData.cacheMenuDataAll  //cache大数组更新
      tmp_cacheMenuDataAll[_this.data.timeActiveFlag][_this.data.foodtypeActiveFlag] = tmp_cacheMenuDataCurrent
      app.globalData.cacheMenuDataAll = tmp_cacheMenuDataAll //全局更新
      _this.setData({   //添加或减少结束后，setData一定要把全局的赋给他
        cacheMenuDataAll: app.globalData.cacheMenuDataAll
      })
    }
  },
  /* 计算高度 */
  calculateHeight: function () {
    let _this = this
    let tmp_listHeight = [0] //首元素置为0 下面的循环次数为 rect.length-1 就能保证不会多出一次
    let totalHeight = 0
    wx.createSelectorQuery().selectAll('.c_foodPosition_forCalculate').boundingClientRect(function (rect) {
      for (let i = 0; i < rect.length - 1; i++) {
        totalHeight = totalHeight + rect[i].height
        tmp_listHeight.push(totalHeight)
      }
      _this.data.listHeight = tmp_listHeight
      /*       _this.setData({
              listHeight: tmp_listHeight
            }) */
    }).exec()
  },
  handleClearFoods: function () {
    let _this = this
    app.globalData.cacheMenuDataAll = [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]]
    app.globalData.selectedFoods = []
    app.globalData.totalCount = 0
    app.globalData.totalMoney = 0
    _this.setData({
      cacheMenuDataAll: [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]],
      selectedFoods: [],
      totalCount: 0,
      totalMoney: 0,
      totalMoneyRealDeduction: 0,
      realMoney: 0
    })
    _this.getMenuDataByResponse() //必须刷新一下，否则原来menu页面上的视图都没有数据了
    if (_this.data.timer) {
      clearTimeout(_this.data.timer)
    }
    _this.data.timer = setTimeout(function () {
      _this.setData({
        boxActiveFlag: !_this.data.boxActiveFlag
      })
    }, 1000)
  },
  /* 滚动事件监听 */
  handleScroll: function (e) {
    //console.log('scrollview滚动距离:',e.detail.scrollTop)
    let _this = this
    if (e.detail.scrollTop > 300) {
      _this.setData({
        showBackToTopFlag: true
      })
    } else {
      _this.setData({
        showBackToTopFlag: false
      })
    }
    if (this.data.scrollLintenFlag) { //允许触发滚动事件，才执行滚动事件
      let scrollY = e.detail.scrollTop
      //console.log(e.detail.scrollTop)
      let listHeightLength = _this.data.listHeight.length
      for (let i = 0; i < listHeightLength; i++) {
        let height1 = _this.data.listHeight[i]
        let height2 = _this.data.listHeight[i + 1];//listHeight[length]返回undefined,所以可以用!height2做判断不是最后一个
        if (scrollY >= height1 - 1 && scrollY < height2) {
          //console.log('当前menutypeIndex是：',i)
          if (i != _this.data.menutypeActiveFlag) {
            _this.setData({
              menutypeActiveFlag: i
            })
          }
        }
      }
    }
  },
  //返回页面顶端
  backToTop: function () {
    wx.pageScrollTo({ //外层scrollview返回顶端
      scrollTop: 0,
    })
    this.setData({ //内层scrollview返回顶端（这样设置就可以）
      menutypeActiveFlag: 0,
      scrollToView: 'order0'
    })
  },
  /* 滚动到底部事件监听 */
  handleScrolltolower: function (e) {
    /*    暂时先注释掉了，体验不太好
         if (this.data.scrollLintenFlag) { //允许触发滚动事件，才执行滚动事件
          let _this = this
          let listHeightLength = _this.data.listHeight.length
          _this.setData({
            menutypeActiveFlag: listHeightLength - 1
          })
        } */
  },

  /* 金额低于餐标的计算检查-当前，在点击+ -时触发 */
  checkStandardPriceCurrent: function (selectedFoods, day, foodtype) {
    let _this = this
    let tmp_length = selectedFoods.length
    for (var x = 0; x < tmp_length; x++) {
      if (selectedFoods[x].day == day) {
        tmp_length = selectedFoods[x].dayInfo.length
        for (var y = 0; y < tmp_length; y++) {
          if (selectedFoods[x].dayInfo[y].foodType == foodtype) {
            _this.data.activeSelectedFoods = selectedFoods[x].dayInfo[y]//当餐的已选中的food列表
            y = tmp_length
          }
        }
        x = tmp_length
      }
    }
  },
  /* 金额低于餐标的计算检查-总体，在切换日期或餐时的时候触发 */
  checkStandardPriceTotal: function () {
    let _this = this
    if (_this.data.activeSelectedFoods) {
      //可使用餐标 且 总金额小于餐标 且总金额不等于0(因为一道菜都没有选择的话,是允许切换的) 的情况
      if ((_this.data.activeSelectedFoods.mealLabelFlag == true)
        && (_this.data.activeSelectedFoods.foodTypeTotalRealMoney < _this.data.activeSelectedFoods.organizeMealLabel)
        && (_this.data.activeSelectedFoods.foodTypeTotalRealMoney != 0)) {
        return true //需要提示
      } else {
        return false
      }
    } else {
      return false //默认返回true 也就是不提示
    }
  },

  goToMenuCommit() {
    let _this = this
    let flag = _this.checkStandardPriceTotal() //金额低于餐标的计算检查-总体，在切换日期或餐时的时候触发
    if (flag === true) { //需要提示
      wx.showModal({
        title: '未达餐标金额(¥' + _this.data.activeSelectedFoods.organizeMealLabel + ')' , 
        content: _this.data.timeDesActive +'(' + _this.data.timeWeakDesActive +')' + _this.data.foodtypeChDesActive + ':\r\n' + 
          '金额(¥' + _this.data.activeSelectedFoods.foodTypeTotalRealMoney + ')低于餐标,请继续选餐',
        showCancel: false,
        confirmText: '返回'
      })
    } else {
      wx.navigateTo({
        url: '/pages/menu/confirm/confirm?totalMoney='
          + _this.data.totalMoney + '&totalMoneyRealDeduction='
          + _this.data.totalMoneyRealDeduction + '&realMoney='
          + _this.data.realMoney,
      })
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    //初始化，获取一些必要参数，如高度
    _this.initMenu()
    _this.getTimeDataByResponse()
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

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  //菜单页面离开后重置cacheMenuDataAll和selectedFoods，是因为菜品列表会变，用户再次进入menu菜单后能从后台获取最新菜品列表
  //（onUnload即重定向方法wx.redirectTo(OBJECT)或关闭当前页返回上一页wx.navigateBack()），这里是指点击左上角的返回上一页
  onUnload: function () {
    let _this = this
    app.globalData.cacheMenuDataAll = [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]]
    app.globalData.selectedFoods = []
    app.globalData.totalCount = 0
    app.globalData.totalMoney = 0
    _this.setData({
      cacheMenuDataAll: [[null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null], [null, null, null, null]],
      selectedFoods: [],
      totalCount: 0,
      totalMoney: 0,
      totalMoneyRealDeduction: 0,
      realMoney: 0
    })
  },
})