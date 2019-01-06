// pages/evaluate/evaluate.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        flag: [0, 0, 0],
        startext: ['', '', ''],
        stardata: [1, 2, 3, 4, 5],
        orderCode: '',
        num: 0,
        foods: [],
        noteMaxLen: 60, // 最多放多少字
        orderContent: "",
        noteNowLen: 0, //备注当前字数
    },
    bindTextAreaChange: function (e) {
        var that = this
        var value = e.detail.value,
            len = parseInt(value.length);
        if (len > that.data.noteMaxLen)
            return;
        that.setData({
            orderContent: value,
            noteNowLen: len
        })
    },
    
    thumbsUp: function(e){
        let foods = this.data.foods;
        let index = e.currentTarget.dataset.index;
        for (let i = 0; i < foods.length; i++) {
            if (i == index) {
                if (foods[index].star == 1||foods[index].star == 0) {
                    foods[index].star = 5;
                    foods[index].image = '../../images/icon/thumbs-up.png';
                } else {
                    foods[index].star = 0;
                    foods[index].image = '../../images/icon/thumbs-down.png';
                }
                break;
            }
        }
        this.setData({
            foods: foods
        })
    },

    bindSubmit: function (e) {
        let formId = e.detail.formId;
        let foods = this.data.foods;
        let thumbs = this.data.num;
        let orderCode = this.data.orderCode;
        let orderContent = this.data.orderContent;
        if (thumbs == 0) {
            wx.showToast({
                title: '最少一颗星',
                icon: "none"
            })
            return;
        }
        let params = {
            order:{
                orderCode: orderCode,
                star: thumbs,
                content: orderContent,
                wechatFormId: formId,
                images: [],
            },
            foods: foods
        }
        console.log(params);
        wx.request({
            url: 'http://192.168.1.123:9082/order/evaluate',
            data: params,
            method: "post",
            success: function(res){
               if(res.data.code == 0){
                   wx.switchTab({
                       url: '/pages/order-list/order-list'
                   })
                   wx.showToast({
                    title:'评价成功',
                    icon: 'none',
                    duration:2000
                })
               }else{
                   wx.showToast({
                       title: res.data.msg,
                       icon: 'none'
                   })
               }
            }
        })
        
    },

    changeColor: function(e) {
        var index = e.currentTarget.dataset.index;
        var num = e.currentTarget.dataset.no;
        var a = 'flag[' + index + ']';
        var b = 'startext[' + index + ']';
        var that = this;
        if (num == 1) {
            that.setData({
                [a]: 1,
            });
        } else if (num == 2) {
            that.setData({
                [a]: 2,
            });
        } else if (num == 3) {
            that.setData({
                [a]: 3,
            });
        } else if (num == 4) {
            that.setData({
                [a]: 4,
            });
        } else if (num == 5) {
            that.setData({
                [a]: 5,
            });
        }
        that.setData({
            num:num
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let orderCode = options.orderCode;
        this.setData({
            orderCode: orderCode
        })
        this.getOrderDetail(orderCode);
    },

    /**
     * 获取菜品详情
     */
    getOrderDetail: function(orderCode) {
        let that = this;
        
        let params = {
            userCode: wx.getStorageSync('userInfo').userCode,
            orderCode: orderCode
        }
        wx.request({
            url: 'http://192.168.1.123:9082/order/orderDetail',
            method: 'get',
            data: params,
            success: function(res) {
                let foods = res.data.data.orderFoodList;
                for (let i = 0; i < foods.length; i++) {
                    foods[i].image = "../../images/icon/thumbs-down.png";
                    foods[i].star = 1;
                }
                that.setData({
                    foods: foods
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