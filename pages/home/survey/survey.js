// pages/home/survey/survey.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        ageList: [{
                content: "20岁以内",
                active: false
            },
            {
                content: "20-30岁",
                active: false
            },
            {
                content: "30-40岁",
                active: false
            },
            {
                content: "30-40岁",
                active: false
            },
            {
                content: "50岁以上",
                active: false
            }
        ],
        tasteList: [{
                content: "偏甜",
                active: false
            },
            {
                content: "偏咸",
                active: false
            },
            {
                content: "偏酸",
                active: false
            },
            {
                content: "偏辣",
                active: false
            },
            {
                content: "偏清淡",
                active: false
            },
            {
                content: "偏肉食",
                active: false
            }
        ],
        functionList: [{
                content: "时令水果",
                active: false
            },
            {
                content: "新鲜蔬菜",
                active: false
            },
            {
                content: "水产海鲜",
                active: false
            },
            {
                content: "肉禽蛋类",
                active: false
            },
            {
                content: "米面粮油",
                active: false
            },
            {
                content: "休闲零食",
                active: false
            },
            {
                content: "家用百货",
                active: false
            }
        ],
        form: {
            age: "", // 年龄
            hometown: "", // 家乡
            yummyFood: "", // 最好吃的菜品
            newFood: "", // 最想吃或新增的菜品
            badFood: "", // 口味最差的菜品
            tasteList: [], // 偏好的口味
            functionList: [], //额外功能
            functionContent: "", // 额外哪些功能
            suggestion: "" // 意见或建议
        }
    },
    changeAge(e) {
        let index = e.currentTarget.dataset.index
        this.data.ageList.forEach(item => {
            item.active = false;
        });
        this.data.ageList[index].active = true;
        this.setData({
            ageList: this.data.ageList
        })
    },
    changeTaste(e) {
        let index = e.currentTarget.dataset.index
        this.data.tasteList[index].active = !this.data.tasteList[index].active;
        this.setData({
            tasteList: this.data.tasteList
        })
    },
    changeFunction(e) {
        let index = e.currentTarget.dataset.index
        this.data.functionList[index].active = !this.data.functionList[index].active;
        this.setData({
            functionList: this.data.functionList
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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