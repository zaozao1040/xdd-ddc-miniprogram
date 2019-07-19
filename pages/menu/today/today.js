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
        mealTypeItem: '', // 选择的哪个时餐
        mealDate: '', //日期
        appointment: '', //今天还是明天 


        menutypeActiveFlag: 0, //当前被点击的餐品类别 
        boxActiveFlag: false, //购物车的颜色，false时是灰色，true时有颜色
        totalCount: 0, // 购物车中物品个数
        totalMoney: 0, //购物车中餐品的总金额
        realTotalMoney: 0, // totalMoney-totalMoneyRealDeduction后得到的钱 

        timer: null,
        windowHeight: 500,
        mealtyleListBottom: 100,
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
        lazyShowImage: {}, //用于懒加载图片的 
        // 懒加载
        intersectionObserverList: [],
        mealEnglistLabel: ['breakfast', 'lunch', 'dinner', 'night'],
        mealTypeSmall: { lunch: '午餐', dinner: '晚餐', breakfast: '早餐', night: '夜宵' },
        getTimeDataByResponseNow: false, //是否可点击日期和餐时

    },
    onLoad: function(options) {
        let _this = this
        requestModel.getUserInfo(userInfo => {

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


        let tmp_appointmention = options.appointment //显示是今天还是明天
        let index = tmp_appointmention == 'today' ? 0 : 1
        let tmp_mealtypeinfo = wx.getStorageSync('twoDaysInfo')[index]

        let dd = tmp_mealtypeinfo.mealDate.split("-")
        let mealDateShow = dd[1] + "/" + dd[2]
        _this.setData({
            mealTypeInfo: tmp_mealtypeinfo,
            mealDate: tmp_mealtypeinfo.mealDate,
            mealDateShow: mealDateShow,
            mealTypeItem: options.mealtype,
            appointment: tmp_appointmention == 'today' ? '今天' : '明天'
        })

        if (!_this.data.allMenuData[_this.data.mealTypeItem]) {
            _this.getTimeDataByResponse()

            // _this.data.lazyTimer = setInterval(() => {
            //     if (_this.data.allMenuData[_this.data.mealTypeItem]) {
            //         // 懒加载 
            //         _this.lazyImg(_this, _this.data.lazyShowImage, 'lazyShowImage', _this.data.mealTypeItem)

            //         clearInterval(_this.data.lazyTimer)
            //     }
            // }, 1000)
        }

        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })

        const query2 = wx.createSelectorQuery()
        query2.select('#mealtyleList').boundingClientRect()
        query2.selectViewport().scrollOffset()
        query2.exec(function(res) {
            if (res[0]) {
                _this.setData({
                    mealtyleListBottom: res[0].bottom
                })
            }
        })
    },
    //懒加载
    // lazyImg(_that, data, lazy_name, mealTypeItem) { 

    //     for (let i = 0, len = data[mealTypeItem].length; i < len; i++) {
    //         for (let j = 0; j < data[mealTypeItem][i].length; j++) {

    //             if (mealTypeItem == 'LUNCH') {
    //                 let ooo = wx.createIntersectionObserver()
    //                 ooo.relativeToViewport({
    //                     bottom: 20
    //                 }).observe('#' + mealTypeItem + 'food' + i + j, (ret) => {

    //                     if (ret.intersectionRatio > 0) {
    //                         data[mealTypeItem][i][j] = true
    //                         console.log("&&observe" + mealTypeItem + '' + i + '' + j);
    //                     }

    //                     _that.data.intersectionObserverList.push(ooo)
    //                         // 总得加载完所有图片后就不执行这个lazyImg了吧，咋判断的
    //                     _that.setData({
    //                         [lazy_name]: data
    //                     })
    //                 })
    //             } else {
    //                 let ooo = wx.createIntersectionObserver()
    //                 ooo.relativeToViewport({
    //                     bottom: 20
    //                 }).observe('#' + mealTypeItem + 'food' + i + j, (ret) => {

    //                     if (ret.intersectionRatio > 0) {
    //                         data[mealTypeItem][i][j] = true
    //                         console.log("&&observe---222" + mealTypeItem + '' + i + '' + j);
    //                     }

    //                     _that.data.intersectionObserverList.push(ooo)
    //                         // 总得加载完所有图片后就不执行这个lazyImg了吧，咋判断的
    //                     _that.setData({
    //                         [lazy_name]: data
    //                     })
    //                 })
    //             }
    //         }
    //     }
    // },

    // 点击餐时
    handleChangeMealtypeActive(e) {
        if (this.data.getTimeDataByResponseNow) {
            return
        }
        let mealtypeitem = e.currentTarget.dataset.mealtypeitem
        this.setData({
            mealTypeItem: mealtypeitem
        })

        if (!this.data.allMenuData[mealtypeitem]) {
            this.setData({
                getdataalready: false
            })
            this.getTimeDataByResponse()
        }

    },

    /* 获取餐品menu信息 */
    getTimeDataByResponse: function() {
        //正在后台请求菜单

        let _this = this
        _this.setData({
            getTimeDataByResponseNow: true
        })
        let tmp_mealTypeItem = _this.data.mealTypeItem
        requestModel.getUserCode(userCode => {
            let param = {
                url: '/food/getFoodDateList?userCode=' + userCode + '&mealDate=' + _this.data.mealDate + '&mealType=' + tmp_mealTypeItem.toUpperCase()

            }
            requestModel.request(param, resData => { //获取加餐所有信息

                //这是浅拷贝吧，不是深拷贝吧，所以这样和直接使用res的差别是什么？？
                resData.totalMoney = 0 //给每天的每个餐时一个点餐的总的金额
                resData.totalMoney_meal = 0 //可使用餐标的餐的总价格
                resData.deductionMoney = 0
                    // 给每一个餐品添加一个foodCount，用于加号点击时加一减一
                    // 给每一个餐品添加一个foodTotalPrice
                    // 给每一个餐品添加一个foodTotalOriginalPrice
                let tmp_menuCountList = []
                let tmp_menuCountListCopy = []

                // 带lazy的都用于懒加载
                let tmp_lazyShowImage = _this.data.lazyShowImage
                tmp_lazyShowImage[tmp_mealTypeItem] = []
                let tmp_lazyShowImageCount = 0


                //5/31开始
                //先将本餐所有的餐的id和index对应出来
                // typeId对menuTypeIndex
                // foodCode对foodIndex

                /* typeIdFoodCode={13:{menuTypeIndex:0, foodCodeIndexs:{code:foodIndex}} }*/
                let typeIdFoodCode = {}
                resData.foodList.forEach((item, menuTypeIndex) => {
                    let a = {}
                    a.menuTypeIndex = menuTypeIndex
                    a.foodCodeIndexs = {}
                    item.menuTypeIndex = menuTypeIndex
                    item.foodList.forEach((foodItem, foodIndex) => {
                        foodItem.menuTypeIndex = menuTypeIndex
                        foodItem.foodIndex = foodIndex
                        a.foodCodeIndexs[foodItem.foodCode] = foodIndex
                    })
                    typeIdFoodCode[item.typeId] = a
                })

                console.log('typeIdFoodCode', typeIdFoodCode)
                if (resData.foodCustomizeList && resData.foodCustomizeList.length > 0) {
                    resData.foodCustomizeList.forEach((item, index1) => {
                        item.left = true
                        item.foodList.forEach((foodItem, index2) => {
                            //要做俩连动，左侧连动正常了，正常没有连动左侧
                            foodItem.left = true
                            foodItem.foodCount = 0
                            let foodList_menuTypeIndex = typeIdFoodCode[foodItem.typeId].menuTypeIndex
                            let foodList_foodIndex = typeIdFoodCode[foodItem.typeId].foodCodeIndexs[foodItem.foodCode]
                            foodItem.menuTypeIndex = foodList_menuTypeIndex
                            foodItem.foodIndex = foodList_foodIndex

                            //正常连动左侧
                            resData.foodList[foodList_menuTypeIndex].foodList[foodList_foodIndex].leftMenuTypeIndex = index1
                            resData.foodList[foodList_menuTypeIndex].foodList[foodList_foodIndex].leftFoodIndex = index2
                        })
                        tmp_menuCountList.push(0)
                        tmp_menuCountListCopy.push(0)
                    })
                }

                console.log('resData.foodCustomizeList', resData.foodCustomizeList)
                resData.foodList.forEach(item => {
                    item.left = false
                    item.foodList.forEach(foodItem => {
                        foodItem.foodTotalPrice = 0
                        foodItem.foodTotalOriginalPrice = 0
                        foodItem.foodCount = 0
                    })
                    tmp_menuCountList.push(0)
                    tmp_menuCountListCopy.push(0)

                })

                // 把标签项的餐品也加上5/30
                // 放在这应该是对的
                if (resData.foodCustomizeList && resData.foodCustomizeList.length > 0) {
                    resData.foodList = resData.foodCustomizeList.concat(resData.foodList)
                    resData.foodCustomizeListLength = resData.foodCustomizeList.length
                } else {
                    resData.foodCustomizeListLength = 0
                }


                //5/31截止


                //可以不用setData，因为都是0不需要显示
                _this.data.menuCountList[tmp_mealTypeItem] = tmp_menuCountList
                _this.data.menuCountListCopy[tmp_mealTypeItem] = tmp_menuCountListCopy

                let tmp_allData = _this.data.allMenuData
                tmp_allData[tmp_mealTypeItem] = resData
                _this.setData({
                    allMenuData: tmp_allData, //保存下所有数据
                    allMenuDataCopy: tmp_allData, //保存下所有数据
                    getdataalready: true,
                    lazyShowImage: tmp_lazyShowImage,
                    lazyShowImageCount: tmp_lazyShowImageCount
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
                    })
                    _this.calculateHeight()
                }
                _this.setData({
                    getTimeDataByResponseNow: false
                })
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
            if (res[0] != null) {
                let cartMaxHeight = _this.data.windowHeight / 2
                if (res[0].height < cartMaxHeight) {
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
                title: '预约' + _this.data.appointment + ' ' + _this.data.mealTypeSmall[_this.data.mealTypeItem]
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

                if (scrollY > 500) {
                    _this.setData({
                        outerScrollIntoView: 'menumenu'
                    })
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
        let tmp_mealTypeItem = this.data.mealTypeItem
        let tmp_oneFood = this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex]
            //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
            // 应该是下面所有的操作都是在减1之后
        if (tmp_oneFood.foodCount > 0) {

            //5/31判断是不是左侧标签
            let { left, leftmenuindex, leftfoodindex } = e.currentTarget.dataset

            if (left) {
                //表示点击的是左侧标签
                this.data.allMenuData[tmp_mealTypeItem].foodList[leftmenuindex].foodList[leftfoodindex].foodCount -= 1
            } else {
                //表示点击的是正常餐品，要连动修改左侧标签餐品
                if (tmp_oneFood.leftMenuTypeIndex != undefined) {
                    //表示正常餐品级联了左侧标签餐品
                    this.data.allMenuData[tmp_mealTypeItem].foodList[tmp_oneFood.leftMenuTypeIndex].foodList[tmp_oneFood.leftFoodIndex].foodCount -= 1
                }

            }


            tmp_oneFood.foodCount -= 1
            this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
                // 总的数目减1
            let temptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[tmp_mealTypeItem][menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整


            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[tmp_mealTypeItem]
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

                tempselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex] = tempselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex].filter(item => {
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
        let _this = this
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index 

        //被点击的那道菜，不知道要不要做是否为空判断
        let tmp_oneFood = _this.data.allMenuData[_this.data.mealTypeItem].foodList[menutypeIndex].foodList[foodIndex]

        // 考虑库存和限购
        let canAddFlag = true

        if (tmp_oneFood.foodQuota) { //说明有库存 要不要判断不为0啊
            let tmpstock = tmp_oneFood.foodQuota
            let tmpfoodCount = tmp_oneFood.foodCount
            if ((tmpstock.quotaNum || tmpstock.quotaNum == 0) && (tmpfoodCount >= tmpstock.quotaNum)) {
                wx.showToast({
                    title: '限购' + tmpstock.quotaNum + '份',
                    image: '/images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            } else if ((tmpstock.surplusNum || tmpstock.surplusNum == 0) && tmpfoodCount >= tmpstock.surplusNum) {
                wx.showToast({
                    title: '库存不足',
                    image: '/images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
        }

        if (canAddFlag) {

            // 说明可以再点餐
            // 应该是先menu那增1，然后动画过去，然后购物车那里增1
            let tmp_mealTypeItem = _this.data.mealTypeItem
                //5/31判断是不是左侧标签
            let { left, leftmenuindex, leftfoodindex } = e.currentTarget.dataset
            if (left) {
                //表示点击的是左侧标签
                _this.data.allMenuData[tmp_mealTypeItem].foodList[leftmenuindex].foodList[leftfoodindex].foodCount += 1
            } else {
                //表示点击的是正常餐品，要连动修改左侧标签餐品
                if (tmp_oneFood.leftMenuTypeIndex != undefined) {
                    //表示正常餐品级联了左侧标签餐品
                    _this.data.allMenuData[tmp_mealTypeItem].foodList[tmp_oneFood.leftMenuTypeIndex].foodList[tmp_oneFood.leftFoodIndex].foodCount += 1
                }

            }

            tmp_oneFood.foodCount += 1 // 需不需要判断库存

            // 先menu增1
            _this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood


            _this.setData({
                shakeshake: true
            })
            if (!_this.data.shakeTimer) {
                clearTimeout(_this.data.shakeTimer)
            }

            _this.data.shakeTimer = setTimeout(function() {
                _this.setData({
                    shakeshake: false
                })
            }, 500)

            let tmptotalCount = _this.data.totalCount + 1 //购物车中总数加1 
            _this.setData({
                totalCount: tmptotalCount
            })

            let tmp_menuCountList = _this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[tmp_mealTypeItem][menutypeIndex] += 1
            _this.setData({
                menuCountList: tmp_menuCountList
            })


            // 是不是应该把所有的setData合并啊，这样一次一次调用是不是更花时间
            // 只有等于1，才添加到购物车
            if (tmp_oneFood.foodCount == 1) {
                // 应该也不会添加几个的，先这么写写吧，不晓得对不对  
                //是不是应该把selectedFoodsIndex和allMenuData合并啊
                if (!_this.data.selectedFoodsIndex[tmp_mealTypeItem]) {
                    let tmp = {}
                    tmp.name = _this.data.mealTypeSmall[tmp_mealTypeItem]
                    tmp.foodList = []
                    _this.data.selectedFoodsIndex[tmp_mealTypeItem] = tmp

                    let tmp_copy = {}
                    tmp_copy.name = _this.data.mealTypeSmall[tmp_mealTypeItem]
                    tmp_copy.foodList = []
                    _this.data.selectedFoodsIndexCopy[tmp_mealTypeItem] = tmp_copy
                }

                let tmpselectFoodsIndex = _this.data.selectedFoodsIndex
                if (!tmpselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex]) {
                    tmpselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex] = []
                }
                tmpselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex].push(foodIndex)
                _this.setData({
                    selectedFoodsIndex: tmpselectFoodsIndex
                })
            }

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = _this.data.totalMoney + tmp_oneFood.foodPrice

            let currnt_menuData = _this.data.allMenuData[tmp_mealTypeItem]
            currnt_menuData.totalMoney += tmp_oneFood.foodPrice

            if (tmp_oneFood.canMeal) { //可使用餐标
                currnt_menuData.totalMoney_meal += tmp_oneFood.foodPrice
            }

            // 这种每次重新计算的方法好吗
            let new_deduction = 0
                //如果是企业管理员
            if (_this.data.orgAdmin) {
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

            let tmp_totalMoneyRealDeduction = parseFloat((_this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0

            _this.setData({
                allMenuData: _this.data.allMenuData,
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
        let mealEnglistLabel = this.data.mealEnglistLabel
        for (let i in mealEnglistLabel) { // x 为餐时 
            let tmpselectedfoods = []
            let x = mealEnglistLabel[i]
            if (tmpselectFoodsIndex[x]) {
                for (let y in tmpselectFoodsIndex[x].foodList) { // y 为选择的餐品index 
                    let onecategoryfoods = tmp_allData[x].foodList[y].foodList
                    for (let i = 0; i < tmpselectFoodsIndex[x].foodList[y].length; i++) {
                        const onefood = onecategoryfoods[tmpselectFoodsIndex[x].foodList[y][i]]
                        if (onefood.foodCount > 0) {
                            onefood.menuItemIndex = parseInt(y)
                            onefood.foodIndex = tmpselectFoodsIndex[x].foodList[y][i]
                                // totalPrice只有在购物车列表和订单信息那里才需要展示，所以在menu列表那边add和minus时不需要写
                                //不需要的时候就不要计算
                            onefood.foodTotalPrice = parseFloat((onefood.foodPrice * onefood.foodCount).toFixed(2))
                            onefood.foodTotalOriginalPrice = parseFloat((onefood.foodOriginalPrice * onefood.foodCount).toFixed(2))
                            tmpselectedfoods.push(onefood)
                        }
                    }
                }
                tmpselectFoodsIndex[x].selectedFoods = tmpselectedfoods
                tmpselectFoodsIndex[x].deductionMoney = this.data.allMenuData[x].deductionMoney
                tmpselectFoodsIndex[x].payMoney = parseFloat((this.data.allMenuData[x].totalMoney - this.data.allMenuData[x].deductionMoney).toFixed(2))
            }
        }

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

        let tmp_oneFood = this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex]
            //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
            // 应该是下面所有的操作都是在减1之后
        if (tmp_oneFood.foodCount > 0) {


            //表示点击的是正常餐品，要连动修改左侧标签餐品
            if (tmp_oneFood.leftMenuTypeIndex != undefined) {
                //表示正常餐品级联了左侧标签餐品
                this.data.allMenuData[tmp_mealTypeItem].foodList[tmp_oneFood.leftMenuTypeIndex].foodList[tmp_oneFood.leftFoodIndex].foodCount -= 1
            }


            tmp_oneFood.foodCount -= 1


            this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
                // 总的数目减1
            let tmptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[tmp_mealTypeItem][menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整


            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[tmp_mealTypeItem]
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
            let tmp_selectedFood = this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount--;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice - tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice - tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood
            this.data.selectedFoodsIndex[tmp_mealTypeItem].deductionMoney = parseFloat(new_deduction.toFixed(2))



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
                tempselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex] = tempselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex].filter(item => {
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
        let tmp_mealTypeItem = e.currentTarget.dataset.mealtypeitem
        let tmp_selectedFoodIndex = e.currentTarget.dataset.selectedfoodindex
            //被点击的那道菜，不知道要不要做是否为空判断
        let tmp_oneFood = this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex]

        // 考虑库存和限购
        let canAddFlag = true

        if (tmp_oneFood.foodQuota) { //说明有库存 要不要判断不为0啊
            let tmpstock = tmp_oneFood.foodQuota
            let tmpfoodCount = tmp_oneFood.foodCount
            if ((tmpstock.quotaNum || tmpstock.quotaNum == 0) && (tmpfoodCount >= tmpstock.quotaNum)) {
                wx.showToast({
                    title: '限购' + tmpstock.quotaNum + '份',
                    image: '/images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
            // 要记住 if(0) 为false
            else if ((tmpstock.surplusNum || tmpstock.surplusNum == 0) && tmpfoodCount >= tmpstock.surplusNum) {
                wx.showToast({
                    title: '库存不足',
                    image: '/images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
        }

        if (canAddFlag) { // 说明可以再点餐


            //表示点击的是正常餐品，要连动修改左侧标签餐品
            if (tmp_oneFood.leftMenuTypeIndex != undefined) {
                //表示正常餐品级联了左侧标签餐品
                this.data.allMenuData[tmp_mealTypeItem].foodList[tmp_oneFood.leftMenuTypeIndex].foodList[tmp_oneFood.leftFoodIndex].foodCount += 1
            }


            tmp_oneFood.foodCount += 1 // 需不需要判断库存

            let tmpFoodTotalPrice = tmp_oneFood.foodTotalPrice
                //需要好好看看parseFloat,后面优化parseFloat相关内容
            tmpFoodTotalPrice = parseFloat(parseFloat(tmpFoodTotalPrice + parseFloat(tmp_oneFood.foodPrice)).toFixed(2))
            tmp_oneFood.foodTotalPrice = tmpFoodTotalPrice

            let tmpFoodTotalOriginalPrice = tmp_oneFood.foodTotalOriginalPrice
            tmpFoodTotalOriginalPrice = parseFloat(parseFloat(tmpFoodTotalOriginalPrice + parseFloat(tmp_oneFood.foodOriginalPrice)).toFixed(2))
            tmp_oneFood.foodTotalOriginalPrice = tmpFoodTotalOriginalPrice

            this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood


            let tmptotalCount = this.data.totalCount + 1 //购物车中总数加1 
            this.setData({
                totalCount: tmptotalCount
            })

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[tmp_mealTypeItem][menutypeIndex] += 1
            this.setData({
                menuCountList: tmp_menuCountList
            })

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney + tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[tmp_mealTypeItem]
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
            let tmp_selectedFood = this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount++;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice + tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice + tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood
            this.data.selectedFoodsIndex[tmp_mealTypeItem].deductionMoney = parseFloat(new_deduction.toFixed(2))
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

        let flag = true
        for (let meal in this.data.allMenuData) {
            if (!flag) {
                break
            }
            // 是这么判断的吗？ 5/6
            //1.餐标可用 2.当天当餐点餐了，用总价判断点餐没是否不妥？3.不能低于餐标 4.抵扣金额小于企业餐标
            let { mealSet, deductionMoney, totalMoney_meal, mealType } = this.data.allMenuData[meal]
            if (mealSet.userCanStandardPrice && totalMoney_meal > 0 && !mealSet.underStandardPrice && deductionMoney < mealType.standardPrice) {

                let t_title = this.data.appointment + ' ' + this.data.mealTypeSmall[meal]
                let t_content = '未达餐标金额(¥' + mealType.standardPrice + ')' + ',请继续选餐'
                this.setData({
                    mealTypeItem: meal,
                    notUpToStandardPrice: true,
                    notUpToStandardPriceTitle: t_title,
                    notUpToStandardPriceContent: t_content
                })

                flag = false
            }
        }
        return flag
    },
    closeModal() {
        this.setData({
            notUpToStandardPrice: false
        })
    },
    goToMenuCommit() {
        let _this = this
            //也弄两秒内不可重复点击
        if (_this.data.commitNow) {
            return
        }
        _this.data.commitNow = true
        setTimeout(() => {
            _this.data.commitNow = false
        }, 2000)
        console.log('commitNow')
        if (_this.data.totalCount > 0) {
            let flag = true
            if (!_this.data.orgAdmin) {
                flag = _this.verifyMealLabel()
            }

            if (flag) {
                _this.getSelectedFoods() //不需要执行多次吧。好像需要的哦。

                _this.data.selectedFoodsIndex.appointment = _this.data.appointment
                _this.data.selectedFoodsIndex.mealDate = _this.data.mealDate

                wx.setStorageSync('todaySelectedFoods', _this.data.selectedFoodsIndex)

                wx.navigateTo({
                    url: '/pages/menu/today/confirm/confirm?totalMoney=' +
                        _this.data.totalMoney + '&totalMoneyRealDeduction=' +
                        _this.data.totalMoneyRealDeduction + '&realMoney=' + _this.data.realTotalMoney + '&orderType=one'

                })
            }
        }

    },
    onShow: function() {

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
    /* 餐品详情 */
    handleGotoFoodDetail: function(e) {
        wx.navigateTo({
            url: '/pages/food/food?foodCode=' + e.currentTarget.dataset.foodcode + '&mealDate=' + this.data.mealDate + '&mealType=' + this.data.mealTypeItem,
        })
    },
})