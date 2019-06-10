import { base } from '../../../comm/public/request'
let requestModel = new base()
const baseUrl = getApp().globalData.baseUrl
Page({

    /**
     * 页面的初始数据
     */
    data: {
        activeIndex: 5,
        complaint: {
            star: 5, //星级
            content: '', //内容
            imagePaths: [], //用于显示的本机图片
            images: [], //用于传给后台的图片路径

        }, //评价的内容
        orderCode: 'DDC585051040215203840'
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.handleEvaluateOrder()
    },
    /* 去评价 */
    handleEvaluateOrder: function() {

        let _this = this

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


            //当前默认五星,以及五星对应的标签
            // 默认五星好评

            if (evaluateLabels[5] && evaluateLabels[5].length > 0) {
                _this.data.complaint.evaluateLabelsActive = evaluateLabels[5]
                _this.data.complaint.selectedTagNum = 0
            }

            _this.setData({
                complaint: _this.data.complaint,
                evaluateLabels: evaluateLabels
            })
        })
    },
    /* 点击标签 */
    handleClickLabel: function(e) {
        let _this = this
        let labelindex = e.currentTarget.dataset.labelindex
        let tmp_complaint = _this.data.complaint
        let tmp_activeStatus = tmp_complaint.evaluateLabelsActive[labelindex].active

        const maxNumber = 3
        let selectedTagNum = tmp_complaint.selectedTagNum
            //原来是true的话，正常修改为false
        if (tmp_activeStatus) {
            tmp_complaint.evaluateLabelsActive[labelindex].active = false
            tmp_complaint.selectedTagNum -= 1
            _this.setData({
                complaint: tmp_complaint
            })
        } else {
            if (selectedTagNum >= maxNumber) {
                wx.showToast({
                    title: '最多选' + maxNumber + '个',
                    image: '/images/msg/warning.png',
                    duration: 1000
                })
            } else {
                tmp_complaint.evaluateLabelsActive[labelindex].active = true
                tmp_complaint.selectedTagNum += 1
                _this.setData({
                    complaint: tmp_complaint
                })
            }
        }
    },
    /* 点击预览图片 */
    handlePreviewImage: function(e) {

        let index = e.currentTarget.dataset.index; //预览图片的编号
        let imagePaths = this.data.complaint.imagePaths
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

        let index = e.currentTarget.dataset.index; //预览图片的编号
        this.data.complaint.imagePaths.splice(index, 1)
        this.data.complaint.images.splice(index, 1)
        this.setData({
            complaint: this.data.complaint,

        })
    },
    /* 点击上传图片 */
    handleClickAddImg: function(e) {
        let _this = this
        wx.chooseImage({
            count: 1, //最多可以选择的图片数，默认为9
            sizeType: ['orignal', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function(res_0) {
                console.log(res_0)
                wx.uploadFile({
                    url: baseUrl + '/file/uploadFile',
                    filePath: res_0.tempFilePaths[0],
                    name: 'file',
                    formData: { //HTTP 请求中其他额外的 form data
                        orderCode: _this.data.orderCode,
                        userCode: wx.getStorageSync('userCode'),
                        type: 'EVALUATE'
                    },
                    success: function(res) {
                        console.log('uploadFile', res)
                        let tmp_data = JSON.parse(res.data)
                        if (tmp_data.code == 200) {
                            let tmp_complaint = _this.data.complaint
                            tmp_complaint.imagePaths.push(res_0.tempFilePaths[0])
                            tmp_complaint.images.push(tmp_data.data)
                            _this.setData({
                                complaint: tmp_complaint //预览图片响应式
                            })

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
    buttonClickYes_complaint: function(e) {
        if (this.data.operatingNow) {
            return
        }
        let _this = this
        _this.setData({
            operatingNow: true
        })
        let tmpData = {
            userCode: wx.getStorageSync('userCode'),
            wechatFormId: e.detail.formId,
            foodEvaluateList: []
        }
        let tmp_complaint = _this.data.complaint

        let a = {}
        a.foodCode = tmp_complaint.foodCode
        a.star = tmp_complaint.star
        a.content = tmp_complaint.content
        a.images = tmp_complaint.images
        a.tagCodeList = []
        tmp_complaint.evaluateLabelsActive.forEach(element => {
            if (element.active) {
                a.tagCodeList.push(element.tagCode)
            }
        })
        tmpData.foodEvaluateList.push(a)

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
        let star = e.currentTarget.dataset.star

        /* 同时更新orderFoodList的star和orderFoodList属性 */
        let tmp_complaint = _this.data.complaint
        tmp_complaint.star = star
        tmp_complaint.evaluateLabelsActive = _this.data.evaluateLabels[star]
        tmp_complaint.selectedTagNum = 0

        this.setData({
            complaint: tmp_complaint
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