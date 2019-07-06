import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        value: 0,
        date: '',
        mealType: '',
        mealTypeNameList: {
            BREAKFAST: '早餐',
            LUNCH: '午餐',
            DINNER: '晚餐',
            NIGHT: '夜宵'
        },
        list: [],
        userCode: '',
        quantity: 0,
        canadd: true,
        hasdata: false,
        hasalready: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        let _this = this
        requestModel.getUserCode(userCode => {
            _this.setData({
                userCode: userCode
            })
            _this.getAddfoodData()
        })
    },
    getAddfoodData() {

        let _this = this
        let param = {
            url: '/admin/getOrderSupplement?userCode=' + _this.data.userCode
        }

        requestModel.request(param, (data) => {

            _this.setData({
                date: data.mealDate,
                mealType: data.mealType,
                canadd: data.add,
                hasdata: data.has,
                endTime: data.endTime,
                lunchEndTime: data.lunchEndTime,
                dinnerEndTime: data.dinnerEndTime,
                list: data.orderSupplementaryRecord,
                quantity: data.quantity,
                value: data.quantity ? data.quantity : 0,
                supplementCode: data.supplementCode
            })

            _this.setData({
                hasalready: true
            })

            if (_this.data.pull) {
                wx.stopPullDownRefresh()
                _this.data.pull = false
            }
        })
    },
    increaseFood() {
        console.log('this.data.value', this.data.value)
        if (!this.data.value & this.data.value != 0) {
            wx.showToast({
                title: '请输入份数',
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else if (this.data.quantity == this.data.value) {
            wx.showToast({
                title: '报餐数目相同',
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else {
            let param = {
                userCode: this.data.userCode,
                mealDate: this.data.date,
                mealType: this.data.mealType,
                foodQuantity: this.data.value,
                supplementCode: this.data.supplementCode
            }
            let params = {
                data: param,
                url: '/admin/updateOrderSupplement',
                method: 'post'
            }
            let _this = this
            requestModel.request(params, () => {
                _this.getAddfoodData()
                wx.showToast({
                    title: '报餐成功',
                    icon: 'success',
                    duration: 2000
                })

            })
        }
    },
    inputAddfoodNumber(event) {
        console.log(event.detail)

        let tmp_value = event.detail.value
        if (tmp_value == '') {

            tmp_value = 0
        }
        tmp_value = parseInt(tmp_value)
        if (tmp_value > 1000) {
            tmp_value = 0
            wx.showToast({
                title: '不能超过1000份',
                icon: 'none'
            })
        }
        this.setData({
            value: tmp_value
        })
    },
    minus() {
        if (this.data.value > 0) {
            this.setData({
                value: this.data.value - 1
            })
        }
    },
    add() {
        if (this.data.value < 1000) {
            this.setData({
                value: this.data.value + 1
            })
        } else {
            wx.showToast({
                title: '不能超过1000份',
                icon: 'none'
            })
        }
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
        this.data.pull = true
        this.getAddfoodData()
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