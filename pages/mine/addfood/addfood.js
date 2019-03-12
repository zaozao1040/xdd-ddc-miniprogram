import moment from "../../../comm/script/moment"
import { menu } from './addfood-model.js'
let menuModel = new menu()
const app = getApp()

Page({
    data: {
        foodLabels: [], // 餐品标签，大份，微辣那些 
        foods: [], //添加了每道菜根据标签显示(show)和加入购物车的个数(foodCount)的餐品列表，
        foodsCopy: [], //初始化为foods，在清空购物车时，赋值给foods
        allData: [], // 返回的所有数据
        mealType: { LUNCH: { name: '午餐', icon: 'wucan' }, DINNER: { name: '晚餐', icon: 'canting' }, BREAKFAST: { name: '早餐', icon: 'zaocan1' }, NIGHT: { name: '夜宵', icon: 'xiaoye-' } },
        deadLineMsg: '', // 截止订餐：显示字符串
        menutypeActiveFlag: 0, //当前被点击的餐品类别
        foodLabels: [], //标签列表，为了添加active
        boxActiveFlag: false, //购物车的颜色，false时是灰色，true时有颜色
        totalCount: 0, // 购物车中物品个数
        totalMoney: 0, //购物车中菜品的总金额
        realTotalMoney: 0, // totalMoney-totalMoneyRealDeduction后得到的钱 
        top_0: 0,
        top_2: 0,
        /*     height_2: 0, */
        height_3: 0,
        timer: null,
        windowHeight: 0,
        scrollLintenFlag: true, //默认允许触发滚动事件
        showBackToTopFlag: false, //显示返回scroll顶部的标志
        scrollToView: 'id_0',
        selectedFoods: [], //选择的食物的 menutypeIndex和foodIndex
        selectedFoodsIndex: [], //选择的食物的 menutypeIndex和foodIndex 
        totalMoneyRealDeduction: 0, //企业餐标加优惠券一起减免的钱
        listHeight: [], //这个数组记录每个餐类的"之前所有餐类描述+所有具体餐品"的占用高度值
        getdataalready: false //解决在没有从后台得到数据就做if判断并加载else的问题

    },
    onLoad: function() {
        wx.showLoading({
            title: '加载中'
        })
        let _this = this
        _this.getTimeDataByResponse()
    },

    //从邱宁那抄来的，用来排版的
    initMenu: function() {
        let _this = this;

        wx.getSystemInfo({
            success: function(res) {
                console.log(res)
                console.log('windowHeight', res.windowHeight)
                console.log('screenHeight', res.screenHeight)
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })

        const query_0 = wx.createSelectorQuery()
        query_0.select('.c_scrollPosition_forCalculate').boundingClientRect()
        query_0.selectViewport().scrollOffset()
        query_0.exec(function(res) {
            console.log('query_0', res)
            if (res[0] != null) {
                _this.setData({
                    top_0: res[0].top // 
                })
            }
        })
        const query_2 = wx.createSelectorQuery()
        query_2.select('.c_scrollPosition_2_forCalculate').boundingClientRect()
        query_2.selectViewport().scrollOffset()
        query_2.exec(function(res) {
            console.log('query_2', res)
            _this.setData({
                top_2: res[0].top
            })
        })
        const query_3 = wx.createSelectorQuery()
        query_3.select('.c_labelPosition_forCalculate').boundingClientRect()
        query_3.selectViewport().scrollOffset()
        query_3.exec(function(res) {
            if (res[0] != null) {
                _this.setData({
                    height_3: res[0].height // 第一个.c_labelPosition_forCalculate节点的占用高度
                })
            }
            console.log('height_3', res[0])
        })
    },
    /* 计算高度 */
    calculateHeight: function() {
        let _this = this
        let tmp_listHeight = [0] //首元素置为0 下面的循环次数为 rect.length-1 就能保证不会多出一次
        let totalHeight = 0
        wx.createSelectorQuery().selectAll('.c_foodPosition_forCalculate').boundingClientRect(function(rect) {
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
    /* 滚动事件监听 */
    handleScroll: function(e) {
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
                let height2 = _this.data.listHeight[i + 1]; //listHeight[length]返回undefined,所以可以用!height2做判断不是最后一个
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
    backToTop: function() {
        // wx.pageScrollTo({ //外层scrollview返回顶端
        //     scrollTop: 0,
        // })
        this.setData({ //内层scrollview返回顶端（这样设置就可以）
            menutypeActiveFlag: 0,
            scrollToView: 'order0'
        })
    },
    handleClearFoods: function() {
        //清空时重新加载数据
        let _this = this

        _this.setData({
            totalCount: 0,
            totalMoney: 0,
            boxActiveFlag: false,
            selectedFoodsIndex: [],
            foods: _this.data.foodsCopy
        })
    },
    //zhulili
    /* 获取加餐所有信息 */
    getTimeDataByResponse: function() {
        let _this = this
        let param = {
            userCode: wx.getStorageSync('userInfo').userCode
                // userCode: 'USER532153350423052294'
        }
        menuModel.getAddfoodData(param, function(res) { //获取加餐所有信息
            wx.hideLoading()
            let resData = res
            _this.setData({
                allData: resData, //保存下所有数据
                getdataalready: true

            })
            console.log('allData', _this.data.allData)
            _this.setData({
                deadLineMsg: moment(resData.deadline).calendar() // 得到字符串类似：今天晚上7点10分
            })

            let tempFoodLabels = resData.foodLabels
                // 每一个label添加active:false
            tempFoodLabels.forEach(item => {
                item.active = false
            })
            _this.setData({
                foodLabels: tempFoodLabels
            })

            // 给每一个菜品添加一个foodCount，用于小加号点击时加一减一
            // 给每一个菜品添加一个foodTotalPrice，因为wxml不支持parseFloat
            // 给每一个菜品添加一个foodTotalOriginalPrice，因为wxml不支持parseFloat
            // 给每一个菜品加一个show，表示满足标签要求时候show，初始化时都是show
            let tempfoods = resData.foods
            tempfoods.forEach(item => {
                item.foods.forEach(foodItem => {
                    foodItem.foodTotalPrice = 0
                    foodItem.foodTotalOriginalPrice = 0
                    foodItem.foodCount = 0
                    foodItem.show = true
                })
            })

            _this.setData({
                foods: tempfoods,
                foodsCopy: tempfoods
            })

            if (resData.mealLabelFlag && resData.organizeMealLabel > 0) { // 企业餐标可用并且大于0

                _this.setData({
                    totalMoneyRealDeduction: resData.organizeMealLabel
                })
            }

            // 在没有得到数据就使用时，是有错误的，所以在得到数据后使用
            if (res.orderFlag && res.foods.length !== 0) {
                _this.initMenu()
                _this.calculateHeight()
            } else {
                wx.getSystemInfo({
                    success: function(res) {
                        console.log(res)
                        console.log('windowHeight', res.windowHeight)
                        console.log('screenHeight', res.screenHeight)
                        _this.setData({
                            windowHeight: res.windowHeight
                        })
                    }
                })
            }

        })
    },


    handleChangeMenutypeActive: function(e) {
        let _this = this
        _this.setData({
            menutypeActiveFlag: e.currentTarget.dataset.menutypeindex,
            scrollToView: 'order' + e.currentTarget.dataset.menutypeindex,
            scrollLintenFlag: false, //默认不要触发滚动事件
        })
        if (_this.data.timer) {
            clearTimeout(_this.data.timer)
        }
        _this.data.timer = setTimeout(function() {
                _this.setData({
                    scrollLintenFlag: true, //默认不要触发滚动事件
                })
            }, 500)
            //console.log(this.data.scrollToView)
    },
    // 点击标签，active为true的设为false，为false的设为true。并刷新菜品列表
    handleChangeFoodLabel(e) {
        let _this = this
        let index = e.currentTarget.dataset.foodlabelindex

        let tempFoodLabels = _this.data.foodLabels
        tempFoodLabels[index].active = !tempFoodLabels[index].active
        _this.setData({
            foodLabels: tempFoodLabels
        })

        _this.filterFoodsWthActiveLabels(tempFoodLabels[index].active, tempFoodLabels[index].labelId)

        // 根据当前的activeLavels
    },
    /*active从false到true，检查所有show为true的food的labels是否包含点击的label。
    active从true到false，检查所有show为false的food的labels是否不包含该label，不包含的再判断是否包含其余的active的labels*/
    filterFoodsWthActiveLabels(flag, id) {
        let _this = this
        let tempFoods = _this.data.foods
        if (flag) { //active从false到true
            tempFoods.forEach(itemfoods => {
                itemfoods.foods.forEach(item => {
                    if (item.show) {
                        if (!item.foodLabel.includes(id)) {
                            item.show = false
                        }
                    }
                })
            })

        } else { //active从true到false
            let labelsId = [] //active为true的label的id的集合
            _this.data.foodLabels.forEach(item => {
                if (item.active) { //
                    labelsId.push(item.labelId)
                }
            })
            tempFoods.forEach(itemfoods => {
                itemfoods.foods.forEach(item => {
                    if (!item.show) { // 已经为true的还是true，为false的可能变为true
                        //包含该id的仍为false，不包含该id的可能会变为true
                        if (!item.foodLabel.includes(id)) {
                            //后台返给我的foodLabel不能为null，只能是数组
                            if (_this.isIncludesArray(item.foodLabel, labelsId)) {
                                item.show = true
                            }
                        }
                    }
                })
            })
        }

        _this.setData({
            foods: tempFoods
        })

    },

    // 判断second是否是main的子集 判断的效果不高啊
    isIncludesArray(main, second) {
        let flag = true
        if (main.length < second.length) {
            flag = false
        } else {
            for (let i = 0; i < second.length; i++) {
                if (!main.includes(second[i])) {
                    flag = false //不是
                    break
                }
            }
        }

        return flag
    },
    // 点击减号，将餐品减一
    handleMinusfood(e) {
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index
        let _this = this
        let tempLabelFoods = _this.data.foods
        if (tempLabelFoods[menutypeIndex].foods[foodIndex].foodCount > 0) { // 如果count>0就减一
            tempLabelFoods[menutypeIndex].foods[foodIndex].foodCount -= 1

            let tempFoodTotalPrice = tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalPrice
            tempFoodTotalPrice = parseFloat(parseFloat(tempFoodTotalPrice - parseFloat(tempLabelFoods[menutypeIndex].foods[foodIndex].foodPrice)).toFixed(2))
            tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalPrice = tempFoodTotalPrice

            let tempFoodTotalOriginalPrice = tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalOriginalPrice
            tempFoodTotalOriginalPrice = parseFloat(parseFloat(tempFoodTotalOriginalPrice - parseFloat(tempLabelFoods[menutypeIndex].foods[foodIndex].foodOriginalPrice)).toFixed(2))
            tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalOriginalPrice = tempFoodTotalOriginalPrice
        }
        _this.setData({
            foods: tempLabelFoods
        })

        let temptotalCount = _this.data.totalCount
        if (temptotalCount > 0) { // 其实不用判断，因为单个的可以减总数就肯定大于0
            temptotalCount -= 1
            _this.setData({
                totalCount: temptotalCount
            })
        }

        let temptotalMoney = _this.data.totalMoney
        temptotalMoney = parseFloat((parseFloat(temptotalMoney) - parseFloat(tempLabelFoods[menutypeIndex].foods[foodIndex].foodPrice)).toFixed(2)) //是减去foodPrice，还是foodOriginalPrice？
        _this.setData({
            totalMoney: temptotalMoney
        })


        // 只有等于0，才从购物车中删除
        if (tempLabelFoods[menutypeIndex].foods[foodIndex].foodCount == 0) {
            let tempselectFoodsIndex = _this.data.selectedFoodsIndex


            tempselectFoodsIndex[menutypeIndex] = tempselectFoodsIndex[menutypeIndex].filter(item => {
                return item != foodIndex
            })

            _this.setData({
                selectedFoodsIndex: tempselectFoodsIndex
            })
        }
        console.log('_this.data.selectedFoodsIndex', _this.data.selectedFoodsIndex)

    },
    // 点击加号，将餐品加一
    handleAddfood(e) {
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index
        let _this = this

        let tempLabelFoods = _this.data.foods

        console.log('_this.data.foods', _this.data.foods)


        // 考虑库存和限购
        let canAddFlag = true

        if (tempLabelFoods[menutypeIndex].foods[foodIndex].stock != null) { //说明有库存
            let tempstock = tempLabelFoods[menutypeIndex].foods[foodIndex].stock
            let tempfoodCount = tempLabelFoods[menutypeIndex].foods[foodIndex].foodCount
            if ((tempstock.homebuyingRestrictions != null) && (tempfoodCount >= tempstock.homebuyingRestrictions)) {
                wx.showToast({
                    title: '限购' + tempstock.homebuyingRestrictions + '份',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
            if ((tempstock.stockLeftNum != null) && (tempfoodCount >= tempstock.stockLeftNum)) {
                wx.showToast({
                    title: '库存不足',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
        }

        if (canAddFlag) { // 说明可以再点餐

            tempLabelFoods[menutypeIndex].foods[foodIndex].foodCount += 1 // 需不需要判断库存

            let tempFoodTotalPrice = tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalPrice
            tempFoodTotalPrice = parseFloat(parseFloat(tempFoodTotalPrice + parseFloat(tempLabelFoods[menutypeIndex].foods[foodIndex].foodPrice)).toFixed(2))
            tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalPrice = tempFoodTotalPrice

            let tempFoodTotalOriginalPrice = tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalOriginalPrice
            tempFoodTotalOriginalPrice = parseFloat(parseFloat(tempFoodTotalOriginalPrice + parseFloat(tempLabelFoods[menutypeIndex].foods[foodIndex].foodOriginalPrice)).toFixed(2))
            tempLabelFoods[menutypeIndex].foods[foodIndex].foodTotalOriginalPrice = tempFoodTotalOriginalPrice

            _this.setData({
                foods: tempLabelFoods
            })
            console.log('_this.data.foods', tempLabelFoods)
            let temptotalCount = _this.data.totalCount

            temptotalCount += 1 //购物车中总数加1
            _this.setData({
                totalCount: temptotalCount
            })

            // 在加1减1的时候就计算总价吗？？
            let temptotalMoney = _this.data.totalMoney
            temptotalMoney = parseFloat((parseFloat(temptotalMoney) + parseFloat(tempLabelFoods[menutypeIndex].foods[foodIndex].foodPrice)).toFixed(2)) //加上标签价格
            _this.setData({
                totalMoney: temptotalMoney
            })


            // 只有等于1，才添加到购物车
            if (tempLabelFoods[menutypeIndex].foods[foodIndex].foodCount == 1) {
                // 应该也不会添加几个的，先这么写写吧，不晓得对不对
                let tempselectFoodsIndex = _this.data.selectedFoodsIndex
                if (tempselectFoodsIndex[menutypeIndex] == undefined) {
                    tempselectFoodsIndex[menutypeIndex] = []
                }
                tempselectFoodsIndex[menutypeIndex].push(foodIndex)
                _this.setData({
                    selectedFoodsIndex: tempselectFoodsIndex
                })
            }
            console.log('_this.data.selectedFoodsIndex', _this.data.selectedFoodsIndex)
        }
    },
    // 点击购物车图标
    handleClickBox() {
        let _this = this
        let tempboxActiveFlag = _this.data.boxActiveFlag
        tempboxActiveFlag = !tempboxActiveFlag
        _this.setData({
            boxActiveFlag: tempboxActiveFlag
        })

        _this.setData({
            realTotalMoney: parseFloat((parseFloat(_this.data.totalMoney) - parseFloat(_this.data.totalMoneyRealDeduction)).toFixed(2))
        })
        console.log('_this.data.foods', _this.data.foods)
    },
    getSelectedFoods() {
        let _this = this
        let tempselectedfoods = []
        let tempfoods = _this.data.foods
        let tempselectFoodsIndex = _this.data.selectedFoodsIndex
        console.log(' tempselectFoodsIndex', tempselectFoodsIndex) //zll明天继续 为什么里面有undefined？？？
        for (let x in tempselectFoodsIndex) {

            let onecategoryfoods = tempfoods[x].foods

            for (let i = 0; i < tempselectFoodsIndex[x].length; i++) {
                const onefood = onecategoryfoods[tempselectFoodsIndex[x][i]]
                if (onefood.foodCount > 0) {
                    tempselectedfoods.push(onefood)
                }

            }
        }

        console.log('selectedFoods', tempselectedfoods) //zll明天继续

        _this.setData({
            selectedFoods: tempselectedfoods
        })

        const order = _this.data.allData
            // order.mealDate = _this.data.allData.date
            // order.mealType = _this.data.allData.mealType
            // order.organizeMealLabel = _this.data.allData.organizeMealLabel

        order.foods = tempselectedfoods
        return order

    },

    goToMenuCommit() {
        if (this.data.totalCount > 0) {
            if (this.data.totalMoneyRealDeduction > this.data.totalMoney) {
                wx.showModal({
                    title: '未达餐标金额(¥' + this.data.totalMoneyRealDeduction + ')',
                    content: '未达餐标金额(¥' + this.data.totalMoneyRealDeduction + ')' + ',请继续选餐',
                    showCancel: false,
                    confirmText: '返回'
                })
            } else if (this.data.totalMoneyRealDeduction == 0 && this.data.totalMoney == 0) {
                wx.showModal({
                    title: '价格低于0.01',
                    content: '请继续选餐',
                    showCancel: false,
                    confirmText: '返回'
                })
            } else {
                const order = this.getSelectedFoods()
                wx.setStorage({
                    key: 'addfoodOrder',
                    data: order
                })
                console.log('addfoodOrder', order)
                wx.navigateTo({
                    url: '/pages/mine/addfoodconfirm/addfoodconfirm?totalMoney=' +
                        this.data.totalMoney + '&totalMoneyRealDeduction=' +
                        this.data.totalMoneyRealDeduction + '&realMoney=' +
                        parseFloat((parseFloat(this.data.totalMoney) - parseFloat(this.data.totalMoneyRealDeduction)).toFixed(2))
                })
            }
        }

    },
    onShow: function() {
        console.log('onShow')
        console.log(this.data.allData)
        console.log(this.data.foods)
    }
})