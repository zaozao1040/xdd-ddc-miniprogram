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
        totalMoney: 0, //购物车中菜品的总金额
        realTotalMoney: 0, // totalMoney-totalMoneyRealDeduction后得到的钱 

        timer: null,
        windowHeight: 0,
        scrollLintenFlag: true, //默认允许触发滚动事件
        showBackToTopFlag: false, //显示返回scroll顶部的标志
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
    },
    onLoad: function(options) {
        console.log('options', options)
        let tmp_appointmention = options.appointment //显示是今天还是明天
        let index = tmp_appointmention == 'today' ? 0 : 1
        let tmp_mealtypeinfo = wx.getStorageSync('twoDaysInfo')[index]
        console.log('tmp_mealtypeinfo', tmp_mealtypeinfo)
        let dd = tmp_mealtypeinfo.mealDate.split("-")
        let mealDateShow = dd[1] + "/" + dd[2]
        this.setData({
            mealTypeInfo: tmp_mealtypeinfo,
            mealDate: tmp_mealtypeinfo.mealDate,
            mealDateShow: mealDateShow,
            mealTypeItem: options.mealtype,
            appointment: tmp_appointmention == 'today' ? '今天' : '明天'
        })



        if (!this.data.allMenuData[this.data.mealTypeItem]) {
            this.getTimeDataByResponse()

            this.data.lazyTimer = setInterval(() => {
                if (this.data.allMenuData[this.data.mealTypeItem]) {
                    // 懒加载 
                    this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage', this.data.mealTypeItem)

                    clearInterval(this.data.lazyTimer)
                }
            }, 1000)
        }

    },
    //懒加载
    lazyImg(_that, data, lazy_name, mealTypeItem) {
        console.log('_that.data.intersectionObserverList', _that.data.intersectionObserverList)


        for (let i = 0, len = data[mealTypeItem].length; i < len; i++) {
            for (let j = 0; j < data[mealTypeItem][i].length; j++) {

                if (mealTypeItem == 'LUNCH') {


                    let ooo = wx.createIntersectionObserver()
                    ooo.relativeToViewport({
                        bottom: 20
                    }).observe('#' + mealTypeItem + 'food' + i + j, (ret) => {

                        if (ret.intersectionRatio > 0) {
                            data[mealTypeItem][i][j] = true
                            console.log("&&observe" + mealTypeItem + '' + i + '' + j);
                        }

                        _that.data.intersectionObserverList.push(ooo)
                            // 总得加载完所有图片后就不执行这个lazyImg了吧，咋判断的
                        _that.setData({
                            [lazy_name]: data
                        })
                    })
                } else {
                    let ooo = wx.createIntersectionObserver()
                    ooo.relativeToViewport({
                        bottom: 20
                    }).observe('#' + mealTypeItem + 'food' + i + j, (ret) => {

                        if (ret.intersectionRatio > 0) {
                            data[mealTypeItem][i][j] = true
                            console.log("&&observe---222" + mealTypeItem + '' + i + '' + j);
                        }

                        _that.data.intersectionObserverList.push(ooo)
                            // 总得加载完所有图片后就不执行这个lazyImg了吧，咋判断的
                        _that.setData({
                            [lazy_name]: data
                        })
                    })
                }
            }
        }
    },

    // 点击餐时
    handleChangeMealtypeActive(e) {

        let mealtypeitem = e.currentTarget.dataset.mealtypeitem
        this.setData({
            mealTypeItem: mealtypeitem
        })

        if (!this.data.allMenuData[mealtypeitem]) {
            this.setData({
                getdataalready: false
            })
            this.getTimeDataByResponse()
            this.data.lazyTimer = setInterval(() => {
                if (this.data.allMenuData[this.data.mealTypeItem]) {
                    // 懒加载 
                    this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage', this.data.mealTypeItem)

                    clearInterval(this.data.lazyTimer)
                }
            }, 1000)
        } else {
            this.data.lazyTimer = setInterval(() => {
                if (this.data.allMenuData[this.data.mealTypeItem]) {
                    // 懒加载 
                    this.lazyImg(this, this.data.lazyShowImage, 'lazyShowImage', this.data.mealTypeItem)

                    clearInterval(this.data.lazyTimer)
                }
            }, 1000)
        }

    },

    /* 获取餐品menu信息 */
    getTimeDataByResponse: function() {

        let _this = this
        let tmp_mealTypeItem = _this.data.mealTypeItem

        let param = {
            url: '/food/getFoodDateList?userCode=' + wx.getStorageSync('userCode') + '&mealDate=' + _this.data.mealDate + '&mealType=' + tmp_mealTypeItem.toUpperCase()

        }
        requestModel.request(param, resData => { //获取加餐所有信息

            //这是浅拷贝吧，不是深拷贝吧，所以这样和直接使用res的差别是什么？？
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
            resData.foodList.forEach(item => {

                let oneLazyShow = []
                item.foodList.forEach(foodItem => {
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


            // 在没有得到数据就使用时，是有错误的，所以在得到数据后使用
            // 2019/04/20 后面会检查这部分，顺便学习相关知识
            // 这样就计算多遍了啊
            if (_this.data.windowHeight == 0) {
                wx.getSystemInfo({
                    success: function(res) {
                        _this.setData({
                            windowHeight: res.windowHeight
                        })
                    }
                })
            }
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
        let _this = this
        if (e.detail.scrollTop >= 40) { //大于等于40就显示
            wx.setNavigationBarTitle({
                title: '预约' + _this.data.appointment
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
        let tmp_oneFood = this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex]
            //  不大于0也不显示减图标啊，所以这里应该可以不用判断。还是判断下吧，因为可能用户会点的很快，这样就减为负数了。
            // 应该是下面所有的操作都是在减1之后
        if (tmp_oneFood.foodCount > 0) {
            tmp_oneFood.foodCount -= 1
            this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
                // 总的数目减1
            let temptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[tmp_mealTypeItem][menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整

            // let temptotalMoney = this.data.totalMoney
            // temptotalMoney = parseFloat((parseFloat(temptotalMoney) - parseFloat(tmpFoods.foodPrice)).toFixed(2))  
            // this.setData({
            //     totalMoney: temptotalMoney
            // })

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[tmp_mealTypeItem]
            currnt_menuData.totalMoney -= tmp_oneFood.foodPrice
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.mealSet.underStandardPrice && currnt_menuData.totalMoney < currnt_menuData.mealType.standardPrice) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.mealType.standardPrice
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = new_deduction

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
        let menutypeIndex = e.currentTarget.dataset.menutypeindex // 餐品类别的index
        let foodIndex = e.currentTarget.dataset.foodindex // 在menutypeIndex的foods的index 

        //被点击的那道菜，不知道要不要做是否为空判断
        let tmp_oneFood = this.data.allMenuData[this.data.mealTypeItem].foodList[menutypeIndex].foodList[foodIndex]

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
            let tmp_mealTypeItem = this.data.mealTypeItem
            tmp_oneFood.foodCount += 1 // 需不需要判断库存

            // 先menu增1
            this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
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
            tmp_menuCountList[tmp_mealTypeItem][menutypeIndex] += 1
            this.setData({
                menuCountList: tmp_menuCountList
            })


            // 是不是应该把所有的setData合并啊，这样一次一次调用是不是更花时间
            // 只有等于1，才添加到购物车
            if (tmp_oneFood.foodCount == 1) {
                // 应该也不会添加几个的，先这么写写吧，不晓得对不对  
                //是不是应该把selectedFoodsIndex和allMenuData合并啊
                if (!this.data.selectedFoodsIndex[tmp_mealTypeItem]) {
                    let tmp = {}
                    tmp.name = this.data.mealTypeSmall[tmp_mealTypeItem]
                    tmp.foodList = []
                    this.data.selectedFoodsIndex[tmp_mealTypeItem] = tmp

                    let tmp_copy = {}
                    tmp_copy.name = this.data.mealTypeSmall[tmp_mealTypeItem]
                    tmp_copy.foodList = []
                    this.data.selectedFoodsIndexCopy[tmp_mealTypeItem] = tmp_copy
                }

                let tmpselectFoodsIndex = this.data.selectedFoodsIndex
                if (!tmpselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex]) {
                    tmpselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex] = []
                }
                tmpselectFoodsIndex[tmp_mealTypeItem].foodList[menutypeIndex].push(foodIndex)
                this.setData({
                    selectedFoodsIndex: tmpselectFoodsIndex
                })
            }

            // 计算totalMoney, totalDeduction，totalRealMonty
            let tmptotalMoney = this.data.totalMoney + tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[tmp_mealTypeItem]
            currnt_menuData.totalMoney += tmp_oneFood.foodPrice
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.mealSet.underStandardPrice && currnt_menuData.totalMoney < currnt_menuData.mealType.standardPrice) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.mealType.standardPrice
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
        console.log('selectedFoodsIndex', this.data.selectedFoodsIndex) //zll明天继续 为什么里面有undefined？？？
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
            tmp_oneFood.foodCount -= 1


            this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
                // 总的数目减1
            let tmptotalCount = this.data.totalCount - 1

            let tmp_menuCountList = this.data.menuCountList //menu菜单右上角加1
            tmp_menuCountList[tmp_mealTypeItem][menutypeIndex] -= 1 // 没有判断是不是大于0，这样会不会偶尔出bug？？后面这些代码都需要修整


            let tmptotalMoney = this.data.totalMoney - tmp_oneFood.foodPrice

            let currnt_menuData = this.data.allMenuData[tmp_mealTypeItem]
            currnt_menuData.totalMoney -= tmp_oneFood.foodPrice
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.mealSet.underStandardPrice && currnt_menuData.totalMoney < currnt_menuData.mealType.standardPrice) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.mealType.standardPrice
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = new_deduction

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0


            // 购物车中的减1
            let tmp_selectedFood = this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount--;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice - tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice - tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood



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

            this.data.allMenuData[tmp_mealTypeItem].foodList[menutypeIndex].foodList[foodIndex] = tmp_oneFood
            this.setData({
                allMenuData: this.data.allMenuData
            })

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
                // 这种每次重新计算的方法好吗
            let new_deduction = 0
            if (currnt_menuData.mealSet.userCanStandardPrice && currnt_menuData.mealType.standardPrice > 0) { // 企业餐标可用并且大于0
                //lowerThanMealLabelFlag表示可定低于餐标的餐, 企业管理员的好像还没加
                if (currnt_menuData.mealSet.underStandardPrice && currnt_menuData.totalMoney < currnt_menuData.mealType.standardPrice) {
                    new_deduction = currnt_menuData.totalMoney
                } else {
                    new_deduction = currnt_menuData.mealType.standardPrice
                }
            }

            let oldDeduction = currnt_menuData.deductionMoney
            currnt_menuData.deductionMoney = new_deduction

            let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
            let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0
                // 购物车中被增1的增1
            let tmp_selectedFood = this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex]
            tmp_selectedFood.foodCount++;
            tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice + tmp_selectedFood.foodPrice).toFixed(2));
            tmp_selectedFood.foodTotalOriginalPrice = parseFloat((tmp_selectedFood.foodTotalOriginalPrice + tmp_selectedFood.foodOriginalPrice).toFixed(2));
            this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex] = tmp_selectedFood

            this.setData({
                totalMoney: parseFloat(tmptotalMoney.toFixed(2)),
                realTotalMoney: parseFloat(tmp_realTotalMoney.toFixed(2)),
                totalMoneyRealDeduction: tmp_totalMoneyRealDeduction,
                selectedFoodsIndex: this.data.selectedFoodsIndex
            })

        }
    },

    goToMenuCommit() {
        if (this.data.totalCount > 0) {
            if (!this.data.allMenuData[this.data.mealTypeItem].mealSet.underStandardPrice && this.data.totalMoneyRealDeduction > this.data.totalMoney) {
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
                this.getSelectedFoods() //不需要执行多次吧。好像需要的哦。

                this.data.selectedFoodsIndex.appointment = this.data.appointment
                this.data.selectedFoodsIndex.mealDate = this.data.mealDate

                wx.setStorageSync('todaySelectedFoods', this.data.selectedFoodsIndex)
                console.log('todaySelectedFoods', this.data.selectedFoodsIndex)
                wx.navigateTo({
                    url: '/pages/menu/today/confirm/confirm?totalMoney=' +
                        this.data.totalMoney + '&totalMoneyRealDeduction=' +
                        this.data.totalMoneyRealDeduction + '&realMoney=' + this.data.realTotalMoney + '&orderType=one'

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
            url: '/pages/food/food?dateId=' + e.currentTarget.dataset.dateid,
        })
    },
})