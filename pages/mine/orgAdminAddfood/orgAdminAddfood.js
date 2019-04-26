import { addfood } from './orgAdminAddfood-model.js'
let addfoodModel = new addfood()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        value: '',
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
        number: 0,
        canadd: true,
        dateLine: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function() {
        this.setData({
            userCode: wx.getStorageSync('userInfo').userCode
        })

        this.getAddfoodData()
    },
    getAddfoodData() {
        wx.showLoading({
            title: '加载中'
        })
        let _this = this
        let userCode = _this.data.userCode
        let url = '/orgadmin/supplementary/' + userCode + '/records'
        addfoodModel.goperateWithUrl({}, url, 'get', (res) => {
            if (res.code == 0) {
                let tmp_data = res.data
                _this.setData({
                    date: tmp_data.date,
                    mealType: tmp_data.mealType,
                    list: tmp_data.list,
                    number: tmp_data.numbers,
                    canadd: true,
                    dateLine: tmp_data.dateline
                })
                wx.hideLoading()
            } else {
                _this.setData({
                    canadd: false,
                    message: res.msg
                })
                wx.hideLoading()
            }
        })
    },
    increaseFood() {
        if (this.data.value == '') {
            wx.showToast({
                title: '请输入份数',
                icon: 'none'
            })
        } else {
            let param = {
                adminCode: this.data.userCode,
                localDate: this.data.date,
                mealType: this.data.mealType,
                foodQuantity: this.data.value
            }
            let _this = this
            addfoodModel.increaseFood(param, (res) => {

                if (res.code == 0) {
                    _this.getAddfoodData()
                    wx.showToast({
                        title: '新增成功',
                        icon: 'success',
                        duration: 2000
                    })
                } else {
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        duration: 2000
                    })
                }
            })
        }
    },
    inputAddfoodNumber(event) {
        console.log(event.detail)

        let tmp_value = event.detail.value
            // if (tmp_value == '') {
            //     wx.showToast({
            //         title: '最少一份',
            //         icon: 'none',
            //         duration: 2000
            //     })
            //     tmp_value = 1

        // } else if (parseInt(tmp_value) == 0) {
        //     wx.showToast({
        //         title: '最少一份',
        //         icon: 'none',
        //         duration: 2000
        //     })
        //     tmp_value = 1
        // }
        // tmp_value = parseInt(tmp_value)
        this.setData({
            value: tmp_value
        })
    },
    editInputNum(e) {
        console.log(e)
        let index = e.currentTarget.dataset.index
        let tmp_value = e.detail.value
        if (tmp_value == '') {
            wx.showToast({
                title: '最少一份',
                icon: 'none',
                duration: 2000
            })
            tmp_value = 1

        } else if (parseInt(tmp_value) == 0) {
            wx.showToast({
                title: '最少一份',
                icon: 'none',
                duration: 2000
            })
            tmp_value = 1
        }

        let tmp_list = this.data.list
        tmp_list[index].foodQuantity = tmp_value
        this.setData({
            list: tmp_list
        })

    },
    editOneItem(e) {
        let userCode = this.data.userCode
        let foodQuantity = e.currentTarget.dataset.quantity
        let supplementCode = e.currentTarget.dataset.supplementcode
        let url = '/orgadmin/' + userCode + '/' + supplementCode + '/supplementary/' + foodQuantity
        addfoodModel.goperateWithUrl({}, url, 'put', (res) => {
            if (res.code == 0) {
                wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    },

    deleteOneItem(e) {
        let userCode = this.data.userCode
        let supplementCode = e.currentTarget.dataset.supplementcode
        let url = '/orgadmin/' + userCode + '/' + supplementCode + '/supplementary'
        let _this = this
        addfoodModel.goperateWithUrl({}, url, 'delete', (res) => {
            if (res.code == 0) {
                _this.getAddfoodData()
                wx.showToast({
                    title: '删除成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
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