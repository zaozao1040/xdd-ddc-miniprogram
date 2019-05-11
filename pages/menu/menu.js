import { menu } from './today/today-model.js'
let menuModel = new menu()

Page({
    data: {
        // 因为是一天的订餐，所以下面的七个都是对象，格式都是{LUNCH:{},DINNER:{}}或者{LUNCH:[],DINNER:[]}
        allMenuData: [{}, {}, {}, {}, {}, {}, {}], // 返回的所有数据 //添加了每道菜 加入购物车的个数(foodCount)的餐品列表，foods应该是MenuData里的foods，即只包括类别和相应的菜
        allMenuDataCopy: [{}, {}, {}, {}, {}, {}, {}], //初始化为allMenuData，在清空购物车时，赋值给allMenuData

        activeDayIndex: 0, //当前被点击的日期的index

        selectedFoodsIndex: [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }], //选择的食物的 menutypeIndex和foodIndex ，以及选中的食物，选中的餐品的个数
        selectedFoodsIndexCopy: [{ count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }, { count: 0 }], //用于清空购物车copy的
        menuCountList: [{}, {}, {}, {}, {}, {}, {}], //每个category点了几个菜
        menuCountListCopy: [{}, {}, {}, {}, {}, {}, {}], //用于清空购物车

        getdataalready: false, //解决在没有从后台得到数据就做if判断并加载else的问题
        getdataalready2: false, //解决在没有从后台得到数据就做if判断并加载else的问题

        //订餐信息
        organizeMealTypeFlag: '', //企业可定的餐时
        mealTypeInfo: '', //当天企业可定的餐时是否可以预定及截止时间 
        mealTypeItem: '', // 选择的哪个时餐


        mealType: { LUNCH: '午餐', DINNER: '晚餐', BREAKFAST: '早餐', NIGHT: '夜宵' },


        menutypeActiveFlag: 0, //当前被点击的餐品类别 
        boxActiveFlag: false, //购物车的颜色，false时是灰色，true时有颜色
        totalCount: 0, // 购物车中物品个数
        totalMoney: 0, //购物车中菜品的总金额
        realTotalMoney: 0, // totalMoney-totalMoneyRealDeduction后得到的钱 

        timer: null,
        windowHeight: 0,
        scrollLintenFlag: true, //默认允许触发滚动事件
        showBackToTopFlag: false, //显示返回scroll顶部的标志
        scrollToView: 'id_0',
        selectedFoods: [], //选择的食物的 menutypeIndex和foodIndex

        totalMoneyRealDeduction: 0, //企业餐标一起减免的钱
        listHeight: [], //这个数组记录每个餐类的"之前所有餐类描述+所有具体餐品"的占用高度值 

        cartHeight: 100, //购物车的高度 设置为2/1windowHeight的高度，最高为2/1windowHeight的高度
        label_bottom: -1,
        cart_top: -1, //初始时设置底部购物车位置的top为负数，在购物车初显时计算其top坐标，以免计算多次
        cart_height: 0, //购物车的高度
        time_remind_height: 0, // 截止时间，倒计时的view的高度
        shakeshake: false,
        shakeTimer: null,

        // 购物车动画
        cartAnimationBottom: 0,
        cartAnimationHeight: 0,
        lazyShowImage: {}, //用于懒加载图片的
        lazyShowImageShowCount: 0,
        activeDayId: 'day0'
    },
    onLoad: function() {
        // 首先处理七天日期
        let _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        let a = wx.getStorageSync('timeInfo')
        let tmp_timeInfo = []
            // 直接根据序号做判断吗？
        a.dateFlag.forEach((item, index) => {
            let b = {}
            b.mealDate = item.mealDate
            let dd = item.mealDate.split("-")
            if (dd.length == 3) {
                b.mealDateShow = dd[1] + '/' + dd[2]
            }
            if (index == 0) {
                b.label = '今天'
            } else if (index == 1) {
                b.label = '明天'
            } else {
                // 周一到周天
                let day = (new Date(item.mealDate)).getDay()
                switch (day) {
                    case 0:
                        b.label = '星期天'
                        break;
                    case 1:
                        b.label = '星期一'
                        break;
                    case 2:
                        b.label = '星期二'
                        break;
                    case 3:
                        b.label = '星期三'
                        break;
                    case 4:
                        b.label = '星期四'
                        break;
                    case 5:
                        b.label = '星期五'
                        break;
                    case 6:
                        b.label = '星期六'
                        break;
                }
            }
            let c = {}
                // 餐时信息
            item.mealType.forEach(mealItem => {
                c[mealItem.mealType] = mealItem.mealTypeFlag
            })
            b.mealType = c
            tmp_timeInfo.push(b)
        })
        let tmp_organizeMealTypeFlag = wx.getStorageSync('organizeMealTypeFlag')
        this.setData({
            organizeMealTypeFlag: tmp_organizeMealTypeFlag,
            timeInfo: tmp_timeInfo
        })

        console.log('timeInfo', tmp_timeInfo)
            // 默认加载今天的第一个餐标吗？？

        if (tmp_organizeMealTypeFlag.length > 0) { //可能不大于0吗

            this.setData({
                    mealTypeItem: tmp_organizeMealTypeFlag[0]
                })
                // if (tmp_timeInfo[0].mealType[tmp_organizeMealTypeFlag[0]]) { //表示今天第一个餐时可点餐


            if (!this.data.allMenuData[this.data.activeDayIndex][this.data.mealTypeItem]) { //表示今天第一个餐时可点餐
                this.getTimeDataByResponse()

                // this.data.lazyTimer = setInterval(() => {
                //     if (this.data.allMenuData[this.activeDayIndex][this.data.mealTypeItem]) {
                //         // 懒加载 
                //         this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage', this.data.mealTypeItem)

                //         clearInterval(this.data.lazyTimer)
                //     }
                // }, 1000)
            }

            // }
        }

    },
    //懒加载
    lazyImg(_that, data, lazy_name, mealTypeItem) {
        for (let i = 0, len = data[mealTypeItem].length; i < len; i++) {
            for (let j = 0; j < data[mealTypeItem][i].length; j++) {
                //debugger
                const aa = wx.createIntersectionObserver()
                aa.relativeToViewport({
                    bottom: 20
                }).observe('#' + mealTypeItem + 'food' + i + j, (ret) => {
                    if (ret.intersectionRatio > 0) {

                        if (!data[mealTypeItem][i][j]) {
                            _that.data.lazyShowImageShowCount++
                        }
                        data[mealTypeItem][i][j] = true
                    }

                    // 总得加载完所有图片后就不执行这个lazyImg了吧，咋判断的
                    _that.setData({
                        [lazy_name]: data
                    })

                    // 我这里的 disconnect用的不对，具体哪不对，目前还不知道
                    //  if (_that.data.lazyShowImageShowCount >= _that.data.lazyShowImageCount) {
                    //      aa.disconnect()
                    //  }
                })
            }

        }
    },
    // 点击日期(e)
    changeActiveDay(e) {
        let a = e.currentTarget.dataset
        if (a) {
            let day = a.day
            this.setData({
                activeDayIndex: day,
                activeDayId: 'day' + (day > 2 ? day - 2 : 0)
            })
            if (!this.data.allMenuData[day][this.data.mealTypeItem]) {
                this.setData({
                    getdataalready: false
                })
                this.getTimeDataByResponse()
                    // this.data.lazyTimer = setInterval(() => {
                    //     if (this.data.allMenuData[this.data.activeDayIndex][this.data.mealTypeItem]) {
                    //         // 懒加载 
                    //         this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage', this.data.mealTypeItem)

                //         clearInterval(this.data.lazyTimer)
                //     }
                // }, 1000)
            }
        }
    },
    // 点击餐时
    handleChangeMealtypeActive(e) {
        let mealtypeitem = e.currentTarget.dataset.mealtypeitem
        this.setData({
            mealTypeItem: mealtypeitem
        })

        if (!this.data.allMenuData[this.data.activeDayIndex][mealtypeitem]) {
            this.setData({
                getdataalready: false
            })
            this.getTimeDataByResponse()
                // this.data.lazyTimer = setInterval(() => {
                //     if (this.data.allMenuData[this.data.activeDayIndex][this.data.mealTypeItem]) {
                //         // 懒加载 
                //         this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage', this.data.mealTypeItem)

            //         clearInterval(this.data.lazyTimer)
            //     }
            // }, 1000)
        }

    },

    /* 获取餐品menu信息 */
    getTimeDataByResponse: function() {
        wx.showLoading({
            title: '加载中'
        })


        let tmp_mealTypeItem = this.data.mealTypeItem
        let activeDayIndex = this.data.activeDayIndex
        let param = {
            arrangeDate: this.data.timeInfo[activeDayIndex].mealDate,
            mealType: tmp_mealTypeItem,
            userCode: wx.getStorageSync('userInfo').userCode,
        }
        let _this = this
        menuModel.getMenuData(param, function(res) { //获取加餐所有信息

            let resData = res //这是浅拷贝吧，不是深拷贝吧，所以这样和直接使用res的差别是什么？？
            resData.totalMoney = 0 //给每天的每个餐时一个点餐的总的金额
            resData.deductionMoney = 0 //给每天的每个餐时一个点餐的总的金额
                // 给每一个菜品添加一个foodCount，用于加号点击时加一减一
                // 给每一个菜品添加一个foodTotalPrice
                // 给每一个菜品添加一个foodTotalOriginalPrice
            let tmp_menuCountList = []
            let tmp_menuCountListCopy = []

            // 带lazy的都用于懒加载
            let tmp_lazyShowImage = _this.data.lazyShowImage
            tmp_lazyShowImage[tmp_mealTypeItem] = []
            let tmp_lazyShowImageCount = 0
            resData.foods.forEach(item => {

                let oneLazyShow = []
                item.foods.forEach(foodItem => {
                    foodItem.foodTotalPrice = 0
                    foodItem.foodTotalOriginalPrice = 0
                    foodItem.foodCount = 0
                    oneLazyShow.push(false)
                    tmp_lazyShowImageCount++
                })

                tmp_menuCountList.push(0)
                tmp_menuCountListCopy.push(0)

                tmp_lazyShowImage[tmp_mealTypeItem].push(oneLazyShow)
            })


            //可以不用setData，因为都是0不需要显示
            _this.data.menuCountList[activeDayIndex][tmp_mealTypeItem] = tmp_menuCountList
            _this.data.menuCountListCopy[activeDayIndex][tmp_mealTypeItem] = tmp_menuCountListCopy

            // 下面的复制会不会在allMenuData修改resData时，allMenuDataCopy也一起改变？
            let tmp_allData = _this.data.allMenuData
            tmp_allData[activeDayIndex][tmp_mealTypeItem] = resData
            _this.data.allMenuDataCopy[activeDayIndex][tmp_mealTypeItem] = JSON.parse(JSON.stringify(resData))

            _this.setData({
                allMenuData: tmp_allData, //保存下所有数据 
                getdataalready: true,
                lazyShowImage: tmp_lazyShowImage,
                lazyShowImageCount: tmp_lazyShowImageCount
            })


            if (res.orderFlag && res.foods.length !== 0) {

                // 计算购物车的高度
                const query2 = wx.createSelectorQuery()
                query2.select('#cartCount').boundingClientRect()
                query2.selectViewport().scrollOffset()
                query2.exec(function(res) {
                    if (res[0]) {
                        _this.setData({
                            cartAnimationBottom: res[0].bottom
                        })
                    }

                })
                _this.calculateHeight()
            }

            //  _this.lazyImg(_this, _this.data.lazyShowImage, 'lazyShowImage', _this.data.mealTypeItem)

            wx.hideLoading()
        })
    },
    // 计算购物车高度，大于最大高度就滚动
    calculteCartHeight() {
        let _this = this
        const query_1 = wx.createSelectorQuery()
        query_1.select('.cart_scrollPosition_forCalculate').boundingClientRect()
        query_1.selectViewport().scrollOffset()
        query_1.exec(function(res) {
            console.log('cart_scrollPosition_forCalculate', res)
            if (res[0] != null) {
                let cartMaxHeight = _this.data.windowHeight / 2
                if (res[0].height < cartMaxHeight) {
                    console.log('res[0].height', res[0].height)
                    console.log('_this.data.cartMaxHeight', cartMaxHeight)
                    _this.setData({
                        cartHeight: res[0].height
                    })
                } else {
                    _this.setData({
                        cartHeight: cartMaxHeight
                    })
                }
            }

        })
    },
    // 处理最外层的滚动，使
    handleMostOuterScroll(e) {
        let _this = this
        if (e.detail.scrollTop >= 40) { //大于等于40就显示
            wx.setNavigationBarTitle({
                title: '预约' + _this.data.timeInfo[_this.data.activeDayIndex].label + " " + _this.data.mealType[_this.data.mealTypeItem]
            })
        } else {
            wx.setNavigationBarTitle({
                title: ''
            })
        }
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

            // 应该是执行滚动才执行加载，而且不是遍历全部，是遍历出现在屏幕中的就行了呀
            // 而且在已经是true的就不需要再变为false了
            //this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage', this.data.mealTypeItem)

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
        this.setData({
            totalCount: 0,
            totalMoney: 0,
            totalMoneyRealDeduction: 0,
            boxActiveFlag: false,
            selectedFoodsIndex: this.data.selectedFoodsIndexCopy,
            allMenuData: this.data.allMenuDataCopy,
            menuCountList: this.data.menuCountListCopy
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
        let tmp_mealTypeItem = this.data.mealTypeItem
        let activeDayIndex = this.data.activeDayIndex
        let tmp_oneFood = this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].foods[foodIndex]
            //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
            // 应该是下面所有的操作都是在减1之后
        if (tmp_oneFood.foodCount > 0) {

            tmp_oneFood.foodCount -= 1
            this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].foods[foodIndex] = tmp_oneFood
                // 总的数目减1
            let temptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[activeDayIndex][tmp_mealTypeItem][menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整

            // let temptotalMoney = this.data.totalMoney
            // temptotalMoney = parseFloat((parseFloat(temptotalMoney) - parseFloat(tmpFoods.foodPrice)).toFixed(2))  
            // this.setData({
            //     totalMoney: temptotalMoney
            // })

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[activeDayIndex][tmp_mealTypeItem]
            currnt_menuData.totalMoney -= tmp_oneFood.foodPrice
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealLabelFlag && currnt_menuData.organizeMealLabel > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.totalMoney < currnt_menuData.organizeMealLabel) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.organizeMealLabel
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = new_deduction

            console.log('sevenMenuData', this.data.allMenuData)

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0

            this.setData({
                allMenuData: this.data.allMenuData,
                totalCount: temptotalCount,
                menuCountList: tmp_menuCountList,
                totalMoney: parseFloat(tmptotalMoney.toFixed(2)),
                realTotalMoney: parseFloat(tmp_realTotalMoney.toFixed(2)),
                totalMoneyRealDeduction: tmp_totalMoneyRealDeduction
            })

            // 只有等于0，才从购物车中删除
            if (tmp_oneFood.foodCount == 0) {
                let tempselectFoodsIndex = this.data.selectedFoodsIndex
                tempselectFoodsIndex[activeDayIndex].count -= 1 //当天的总的个数减1
                tempselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex] = tempselectFoodsIndex[tmp_mealTypeItem].foods[menutypeIndex].filter(item => {
                    return item != foodIndex
                })

                this.setData({
                    selectedFoodsIndex: tempselectFoodsIndex
                })
            } else {
                let tempselectFoodsIndex = this.data.selectedFoodsIndex
                tempselectFoodsIndex[activeDayIndex].count -= 1 //当天的总的个数减1 
                this.setData({
                    selectedFoodsIndex: tempselectFoodsIndex
                })
            }
        }
    },
    // 点击加号，将餐品加一
    handleAddfood(e) {
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index 
        let activeDayIndex = this.data.activeDayIndex
            //被点击的那道菜，不知道要不要做是否为空判断
        let tmp_oneFood = this.data.allMenuData[activeDayIndex][this.data.mealTypeItem].foods[menutypeIndex].foods[foodIndex]

        // 考虑库存和限购
        let canAddFlag = true

        if (tmp_oneFood.stock) { //说明有库存 要不要判断不为0啊
            let tmpstock = tmp_oneFood.stock
            let tmpfoodCount = tmp_oneFood.foodCount
            if (tmpstock.homebuyingRestrictions && (tmpfoodCount >= tmpstock.homebuyingRestrictions)) {
                wx.showToast({
                    title: '限购' + tempstock.homebuyingRestrictions + '份',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
            if (tmpstock.stockLeftNum && tmpfoodCount >= tempstock.stockLeftNum) {
                wx.showToast({
                    title: '库存不足',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
        }

        if (canAddFlag) {

            // 说明可以再点餐
            // 应该是先menu那增1，然后动画过去，然后购物车那里增1
            let tmp_mealTypeItem = this.data.mealTypeItem
            tmp_oneFood.foodCount += 1 // 需不需要判断库存

            // 先menu增1
            this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].foods[foodIndex] = tmp_oneFood
            this.setData({
                    allMenuData: this.data.allMenuData
                })
                // 然后动画

            let _this = this
            const query = wx.createSelectorQuery()
            query.select('#add' + menutypeIndex + foodIndex).boundingClientRect()
            query.selectViewport().scrollOffset()
            query.exec(function(res) {
                if (res[0]) {
                    let bottom = res[0].bottom
                    _this.setData({
                        cartAnimationHeight: _this.data.cartAnimationBottom - bottom
                    })
                }
                console.log('#add' + menutypeIndex + foodIndex, res)

            })

            this.setData({
                shakeshake: true
            })
            if (!this.data.shakeTimer) {
                clearTimeout(this.data.shakeTimer)
            }

            this.data.shakeTimer = setTimeout(function() {
                _this.setData({
                    shakeshake: false
                })
            }, 1000)

            let tmptotalCount = this.data.totalCount + 1 //购物车中总数加1 
            this.setData({
                totalCount: tmptotalCount
            })

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[activeDayIndex][tmp_mealTypeItem][menutypeIndex] += 1
            this.setData({
                menuCountList: tmp_menuCountList
            })


            // 是不是应该把所有的setData合并啊，这样一次一次调用是不是更花时间
            // 只有等于1，才添加到购物车
            let tmpselectFoodsIndex = this.data.selectedFoodsIndex
            if (tmp_oneFood.foodCount == 1) {
                // 应该也不会添加几个的，先这么写写吧，不晓得对不对  
                //是不是应该把selectedFoodsIndex和allMenuData合并啊
                if (!this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem]) {
                    let tmp = {}
                    tmp.name = this.data.mealType[tmp_mealTypeItem]
                    tmp.foods = []
                    this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem] = tmp

                    let tmp_copy = {}
                    tmp_copy.name = this.data.mealType[tmp_mealTypeItem]
                    tmp_copy.foods = []
                    this.data.selectedFoodsIndexCopy[activeDayIndex][tmp_mealTypeItem] = tmp_copy
                }


                if (!tmpselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex]) {
                    tmpselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex] = []
                }
                tmpselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].push(foodIndex)

            }
            tmpselectFoodsIndex[activeDayIndex].count += 1
            this.setData({
                selectedFoodsIndex: tmpselectFoodsIndex
            })

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney + tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[activeDayIndex][tmp_mealTypeItem]
            currnt_menuData.totalMoney += tmp_oneFood.foodPrice
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealLabelFlag && currnt_menuData.organizeMealLabel > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.totalMoney < currnt_menuData.organizeMealLabel) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.organizeMealLabel
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = new_deduction

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0


            this.setData({
                totalMoney: parseFloat(tmptotalMoney.toFixed(2)),
                realTotalMoney: parseFloat(tmp_realTotalMoney.toFixed(2)),
                totalMoneyRealDeduction: tmp_totalMoneyRealDeduction
            })
        }
    },
    // 点击购物车图标
    handleClickBox() {
        if (this.data.totalCount > 0) {

            this.setData({
                boxActiveFlag: !this.data.boxActiveFlag
            })
            if (this.data.boxActiveFlag) { //获取计算购物车的scroll的高度所必须的参数top_1  
                this.getSelectedFoods()
                this.calculteCartHeight()
            }
        }

    },
    // 在点击购物车图标查看购物车或者点击去结算时，计算菜单信息
    getSelectedFoods() {

        let tmpselectFoodsIndex = this.data.selectedFoodsIndex


        let tmp_allData = this.data.allMenuData
        let tmp_organizeMealTypeFlag = this.data.organizeMealTypeFlag

        // 是1到7吗？
        for (let day = 0; day < 7; day++) {
            if (tmpselectFoodsIndex[day].count > 0) {
                for (let i in tmp_organizeMealTypeFlag) { // x 为餐时 
                    let tmpselectedfoods = []
                    let x = tmp_organizeMealTypeFlag[i]
                    if (tmpselectFoodsIndex[day][x]) {
                        for (let y in tmpselectFoodsIndex[day][x].foods) { // y 为选择的餐品index 
                            let onecategoryfoods = tmp_allData[day][x].foods[y].foods
                            for (let i = 0; i < tmpselectFoodsIndex[day][x].foods[y].length; i++) {
                                const onefood = onecategoryfoods[tmpselectFoodsIndex[day][x].foods[y][i]]
                                if (onefood.foodCount > 0) {
                                    onefood.menuItemIndex = parseInt(y)
                                    onefood.foodIndex = tmpselectFoodsIndex[day][x].foods[y][i]
                                        // totalPrice只有在购物车列表和订单信息那里才需要展示，所以在menu列表那边add和minus时不需要写
                                        //不需要的时候就不要计算
                                    onefood.foodTotalPrice = parseFloat((onefood.foodPrice * onefood.foodCount).toFixed(2))
                                    onefood.foodTotalOriginalPrice = parseFloat((onefood.foodOriginalPrice * onefood.foodCount).toFixed(2))
                                    tmpselectedfoods.push(onefood)
                                }
                            }
                        }
                        tmpselectFoodsIndex[day][x].selectedFoods = tmpselectedfoods
                            //这个deductionMoney会不会不存在？需要先判断吗？不存在就让deductionMoney=0
                            //TODO--5/6
                        tmpselectFoodsIndex[day][x].deductionMoney = this.data.allMenuData[day][x].deductionMoney
                    }
                }
            }

        }

        console.log('timeInfo', this.data.timeInfo)
        this.setData({
            selectedFoodsIndex: tmpselectFoodsIndex
        })

    },
    // 点击减号，将餐品减一
    handleCartMinusfood(e) {
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index
        let tmp_mealTypeItem = e.currentTarget.dataset.mealtypeitem
        let tmp_selectedFoodIndex = e.currentTarget.dataset.selectedfoodindex
        let activeDayIndex = e.currentTarget.dataset.dayindex
        let tmp_oneFood = this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].foods[foodIndex]
            //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
            // 应该是下面所有的操作都是在减1之后
        if (tmp_oneFood.foodCount > 0) {
            tmp_oneFood.foodCount -= 1


            this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].foods[foodIndex] = tmp_oneFood
                // 总的数目减1
            let tmptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[activeDayIndex][tmp_mealTypeItem][menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整


            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[activeDayIndex][tmp_mealTypeItem]
            currnt_menuData.totalMoney -= tmp_oneFood.foodPrice
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealLabelFlag && currnt_menuData.organizeMealLabel > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.totalMoney < currnt_menuData.organizeMealLabel) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.organizeMealLabel
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = new_deduction

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0


            // 购物车中的减1
            let tmp_selectedFood = this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount--;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice - tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice - tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood
            this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem].deductionMoney = new_deduction


            this.setData({
                allMenuData: this.data.allMenuData,
                totalCount: tmptotalCount,
                menuCountList: tmp_menuCountList,
                totalMoney: parseFloat(tmptotalMoney.toFixed(2)),
                realTotalMoney: parseFloat(tmp_realTotalMoney.toFixed(2)),
                totalMoneyRealDeduction: tmp_totalMoneyRealDeduction,
                selectedFoodsIndex: this.data.selectedFoodsIndex
            })


            // 只有等于0，才从购物车中删除
            // 是不是也不用删除，我都判断了
            let tempselectFoodsIndex = this.data.selectedFoodsIndex
            if (tmp_oneFood.foodCount == 0) {
                tempselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex] = tempselectFoodsIndex[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].filter(item => {
                    return item != foodIndex
                })
            }

            tempselectFoodsIndex[activeDayIndex].count--; //需要判断可减吗
            this.setData({
                selectedFoodsIndex: tempselectFoodsIndex
            })


            if (tmptotalCount == 0) {
                this.setData({
                    boxActiveFlag: false
                })
            }
            // 重新计算购物车的高度
            else if (tmp_selectedFood.foodCount == 0) {
                this.calculteCartHeight()
            }
        }

    },
    // 点击加号，将餐品加一
    handleCartAddfood(e) {
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index 
        let tmp_mealTypeItem = e.currentTarget.dataset.mealtypeitem
        let tmp_selectedFoodIndex = e.currentTarget.dataset.selectedfoodindex

        let activeDayIndex = e.currentTarget.dataset.dayindex
            //被点击的那道菜，不知道要不要做是否为空判断
        let tmp_oneFood = this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].foods[foodIndex]

        // 考虑库存和限购
        let canAddFlag = true

        if (tmp_oneFood.stock) { //说明有库存 要不要判断不为0啊
            let tmpstock = tmp_oneFood.stock
            let tmpfoodCount = tmp_oneFood.foodCount
            if (tmpstock.homebuyingRestrictions && (tmpfoodCount >= tmpstock.homebuyingRestrictions)) {
                wx.showToast({
                    title: '限购' + tempstock.homebuyingRestrictions + '份',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
            if (tmpstock.stockLeftNum && tmpfoodCount >= tempstock.stockLeftNum) {
                wx.showToast({
                    title: '库存不足',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
        }

        if (canAddFlag) { // 说明可以再点餐

            tmp_oneFood.foodCount += 1 // 需不需要判断库存

            let tmpFoodTotalPrice = tmp_oneFood.foodTotalPrice
                //需要好好看看parseFloat,后面优化parseFloat相关内容
            tmpFoodTotalPrice = parseFloat(parseFloat(tmpFoodTotalPrice + parseFloat(tmp_oneFood.foodPrice)).toFixed(2))
            tmp_oneFood.foodTotalPrice = tmpFoodTotalPrice

            let tmpFoodTotalOriginalPrice = tmp_oneFood.foodTotalOriginalPrice
            tmpFoodTotalOriginalPrice = parseFloat(parseFloat(tmpFoodTotalOriginalPrice + parseFloat(tmp_oneFood.foodOriginalPrice)).toFixed(2))
            tmp_oneFood.foodTotalOriginalPrice = tmpFoodTotalOriginalPrice

            this.data.allMenuData[activeDayIndex][tmp_mealTypeItem].foods[menutypeIndex].foods[foodIndex] = tmp_oneFood
            this.setData({
                allMenuData: this.data.allMenuData
            })

            let tmptotalCount = this.data.totalCount + 1 //购物车中总数加1 
            this.setData({
                totalCount: tmptotalCount
            })

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[activeDayIndex][tmp_mealTypeItem][menutypeIndex] += 1
            this.setData({
                menuCountList: tmp_menuCountList
            })

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney + tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[activeDayIndex][tmp_mealTypeItem]
            currnt_menuData.totalMoney += tmp_oneFood.foodPrice
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealLabelFlag && currnt_menuData.organizeMealLabel > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.totalMoney < currnt_menuData.organizeMealLabel) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.organizeMealLabel
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = new_deduction

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0
                // 购物车中被增1的增1
            let tmp_selectedFood = this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount++;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice + tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice + tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood
            this.data.selectedFoodsIndex[activeDayIndex][tmp_mealTypeItem].deductionMoney = new_deduction

            this.data.selectedFoodsIndex[activeDayIndex].count++; //当天总的个数加1
            this.setData({
                totalMoney: parseFloat(tmptotalMoney.toFixed(2)),
                realTotalMoney: parseFloat(tmp_realTotalMoney.toFixed(2)),
                totalMoneyRealDeduction: tmp_totalMoneyRealDeduction,
                selectedFoodsIndex: this.data.selectedFoodsIndex
            })

        }
    },

    //验证未达餐标情况
    verifyMealLabel() {

        // 这个selectedFoodsIndex是立即变的吗？是在多加道菜的时候就会变的吗？5/6
        let flag = true
        for (let i = 0; i < this.data.allMenuData.length; i++) {
            let item = this.data.allMenuData[i]
            if (!flag) {
                break
            }
            for (let meal in item) {
                if (!flag) {
                    break
                }
                // 是这么判断的吗？ 5/6
                //1.餐标可用 2.当天当餐点餐了，用总价判断点餐没是否不妥？3.不能低于餐标 4.抵扣金额小于企业餐标
                if (item[meal].mealLabelFlag && item[meal].totalMoney && item[meal].totalMoney > 0 && !item[meal].lowerThanMealLabelFlag && item[meal].deductionMoney < item[meal].organizeMealLabel) {
                    wx.showModal({
                        title: this.data.timeInfo[i].label + ' ' + this.data.mealType[meal],
                        content: '未达餐标金额(¥' + item[meal].organizeMealLabel + ')' + ',请继续选餐',
                        showCancel: false,
                        confirmText: '返回'
                    })
                    this.setData({
                        activeDayIndex: i,
                        mealTypeItem: meal
                    })
                    flag = false
                }

            }

        }
        return flag
    },

    goToMenuCommit() {
        console.log('this.data.allMenuData', this.data.allMenuData)
        let flag = this.verifyMealLabel()

        if (flag) {
            this.getSelectedFoods() //不需要执行多次吧。好像需要的哦。

            //我用的变量是不是过于多了，timeInfo,selectedFoodsIndex是不是可以直接放在allMenuData里？
            //TODO--5/6
            for (let i = 0; i < this.data.timeInfo.length; i++) {
                this.data.selectedFoodsIndex[i].appointment = this.data.timeInfo[i].label
                this.data.selectedFoodsIndex[i].mealDate = this.data.timeInfo[i].mealDate
                let onededuction = 0
                for (let j = 0; j < this.data.organizeMealTypeFlag.length; j++) {
                    // 应该只要有，就会有这天这餐的抵扣了吧--5/6
                    if (this.data.selectedFoodsIndex[i][this.data.organizeMealTypeFlag[j]]) {
                        onededuction += this.data.selectedFoodsIndex[i][this.data.organizeMealTypeFlag[j]].deductionMoney
                    }
                }
                this.data.selectedFoodsIndex[i].deductionMoney = parseFloat(onededuction.toFixed(2))

            }
            wx.setStorageSync('sevenSelectedFoods', this.data.selectedFoodsIndex)
            console.log('sevenSelectedFoods', this.data.selectedFoodsIndex)
            wx.navigateTo({
                url: '/pages/menu/today/confirm/confirm?totalMoney=' +
                    this.data.totalMoney + '&totalMoneyRealDeduction=' +
                    this.data.totalMoneyRealDeduction + '&realMoney=' + this.data.realTotalMoney + '&orderType=seven'
            })
        }

    },
    onShow: function() {
        console.log('onShow')
        console.log(this.data.allMenuData)
        console.log(this.data.foods)
    },
    // 关闭
    handleCloseCart() {
        this.setData({
            boxActiveFlag: false
        })
    },
    //用于解决小程序的遮罩层滚动穿透
    preventTouchMove: function() {

    },
    /* 菜品详情 */
    handleGotoFoodDetail: function(e) {
        wx.navigateTo({
            url: '/pages/food/food?dateId=' + e.currentTarget.dataset.dateid,
        })
    },
})