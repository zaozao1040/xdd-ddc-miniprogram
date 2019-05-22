import { base } from '../../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {

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
        let orderFoodList = options.orderFoodList
        let orderFoodListLength = orderFoodList.length


        /* 先初始化一下tempFilePaths和content数组的内部子数组的个数 */
        let tmp_emptyArr = []
        let tmp_emptyArrString = []
        for (let i = 0; i < orderFoodListLength; i++) {
            tmp_emptyArr.push([])
            tmp_emptyArrString.push('')
        }
        _this.setData({
            tempFilePaths: tmp_emptyArr,
            content: tmp_emptyArrString,
            imagesArr: tmp_emptyArr,
            labels: tmp_emptyArr,
            evaluateLabelsActive: tmp_emptyArr
        })

        //关闭底部 
        wx.hideTabBar()
        _this.setData({
                showRatingsFlag: true,
                orderCode: orderCode,
                orderFoodList: orderFoodList,
            })
            //获取弹窗的高 
            /* 请求星级标签列表 */
        let param = {
            url: '/orderEvaluate/getEvaluateTagList?userCode=' + wx.getStorageSync('userCode')
        }
        requestModel.request(param, (data) => {

            let evaluateLabels = data
            for (let i = 0; i < orderFoodListLength; i++) { //当前默认五星,以及五星对应的标签
                orderFoodList[i].star = 5
                    // 大坑 这里必须用深拷贝！ 错误写法：orderFoodList[i].evaluateLabelsActive = _this.evaluateLabels[4].tagList
                orderFoodList[i].evaluateLabelsActive = JSON.parse(JSON.stringify(evaluateLabels[4].tagList))
            }

            _this.setData({
                orderFoodList: orderFoodList,
                evaluateLabels: data,
                evaluateLabelsActive: data[4].tagList //当前默认五星
            })

        })


    },
    /* 点击标签 */
    handleClickLabel: function(e) {
        let _this = this
        let tmp_orderFoodList = _this.data.orderFoodList
        let tmp_activeStatus = tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active
        let labelLength = tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive.length
        const maxNumber = 3
        if (tmp_activeStatus === true) { //原来是true的话，正常修改为false
            tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active = !tmp_activeStatus
            _this.setData({
                orderFoodList: tmp_orderFoodList,
            })
        } else { //原来是false的话，需要考虑做多n个标签的情况
            if (labelLength > maxNumber) { //只有当前的label列表数量大于n个时候才做判断
                let selectedLength = 0
                tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive.forEach(element => {
                    if (element.active === true) {
                        selectedLength++
                    }
                })
                if (selectedLength >= maxNumber) {
                    wx.showToast({
                        title: '最多选' + maxNumber + '个',
                        image: '/images/msg/warning.png',
                        duration: 1500
                    })
                } else {
                    tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active = !tmp_activeStatus
                    _this.setData({
                        orderFoodList: tmp_orderFoodList,
                    })
                }
            } else {
                tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive[e.currentTarget.dataset.labelindex].active = !tmp_activeStatus
                _this.setData({
                    orderFoodList: tmp_orderFoodList,
                })
            }
        }
        console.log('333333', _this.data.orderFoodList)
    },
    /* 点击预览图片 */
    handlePreviewImage: function(e) {
        let _this = this
        let foodIndex = e.currentTarget.dataset.foodindex;
        let index = e.currentTarget.dataset.index; //预览图片的编号
        wx.previewImage({
            current: _this.data.tempFilePaths[foodIndex][index], //预览图片链接
            urls: _this.data.tempFilePaths[foodIndex], //图片预览list列表
            success: function(res) {
                console.log(res);
            },
            fail: function() {
                console.log('fail')
            }
        })
    },
    /* 点击上传图片 */
    handleClickAddImg: function(e) {
        let _this = this
        wx.chooseImage({
            count: 1, //最多可以选择的图片数，默认为9
            sizeType: ['orignal', 'compressed'], //original 原图，compressed 压缩图，默认二者都有
            sourceType: ['album', 'camera'], //album 从相册选图，camera 使用相机，默认二者都有
            success: function(res_0) {
                wx.showToast({
                    title: '正在上传...',
                    icon: 'loading',
                    mask: true,
                    duration: 1000
                })
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
                            let tmp_tempFilePaths = _this.data.tempFilePaths
                            tmp_tempFilePaths[e.currentTarget.dataset.foodindex].push(res_0.tempFilePaths[0])
                            _this.setData({
                                tempFilePaths: tmp_tempFilePaths //预览图片响应式
                            })
                            _this.data.imagesArr[e.currentTarget.dataset.foodindex].push(tmp_data.data)
                        } else {
                            wx.showToast({
                                title: tmp_data.msg,
                                image: '../../images/msg/error.png',
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
        let _this = this
        let tmpData = {
            userCode: wx.getStorageSync('userCode'),
            orderCode: _this.data.orderCode,
            wechatFormId: e.detail.formId,
            foodEvaluateList: []
        }
        let length = _this.data.orderFoodList.length
        console.log('555555', _this.data.orderFoodList)
        for (let i = 0; i < length; i++) {
            _this.data.labels[i] = []
            _this.data.orderFoodList[i].evaluateLabelsActive.forEach(element => {
                if (element.active) {
                    _this.data.labels[i].push(element.tagCode)
                }
            })
            let a = {}
            a.foodCode = _this.data.orderFoodList[i].foodCode
            a.star = _this.data.orderFoodList[i].star
            a.content = _this.data.content[i]
            a.images = _this.data.imagesArr[i]
            a.tagCodeList = _this.data.labels[i]
            tmpData.foodEvaluateList.push(a)
            a = {}
        }
        console.log('评价请求的参数：', tmpData)
        let param = {
            url: '/orderEvaluate/orderEvaluate',
            method: 'post',
            data: tmpData
        }
        requestModel.request(param, (res) => {
            wx.reLaunch({
                url: '/pages/order/order',
                success: function(res) {
                    wx.showToast({
                        title: '成功评价',
                        image: '../../images/msg/success.png',
                        duration: 2000
                    })
                }
            })

        })
    },

    /* 点击星星 */
    handleClickStar: function(e) {
        let _this = this
        let starWillBeNum = 0
        if (e.currentTarget.dataset.starflag === 'yes') { //黄星
            starWillBeNum = e.currentTarget.dataset.allstarindex
        }
        if (e.currentTarget.dataset.starflag === 'no') { //灰星
            starWillBeNum = e.currentTarget.dataset.yellowstar + e.currentTarget.dataset.allstarindex
        }
        /* 同时更新orderFoodList的star和orderFoodList属性 */
        let tmp_orderFoodList = _this.data.orderFoodList
        tmp_orderFoodList[e.currentTarget.dataset.foodindex].star = starWillBeNum
        tmp_orderFoodList[e.currentTarget.dataset.foodindex].evaluateLabelsActive = _this.data.evaluateLabels[starWillBeNum - 1].tagList
        this.setData({
            orderFoodList: tmp_orderFoodList,
        })

    },
    contentInput: function(e) {
        this.data.content[e.currentTarget.dataset.foodindex] = e.detail.value
        this.setData({
            content: this.data.content,
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