import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({
    data: {
        // 因为是一天的订餐，所以下面的七个都是对象，格式都是{LUNCH:{},DINNER:{}}或者{LUNCH:[],DINNER:[]}
        allMenuData: {}, // 返回的所有数据 //添加了每道菜 加入购物车的个数(foodCount)的餐品列表，foods应该是MenuData里的foods，即只包括类别和相应的菜
        allMenuDataCopy: {}, //初始化为allMenuData，在清空购物车时，赋值给allMenuData

        selectedFoodsIndex: {}, //选择的食物的 menutypeIndex和foodIndex ，以及选中的食物，选中的餐品的个数
        selectedFoodsIndexCopy: {}, //用于清空购物车copy的
        menuCountList: {}, //每个category点了几个菜
        menuCountListCopy: {}, //用于清空购物车

        getdataalready: false, //解决在没有从后台得到数据就做if判断并加载else的问题

        //订餐信息 
        mealTypeInfo: '', //当天企业可定的餐时是否可以预定及截止时间 

        menutypeActiveFlag: 0, //当前被点击的餐品类别 
        boxActiveFlag: false, //购物车的颜色，false时是灰色，true时有颜色
        totalCount: 0, // 购物车中物品个数
        totalMoney: 0, //购物车中菜品的总金额
        realTotalMoney: 0, // totalMoney-totalMoneyRealDeduction后得到的钱 

        timer: null,
        windowHeight: 0,
        scrollLintenFlag: true, //默认允许触发滚动事件

        scrollToView: 'id_0',

        totalMoneyRealDeduction: 0, //企业餐标一起减免的钱
        listHeight: [], //这个数组记录每个餐类的"之前所有餐类描述+所有具体餐品"的占用高度值 

        cartHeight: 100, //购物车的高度 设置为2/1windowHeight的高度，最高为2/1windowHeight的高度

        shakeshake: false,
        shakeTimer: null,

        // 购物车动画
        cartAnimationBottom: 0,
        cartAnimationHeight: 0,
        lazyShowImage: [], //用于懒加载图片的 
        // 懒加载

        mealEnglistLabel: ['breakfast', 'lunch', 'dinner', 'night'],
        mealTypeSmall: { lunch: '午餐', dinner: '晚餐', breakfast: '早餐', night: '夜宵' },
    },
    onLoad: function(options) {
        let _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        requestModel.getUserInfo(userInfo => {
            console.log('userInfo', userInfo)
            let { userType, orgAdmin } = userInfo
            if (userType == 'ORG_ADMIN' && orgAdmin == true) {
                _this.setData({
                    orgAdmin: true
                })
            } else {
                _this.setData({
                    orgAdmin: false
                })
            }

        }, true)


        this.getTimeDataByResponse()

        this.data.lazyTimer = setInterval(() => {
            if (this.data.allMenuData) {
                // 懒加载 
                this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage')

                clearInterval(this.data.lazyTimer)
            }
        }, 1000)


    },
    //懒加载
    lazyImg(_that, data, lazy_name) {

        for (let i = 0, len = data.length; i < len; i++) {
            for (let j = 0; j < data[i].length; j++) {

                wx.createIntersectionObserver().relativeToViewport({
                    bottom: 20
                }).observe('#food' + i + j, (ret) => {

                    if (ret.intersectionRatio > 0) {
                        data[i][j] = true
                    }
                    // 总得加载完所有图片后就不执行这个lazyImg了吧，咋判断的
                    _that.setData({
                        [lazy_name]: data
                    })
                })

            }
        }
    },



    /* 获取餐品menu信息 */
    getTimeDataByResponse: function() {

        let _this = this

        let param = {
            url: '/food/getFoodDateSupplementList?userCode=' + wx.getStorageSync('userCode')
                // url: '/food/getFoodDateList?userCode=USER546379217957421056&mealDate=2019-05-20&mealType=LUNCH'

        }
        requestModel.request(param, resData => { //获取加餐所有信息
            if (resData.mealType.orderStatus) {


                //这是浅拷贝吧，不是深拷贝吧，所以这样和直接使用res的差别是什么？？
                resData.totalMoney = 0 //给每天的每个餐时一个点餐的总的金额
                resData.totalMoney_meal = 0 //可使用餐标的餐的总价格
                resData.deductionMoney = 0
                    // 给每一个菜品添加一个foodCount，用于加号点击时加一减一
                    // 给每一个菜品添加一个foodTotalPrice
                    // 给每一个菜品添加一个foodTotalOriginalPrice
                let tmp_menuCountList = []
                let tmp_menuCountListCopy = []

                // 带lazy的都用于懒加载
                let tmp_lazyShowImage = _this.data.lazyShowImage


                resData.foodList.forEach(item => {

                    let oneLazyShow = []
                    item.foodList.forEach(foodItem => {
                        foodItem.foodTotalPrice = 0
                        foodItem.foodTotalOriginalPrice = 0
                        foodItem.foodCount = 0
                        oneLazyShow.push(false)

                    })

                    tmp_menuCountList.push(0)
                    tmp_menuCountListCopy.push(0)

                    tmp_lazyShowImage.push(oneLazyShow)
                })


                //可以不用setData，因为都是0不需要显示
                _this.data.menuCountList = tmp_menuCountList
                _this.data.menuCountListCopy = tmp_menuCountListCopy

                let tmp_selectedFoodsIndex = {}
                tmp_selectedFoodsIndex.foodList = []
                tmp_selectedFoodsIndex.selectedFoods = []
                _this.data.selectedFoodsIndex = tmp_selectedFoodsIndex
                _this.data.selectedFoodsIndexCopy = tmp_selectedFoodsIndex


                _this.setData({
                    allMenuData: resData, //保存下所有数据
                    allMenuDataCopy: resData, //保存下所有数据

                    lazyShowImage: tmp_lazyShowImage,
                    mealTypeItem: resData.mealType.mealType,
                    mealDate: resData.mealType.mealDate,
                    mealTypeItemShow: _this.data.mealTypeSmall[resData.mealType.mealType.toLowerCase()]
                })



                if (resData.mealType.orderStatus && resData.foodList.length !== 0) {

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
                        console.log('#add-cart', res)

                    })
                    _this.calculateHeight()
                }
            }
            _this.setData({
                getdataalready: true
            })
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
                console.log('cartHeight', _this.data.cartHeight)
            }

        })
    },
    // 处理最外层的滚动，使
    handleMostOuterScroll(e) {

        if (e.detail.scrollTop >= 40) { //大于等于40就显示
            wx.setNavigationBarTitle({
                title: '预约补餐 ' + this.data.mealTypeItemShow
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
        let _this = this

        if (this.data.scrollLintenFlag) { //允许触发滚动事件，才执行滚动事件

            // 应该是执行滚动才执行加载，而且不是遍历全部，是遍历出现在屏幕中的就行了呀
            // 而且在已经是true的就不需要再变为false了 
            let scrollY = e.detail.scrollTop
            let listHeightLength = _this.data.listHeight.length
            for (let i = 0; i < listHeightLength; i++) {
                let height1 = _this.data.listHeight[i]
                let height2 = _this.data.listHeight[i + 1]; //listHeight[length]返回undefined,所以可以用!height2做判断不是最后一个
                if (scrollY >= height1 - 1 && scrollY < height2) {
                    if (i != _this.data.menutypeActiveFlag) {
                        _this.setData({
                            menutypeActiveFlag: i
                        })
                    }
                }
            }
        }
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

        console.log('allMenuDataCopy', this.data.allMenuDataCopy)
        console.log('menuCountListCopy', this.data.menuCountListCopy)
        console.log('selectedFoodsIndexCopy', this.data.selectedFoodsIndexCopy)
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

        let tmp_oneFood = this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex]
            //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
            // 应该是下面所有的操作都是在减1之后
        if (tmp_oneFood.foodCount > 0) {
            tmp_oneFood.foodCount -= 1
            this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
                // 总的数目减1
            let temptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整



            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData
            currnt_menuData.totalMoney -= tmp_oneFood.foodPrice
            if (tmp_oneFood.canMeal) { //可使用餐标
                currnt_menuData.totalMoney_meal -= tmp_oneFood.foodPrice
            }
            // 这种每次重新计算的方法好吗
            let new_deduction = 0
                //如果是企业管理员
            if (this.data.orgAdmin) {
                new_deduction = currnt_menuData.totalMoney
            } else {
                if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0 
                    // 动态显示抵扣多少钱的，奇怪的要求 5/17
                    if (currnt_menuData.totalMoney_meal < currnt_menuData.mealType.standardPrice) {
                        new_deduction = currnt_menuData.totalMoney_meal
                    } else {
                        new_deduction = currnt_menuData.mealType.standardPrice
                    }
                }
            }
            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = parseFloat(new_deduction.toFixed(2))

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

                tempselectFoodsIndex.foodList[menutypeIndex] = tempselectFoodsIndex.foodList[menutypeIndex].filter(item => {
                    return item != foodIndex
                })

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

        //被点击的那道菜，不知道要不要做是否为空判断
        let tmp_oneFood = this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex]

        // 考虑库存和限购
        let canAddFlag = true

        if (tmp_oneFood.foodQuota) { //说明有库存 要不要判断不为0啊
            let tmpstock = tmp_oneFood.foodQuota
            let tmpfoodCount = tmp_oneFood.foodCount
            if (tmpstock.quotaNum && (tmpfoodCount >= tmpstock.quotaNum)) {
                wx.showToast({
                    title: '限购' + tmpstock.quotaNum + '份',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
            if (tmpstock.surplusNum && tmpfoodCount >= tmpstock.surplusNum) {
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

            tmp_oneFood.foodCount += 1 // 需不需要判断库存

            // 先menu增1
            this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood

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
            tmp_menuCountList[menutypeIndex] += 1
            this.setData({
                menuCountList: tmp_menuCountList
            })


            // 是不是应该把所有的setData合并啊，这样一次一次调用是不是更花时间
            // 只有等于1，才添加到购物车
            if (tmp_oneFood.foodCount == 1) {
                // 应该也不会添加几个的，先这么写写吧，不晓得对不对  
                //是不是应该把selectedFoodsIndex和allMenuData合并啊

                let tmpselectFoodsIndex = this.data.selectedFoodsIndex


                if (!tmpselectFoodsIndex.foodList[menutypeIndex]) {
                    tmpselectFoodsIndex.foodList[menutypeIndex] = []
                }
                tmpselectFoodsIndex.foodList[menutypeIndex].push(foodIndex)
                this.setData({
                    selectedFoodsIndex: tmpselectFoodsIndex
                })
            }

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney + tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData
            currnt_menuData.totalMoney += tmp_oneFood.foodPrice

            if (tmp_oneFood.canMeal) { //可使用餐标
                currnt_menuData.totalMoney_meal += tmp_oneFood.foodPrice
            }

            // 这种每次重新计算的方法好吗
            let new_deduction = 0
                //如果是企业管理员
            if (this.data.orgAdmin) {
                new_deduction = currnt_menuData.totalMoney
            } else {
                if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0 
                    if (currnt_menuData.totalMoney_meal < currnt_menuData.mealType.standardPrice) {
                        new_deduction = currnt_menuData.totalMoney_meal
                    } else {
                        new_deduction = currnt_menuData.mealType.standardPrice
                    }
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = parseFloat(new_deduction.toFixed(2))

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0


            this.setData({
                allMenuData: this.data.allMenuData,
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

        let tmpselectedfoods = []


        for (let y in tmpselectFoodsIndex.foodList) { // y 为选择的餐品index 
            let onecategoryfoods = tmp_allData.foodList[y].foodList
            for (let i = 0; i < tmpselectFoodsIndex.foodList[y].length; i++) {
                const onefood = onecategoryfoods[tmpselectFoodsIndex.foodList[y][i]]
                if (onefood.foodCount > 0) {
                    onefood.menuItemIndex = parseInt(y)
                    onefood.foodIndex = tmpselectFoodsIndex.foodList[y][i]
                        // totalPrice只有在购物车列表和订单信息那里才需要展示，所以在menu列表那边add和minus时不需要写
                        //不需要的时候就不要计算
                    onefood.foodTotalPrice = parseFloat((onefood.foodPrice * onefood.foodCount).toFixed(2))
                    onefood.foodTotalOriginalPrice = parseFloat((onefood.foodOriginalPrice * onefood.foodCount).toFixed(2))
                    tmpselectedfoods.push(onefood)
                }
            }
        }
        tmpselectFoodsIndex.selectedFoods = tmpselectedfoods
        tmpselectFoodsIndex.deductionMoney = this.data.allMenuData.deductionMoney
        tmpselectFoodsIndex.payMoney = parseFloat((this.data.allMenuData.totalMoney - this.data.allMenuData.deductionMoney).toFixed(2))



        this.setData({
            selectedFoodsIndex: tmpselectFoodsIndex
        })
        console.log('tmpselectFoodsIndex', tmpselectFoodsIndex)
    },
    // 点击减号，将餐品减一
    handleCartMinusfood(e) {
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index

        let tmp_selectedFoodIndex = e.currentTarget.dataset.selectedfoodindex

        let tmp_oneFood = this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex]
            //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
            // 应该是下面所有的操作都是在减1之后
        if (tmp_oneFood.foodCount > 0) {
            tmp_oneFood.foodCount -= 1


            this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
                // 总的数目减1
            let tmptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整


            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData
            currnt_menuData.totalMoney -= tmp_oneFood.foodPrice
            if (tmp_oneFood.canMeal) { //可使用餐标
                currnt_menuData.totalMoney_meal -= tmp_oneFood.foodPrice
            }
            // 这种每次重新计算的方法好吗
            let new_deduction = 0
                //如果是企业管理员
            if (this.data.orgAdmin) {
                new_deduction = currnt_menuData.totalMoney
            } else {
                if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0 
                    if (currnt_menuData.totalMoney_meal < currnt_menuData.mealType.standardPrice) {
                        new_deduction = currnt_menuData.totalMoney_meal
                    } else {
                        new_deduction = currnt_menuData.mealType.standardPrice
                    }
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = parseFloat(new_deduction.toFixed(2))

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0


            // 购物车中的减1
            let tmp_selectedFood = this.data.selectedFoodsIndex.selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount--;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice - tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice - tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex.selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood
            this.data.selectedFoodsIndex.deductionMoney = parseFloat(new_deduction.toFixed(2))



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
            if (tmp_oneFood.foodCount == 0) {
                let tempselectFoodsIndex = this.data.selectedFoodsIndex
                tempselectFoodsIndex.foodList[menutypeIndex] = tempselectFoodsIndex.foodList[menutypeIndex].filter(item => {
                    return item != foodIndex
                })

                this.setData({
                    selectedFoodsIndex: tempselectFoodsIndex
                })
            }

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

        let tmp_selectedFoodIndex = e.currentTarget.dataset.selectedfoodindex
            //被点击的那道菜，不知道要不要做是否为空判断
        let tmp_oneFood = this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex]

        // 考虑库存和限购
        let canAddFlag = true

        if (tmp_oneFood.stock) { //说明有库存 要不要判断不为0啊
            let tmpstock = tmp_oneFood.foodQuota
            let tmpfoodCount = tmp_oneFood.foodCount
            if (tmpstock.quotaNum && (tmpfoodCount >= tmpstock.quotaNum)) {
                wx.showToast({
                    title: '限购' + tmpstock.quotaNum + '份',
                    image: '../../../images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
            if (tmpstock.surplusNum && tmpfoodCount >= tmpstock.surplusNum) {
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

            this.data.allMenuData.foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood


            let tmptotalCount = this.data.totalCount + 1 //购物车中总数加1 
            this.setData({
                totalCount: tmptotalCount
            })

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[menutypeIndex] += 1
            this.setData({
                menuCountList: tmp_menuCountList
            })

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney + tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData
            currnt_menuData.totalMoney += tmp_oneFood.foodPrice
            if (tmp_oneFood.canMeal) { //可使用餐标
                currnt_menuData.totalMoney_meal += tmp_oneFood.foodPrice
            }
            // 这种每次重新计算的方法好吗
            let new_deduction = 0
                //如果是企业管理员
            if (this.data.orgAdmin) {
                new_deduction = currnt_menuData.totalMoney
            } else {
                if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0

                    if (currnt_menuData.totalMoney_meal < currnt_menuData.mealType.standardPrice) {
                        new_deduction = currnt_menuData.totalMoney_meal
                    } else {
                        new_deduction = currnt_menuData.mealType.standardPrice
                    }
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = parseFloat(new_deduction.toFixed(2))

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0
                // 购物车中被增1的增1
            let tmp_selectedFood = this.data.selectedFoodsIndex.selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount++;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice + tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice + tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex.selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood
            this.data.selectedFoodsIndex.deductionMoney = parseFloat(new_deduction.toFixed(2))
            this.setData({
                allMenuData: this.data.allMenuData,
                totalMoney: parseFloat(tmptotalMoney.toFixed(2)),
                realTotalMoney: parseFloat(tmp_realTotalMoney.toFixed(2)),
                totalMoneyRealDeduction: tmp_totalMoneyRealDeduction,
                selectedFoodsIndex: this.data.selectedFoodsIndex
            })

        }
    },
    //验证未达餐标情况
    verifyMealLabel() {
        console.log('this.data.allMenuData', this.data.allMenuData)
        let flag = true

        // 是这么判断的吗？ 5/6
        //1.餐标可用 2.当天当餐点餐了，用总价判断点餐没是否不妥？3.不能低于餐标 4.抵扣金额小于企业餐标
        let { mealSet, deductionMoney, totalMoney_meal, mealType } = this.data.allMenuData
        if (mealSet.userCanStandardPrice && totalMoney_meal > 0 && !mealSet.underStandardPrice && deductionMoney < mealType.standardPrice) {
            wx.showModal({
                title: '',
                content: '未达餐标金额(¥' + mealType.standardPrice + ')' + ',请继续选餐',
                showCancel: false,
                confirmText: '返回'
            })

            flag = false
        }

        return flag
    },
    goToMenuCommit() {
        if (this.data.totalCount > 0) {
            let flag = true
            if (!this.data.orgAdmin) {
                flag = this.verifyMealLabel()
            }

            if (flag) {
                this.getSelectedFoods() //不需要执行多次吧。好像需要的哦。

                this.data.selectedFoodsIndex.mealDate = this.data.mealDate

                //需要补餐的日期和餐时
                let meal = this.data.mealTypeItem.toLowerCase()
                let addSelectedFoods = {}
                addSelectedFoods[meal] = this.data.selectedFoodsIndex
                addSelectedFoods[meal].name = this.data.mealTypeItemShow
                addSelectedFoods.count = this.data.selectedFoodsIndex.selectedFoods.length
                addSelectedFoods.mealDate = this.data.mealDate

                //只要时间不是今天就是补明天的，相等就是补今天的
                if (new Date().getDate() == new Date(this.data.mealDate).getDate()) {
                    addSelectedFoods.appointment = '今天'
                } else {
                    addSelectedFoods.appointment = '明天'
                }
                wx.setStorageSync('addSelectedFoods', addSelectedFoods)
                console.log('addSelectedFoods', addSelectedFoods)
                wx.navigateTo({
                    url: '/pages/menu/today/confirm/confirm?totalMoney=' +
                        this.data.totalMoney + '&totalMoneyRealDeduction=' +
                        this.data.totalMoneyRealDeduction + '&realMoney=' + this.data.realTotalMoney + '&orderType=add'

                })
            }
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
            url: '/pages/food/food?foodCode=' + e.currentTarget.dataset.foodcode + '&mealDate=' + this.data.mealDate,
        })
    },
})