//today
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
            let tmpfoodCount_more = tmpfoodCount - tmpstock.surplusNum
            //库存不足，判断是不是可以超出库存点餐beyondStockOrder=true就可以 
            if (tmp_oneFood.beyondStockOrder) {
                //超库存存在则判断超库存
                if (tmp_oneFood.foodBeyondQuota && tmp_oneFood.foodBeyondQuota.surplusNum && tmp_oneFood.foodBeyondQuota.surplusNum <= tmpfoodCount_more) {
                    wx.showToast({
                        title: '库存不足',
                        image: '/images/msg/error.png',
                        duration: 2000
                    })
                    canAddFlag = false
                } else {
                    //可以按原价点 
                    tmp_oneFood.linefoodPrice = true
                    this.setData({
                        overRemindFlag: true
                    })
                    if (this.data.overRemindTimer) {
                        clearTimeout(this.data.overRemindTimer)
                    }
                    this.data.overRemindTimer = setTimeout(() => {
                        this.setData({
                            overRemindFlag: false
                        })
                    }, 1500)
                }

            } else {
                wx.showToast({
                    title: '库存不足',
                    image: '/images/msg/error.png',
                    duration: 2000
                })
                canAddFlag = false
            }
        }
    }

    if (canAddFlag) { // 说明可以再点餐 
        //表示点击的是正常餐品，要连动修改左侧标签餐品
        if (tmp_oneFood.leftMenuTypeIndex != undefined) {
            //表示正常餐品级联了左侧标签餐品
            this.data.allMenuData[tmp_mealTypeItem].foodList[tmp_oneFood.leftMenuTypeIndex].foodList[tmp_oneFood.leftFoodIndex].foodCount += 1
            this.data.allMenuData[tmp_mealTypeItem].foodList[tmp_oneFood.leftMenuTypeIndex].foodList[tmp_oneFood.leftFoodIndex].linefoodPrice = tmp_oneFood.linefoodPrice
        }

        let addFoodPrice = 0
        if (tmp_oneFood.linefoodPrice) {
            addFoodPrice = tmp_oneFood.foodOriginalPrice
        } else {
            addFoodPrice = tmp_oneFood.foodPrice
        }

        tmp_oneFood.foodCount += 1 // 需不需要判断库存

        let tmpFoodTotalPrice = tmp_oneFood.foodTotalPrice
        //需要好好看看parseFloat,后面优化parseFloat相关内容
        tmpFoodTotalPrice = parseFloat(parseFloat(tmpFoodTotalPrice + parseFloat(addFoodPrice)).toFixed(2))
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

        let tmptotalMoney = this.data.totalMoney + addFoodPrice

        let currnt_menuData = this.data.allMenuData[tmp_mealTypeItem]
        currnt_menuData.totalMoney += addFoodPrice
        currnt_menuData.totalMoney = parseFloat(currnt_menuData.totalMoney.toFixed(2))
        if (tmp_oneFood.canMeal) { //可使用餐标
            currnt_menuData.totalMoney_meal += addFoodPrice
        } else {
            //计算不可使用餐标的钱的总额 2019--10--7
            let tmp_cantMealTotalMoney = this.data.cantMealTotalMoney
            tmp_cantMealTotalMoney = parseFloat((tmp_cantMealTotalMoney + addFoodPrice).toFixed(2))
            this.setData({
                cantMealTotalMoney: tmp_cantMealTotalMoney
            })
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
                this.handleCalculateMoney_back(currnt_menuData)

            }
        }

        let oldDeduction = currnt_menuData.deductionMoney
        currnt_menuData.deductionMoney = parseFloat(new_deduction.toFixed(2))

        let tmp_totalMoneyRealDeduction = parseFloat((this.data.totalMoneyRealDeduction - oldDeduction + new_deduction).toFixed(2))
        let tmp_realTotalMoney = (tmptotalMoney - tmp_totalMoneyRealDeduction) > 0 ? tmptotalMoney - tmp_totalMoneyRealDeduction : 0


        // 购物车中被增1的增1
        let tmp_selectedFood = this.data.selectedFoodsIndex[tmp_mealTypeItem].selectedFoods[tmp_selectedFoodIndex]
        tmp_selectedFood.foodCount++;
        tmp_selectedFood.foodTotalPrice = parseFloat((tmp_selectedFood.foodTotalPrice + addFoodPrice).toFixed(2));
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