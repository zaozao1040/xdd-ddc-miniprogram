import { base } from '../../../comm/public/request'
let requestModel = new base()
const baseUrl = getApp().globalData.baseUrl
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeIndex: 3,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.handleEvaluateOrder()
    },
    /* 去评价 */
    handleEvaluateOrder: function() {
        let options = wx.getStorageSync('commentOrder')
        console.log('commentOrder', options)
        let _this = this
        let orderCode = options.orderCode
        let list = options.orderFoodList
        let orderFoodList = []

        for (let i = 0; i < list.length; i++) {
            let a = {}
            a.foodName = list[i].foodName
            a.foodImage = list[i].foodImage
            a.foodQuantity = list[i].foodQuantity
            a.foodPrice = list[i].foodPrice
            a.foodCode = list[i].foodCode
            a.content = ''
            a.imagePaths = []
            a.images = []
            orderFoodList.push(a)

        }
        _this.setData({
            orderCode: orderCode,
            orderFoodList: orderFoodList
        })

        //关闭底部 
        wx.hideTabBar()

        //获取弹窗的高 
        /* 请求星级标签列表 */
        let param = {
            url: '/orderEvaluate/getEvaluateTagList?userCode=' + wx.getStorageSync('userCode')
        }
        requestModel.request(param, (data) => {
            //处理标签
            let evaluateLabels = {}
            data.forEach(item => {
                evaluateLabels[item.star] = item.tagList
            })

            for (let i = 0; i < orderFoodList.length; i++) {
                //当前默认五星,以及五星对应的标签
                // 默认五星好评
                orderFoodList[i].star = 5
                if (evaluateLabels[5] && evaluateLabels[5].length > 0) {
                    orderFoodList[i].evaluateLabelsActive = evaluateLabels[5]
                    orderFoodList[i].selectedTagNum = 0
                }
            }
            _this.setData({
                orderFoodList: orderFoodList,
                evaluateLabels: evaluateLabels
            })
        })
    },
    /* 点击标签 */
    handleClickLabel: function(e) {
        let _this = this
        let { foodindex, labelindex } = e.currentTarget.dataset
        let tmp_orderFoodList = _this.data.orderFoodList
        let tmp_activeStatus = tmp_orderFoodList[foodindex].evaluateLabelsActive[labelindex].active

        const maxNumber = 3
        let selectedTagNum = tmp_orderFoodList[foodindex].selectedTagNum
            //原来是true的话，正常修改为false
        if (tmp_activeStatus) {
            tmp_orderFoodList[foodindex].evaluateLabelsActive[labelindex].active = false
            tmp_orderFoodList[foodindex].selectedTagNum -= 1
            _this.setData({
                orderFoodList: tmp_orderFoodList
            })
        } else {
            if (selectedTagNum >= maxNumber) {
                wx.showToast({
                    title: '最多选' + maxNumber + '个',
                    image: '/images/msg/warning.png',
                    duration: 1000
                })
            } else {
                tmp_orderFoodList[foodindex].evaluateLabelsActive[labelindex].active = true
                tmp_orderFoodList[foodindex].selectedTagNum += 1
                _this.setData({
                    orderFoodList: tmp_orderFoodList
                })
            }
        }
    },
    /* 点击预览图片 */
    handlePreviewImage: function(e) {
        let foodIndex = e.currentTarget.dataset.foodindex;
        let index = e.currentTarget.dataset.index; //预览图片的编号
        let imagePaths = this.data.orderFoodList[foodIndex].imagePaths
        wx.previewImage({
            current: imagePaths[index], //预览图片链接
            urls: imagePaths, //图片预览list列表
            success: function(res) {

            },
            fail: function() {

            }
        })
    },
    //删除图片
    removeOneImage(e) {
        let foodIndex = e.currentTarget.dataset.foodindex;
        let index = e.currentTarget.dataset.index; //预览图片的编号
        this.data.orderFoodList[foodIndex].imagePaths.splice(index, 1)
        this.data.orderFoodList[foodIndex].images.splice(index, 1)
        this.setData({
            orderFoodList: this.data.orderFoodList,

        })
    },
    /* 点击上传图片 */
    handleClickAddImg: function(e) {
        let _this = this
        let foodIndex = e.currentTarget.dataset.foodindex
        wx.chooseImage({
            count: 1, //最多可以选择的图片数，默认为9
            sizeType: ['orignal', 'compressed'], //original 原图，compressed 压缩图，默认二者都有
            sourceType: ['album', 'camera'], //album 从相册选图，camera 使用相机，默认二者都有
            success: function(res_0) {

                wx.uploadFile({
                    url: baseUrl + '/file/uploadFile', //开发者服务器 url
                    filePath: res_0.tempFilePaths[0], //要上传文件资源的路径
                    name: 'file', //文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
                    formData: { //HTTP 请求中其他额外的 form data
                        orderCode: _this.data.orderCode,
                        userCode: wx.getStorageSync('userCode'),
                        type: 'EVALUATE'
                    },
                    success: function(res) {
                        let tmp_data = JSON.parse(res.data)
                        if (tmp_data.code == 200) {
                            let tmp_orderFoodList = _this.data.orderFoodList
                            tmp_orderFoodList[foodIndex].imagePaths.push(res_0.tempFilePaths[0])
                            tmp_orderFoodList[foodIndex].images.push(tmp_data.data)
                            _this.setData({
                                orderFoodList: tmp_orderFoodList //预览图片响应式
                            })
                            console.log('res_0.tempFilePaths[0]', res_0.tempFilePaths[0])
                            console.log('tmp_data.data', tmp_data.data)
                        } else {
                            wx.showToast({
                                title: tmp_data.msg,
                                image: '/images/msg/error.png',
                                duration: 2000
                            })
                        }
                    }
                })
            }

        })
    },
    /* 去评价的对话框的确定 */
    buttonClickYes_ratings: function(e) {
        if (this.data.operatingNow) {
            return
        }
        let _this = this
        _this.setData({
            operatingNow: true
        })
        let tmpData = {
            userCode: wx.getStorageSync('userCode'),
            orderCode: _this.data.orderCode,
            wechatFormId: e.detail.formId,
            foodEvaluateList: []
        }

        _this.data.orderFoodList.forEach(food => {
            let a = {}
            a.foodCode = food.foodCode
            a.star = food.star
            a.content = food.content
            a.images = food.images
            a.tagCodeList = []
            food.evaluateLabelsActive.forEach(element => {
                if (element.active) {
                    a.tagCodeList.push(element.tagCode)
                }
            })
            tmpData.foodEvaluateList.push(a)
        })


        let param = {
            url: '/orderEvaluate/orderEvaluate',
            method: 'post',
            data: tmpData
        }
        console.log('param', param)
        requestModel.request(param, () => {
            wx.showToast({
                title: '成功评价',
                image: '/images/msg/success.png',
                duration: 1000
            })
            setTimeout(() => {
                wx.reLaunch({
                    url: '/pages/order/order'
                })
            }, 1000)
        })
    },

    /* 点击星星 */
    handleClickStar: function(e) {
        console.log('handleClickStar', e)
        let _this = this
        let { star, foodindex } = e.currentTarget.dataset

        /* 同时更新orderFoodList的star和orderFoodList属性 */
        let tmp_orderFoodList = _this.data.orderFoodList
        tmp_orderFoodList[foodindex].star = star
        tmp_orderFoodList[foodindex].evaluateLabelsActive = _this.data.evaluateLabels[star]
        tmp_orderFoodList[foodindex].selectedTagNum = 0

        this.setData({
            orderFoodList: tmp_orderFoodList,
        })

    },

    contentInput: function(e) {
        this.data.orderFoodList[e.currentTarget.dataset.foodindex].content = e.detail.value

        this.setData({
            orderFoodList: this.data.orderFoodList
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