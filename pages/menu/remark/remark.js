// pages/menu/remark/remark.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectedFoods: [],
        mealEnglistLabel: ['breakfast', 'lunch', 'dinner', 'night'],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let selectedFoods = wx.getStorageSync('sevenSelectedFoods')
        this.setData({
            selectedFoods: selectedFoods
        })
        let _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        _this.getScrollHeight()

    },
    getScrollHeight() {
        let _this = this
        const query_1 = wx.createSelectorQuery()
        query_1.select('#c_warpper_calculation').boundingClientRect()
        query_1.selectViewport().scrollOffset()
        query_1.exec(function(res) {
            _this.setData({
                scrollHeight: res[0].height // #the-id节点的上边界坐标
            })
        })
    },
    addRemark(e) {

        //添加备注 
        let { dayindex, menuitem, foodindex } = e.currentTarget.dataset
        let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[foodindex]
        if (!onefood.remarkList || onefood.remarkList.length == 0) {
            onefood.remarkList = [{ name: '', count: onefood.foodCount }]
            onefood.remarkCountTotal = onefood.foodCount
            this.setData({
                selectedFoods: this.data.selectedFoods
            })
            this.getScrollHeight()
        } else if (onefood.remarkCountTotal < onefood.foodCount) {
            let lastRemark = onefood.remarkList[onefood.remarkList.length - 1]
            if (lastRemark.name.trim() && lastRemark.count) {
                onefood.remarkList.push({ name: '', count: onefood.foodCount - onefood.remarkCountTotal })
                onefood.remarkCountTotal = onefood.foodCount
                this.setData({
                    selectedFoods: this.data.selectedFoods
                })
                this.getScrollHeight()
            } else {
                wx.showToast({
                    title: '补全备注再添加',
                    image: '/images/msg/error.png',
                    duration: 2000
                })
            }
        } else {
            wx.showModal({
                title: '提示',
                content: '备注餐品的总数量已经等于点的餐品的数量，不可再添加备注'
            })
        }

    },
    inputRemarkName(e) {
        //添加备注name 
        let value = e.detail.value
        let { dayindex, menuitem, foodindex, remarkindex } = e.currentTarget.dataset
        this.data.selectedFoods[dayindex][menuitem].selectedFoods[foodindex].remarkList[remarkindex].name = value
        this.setData({
            selectedFoods: this.data.selectedFoods
        })
    },
    inputRemarkCount(e) {
        //添加备注count 
        let value = e.detail.value
        let { dayindex, menuitem, foodindex, remarkindex } = e.currentTarget.dataset
        let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[foodindex]
        let oldcount = onefood.remarkList[remarkindex].count
            //如果之前的餐品的数量不为空，那么计算现在的和是不是超过个餐品的数目

        if (!oldcount && (onefood.remarkCountTotal - oldcount + value > onefood.foodCount)) {
            onefood.remarkList[remarkindex].count = oldcount
            wx.showModal({
                title: '提示',
                content: '备注餐品的总数量不能超过点的餐品的数量'
            })
        } else {
            onefood.remarkList[remarkindex].count = value
            onefood.remarkCountTotal = onefood.remarkCountTotal - oldcount + value
        }

        this.setData({
            selectedFoods: this.data.selectedFoods
        })
    },
    minus(e) {
        //添加备注 
        let { dayindex, menuitem, foodindex, remarkindex } = e.currentTarget.dataset
        let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[foodindex]

        if (onefood.remarkList[remarkindex].count > 1) {
            onefood.remarkList[remarkindex].count--
                onefood.remarkCountTotal--
        } else {
            let _this = this
            wx.showModal({
                title: '提示',
                content: '您确定删除这条备注吗？',
                success(res) {
                    if (res.confirm) {
                        _this.deleteOneRemark(e)
                    } else if (res.cancel) {

                    }
                }
            })
        }
        this.setData({
            selectedFoods: this.data.selectedFoods
        })
    },
    add(e) {
        //添加备注 
        let { dayindex, menuitem, foodindex, remarkindex } = e.currentTarget.dataset
        let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[foodindex]
        if (onefood.remarkCountTotal == onefood.foodCount) {
            wx.showModal({
                title: '提示',
                content: '备注餐品的总数量已经等于点的餐品的数量！'
            })
        } else {
            onefood.remarkList[remarkindex].count++
                onefood.remarkCountTotal++
        }



        this.setData({
            selectedFoods: this.data.selectedFoods
        })
    },
    deleteOneRemark(e) {

        //删除一条备注 
        let { dayindex, menuitem, foodindex, remarkindex } = e.currentTarget.dataset
        let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[foodindex]
        let oldcount = onefood.remarkList[remarkindex].count
        onefood.remarkList.splice(remarkindex, 1)
        onefood.remarkCountTotal -= oldcount

        this.setData({
            selectedFoods: this.data.selectedFoods
        })
        this.getScrollHeight()
    },
    //清空所有备注
    clearAllRemark() {

        let _this = this
        wx.showModal({
            title: '提示',
            content: '您确定清空所有备注吗？',
            success(res) {
                if (res.confirm) {
                    for (let i = 0; i < _this.data.selectedFoods.length; i++) {

                        let tmp_selectedFoods = _this.data.selectedFoods[i]
                        if (tmp_selectedFoods.count > 0) {
                            _this.data.mealEnglistLabel.forEach(mealType => {
                                if (tmp_selectedFoods[mealType] && tmp_selectedFoods[mealType].selectedFoods.length > 0) { //选了这个餐时的菜

                                    tmp_selectedFoods[mealType].selectedFoods.forEach(onefood => {

                                        onefood.remarkCountTotal = 0
                                        onefood.remarkList = []
                                    })
                                }
                            })
                        }
                    }

                    _this.setData({
                        selectedFoods: _this.data.selectedFoods
                    })
                    _this.getScrollHeight()
                }
            }
        })
    },
    saveAllRemark() {
        let complete = true
        let _this = this
        for (let i = 0; i < _this.data.selectedFoods.length; i++) {

            let tmp_selectedFoods = _this.data.selectedFoods[i]
            if (tmp_selectedFoods.count > 0) {
                _this.data.mealEnglistLabel.forEach(mealType => {
                    if (tmp_selectedFoods[mealType] && tmp_selectedFoods[mealType].selectedFoods.length > 0) { //选了这个餐时的菜

                        tmp_selectedFoods[mealType].selectedFoods.forEach(onefood => {


                            if (onefood.remarkList && onefood.remarkList.length > 0) {
                                //判断最后一个备注是否完整
                                let lastRemark = onefood.remarkList[onefood.remarkList.length - 1]
                                if (!lastRemark.name || !lastRemark.count) {
                                    complete = false
                                }
                            }
                        })
                    }
                })
            }
        }
        //如果有的备注没有填
        if (!complete) {
            wx.showModal({
                title: '提示',
                content: '有未完成的备注，是否删除未完成的备注？',
                confirmText: '确定删除',
                cancelText: '一会再弄',
                success(res) {
                    if (res.confirm) {
                        _this.deleteUncompleteRemark()
                    } else if (res.cancel) {

                    }
                }
            })
        } else {
            wx.setStorageSync('sevenSelectedFoods', _this.data.selectedFoods)
            wx.showToast({
                title: '保存成功',
                icon: 'success'
            })
            wx.navigateBack({ url: '/pages/menu/today/confirm/confirm' })
        }
    },
    deleteUncompleteRemark() {

        let _this = this
        for (let i = 0; i < _this.data.selectedFoods.length; i++) {

            let tmp_selectedFoods = _this.data.selectedFoods[i]
            if (tmp_selectedFoods.count > 0) {
                _this.data.mealEnglistLabel.forEach(mealType => {
                    if (tmp_selectedFoods[mealType] && tmp_selectedFoods[mealType].selectedFoods.length > 0) { //选了这个餐时的菜

                        tmp_selectedFoods[mealType].selectedFoods.forEach(onefood => {


                            if (onefood.remarkList && onefood.remarkList.length > 0) {
                                //判断最后一个备注是否完整
                                let lastRemark = onefood.remarkList[onefood.remarkList.length - 1]
                                if (!lastRemark.name || !lastRemark.count) {
                                    onefood.remarkList.splice(onefood.remarkList.length - 1, 1)

                                }
                            }
                        })
                    }
                })
            }
        }
        _this.setData({
            selectedFoods: _this.data.selectedFoods
        })
        _this.getScrollHeight()
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})