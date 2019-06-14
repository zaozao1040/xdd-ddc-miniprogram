import { base } from '../../../comm/public/request'
let requestModel = new base()
const baseUrl = getApp().globalData.baseUrl

Page({

  /**
   * 页面的初始数据
   */
  data: {
    serviceInfo: [],
    content:'',
    serviceImgInfo: {
      imagePaths: [],
      images: []
    },
    tagDes: ['', '极差', '较差', '一般', '不错', '很好']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    let param = {
      url: '/evaluate/getServiceEvaluateList?userCode=' + wx.getStorageSync('userCode')
    }
    requestModel.request(param, (data) => {
      let tmp_data = []
      tmp_data.push({
        title: '投送服务',
        detail: data.deliveryServiceTagList
      }, {
          title: '引导服务',
          detail: data.guideServiceTagList
        }, {
          title: '清洁卫生',
          detail: data.cleanServiceTagList
        }, {
          title: '现场服务',
          detail: data.siteServiceTagList
        }, {
          title: '餐具设备',
          detail: data.tablewareServiceTagList
        })
      _this.setData({
        serviceInfo: tmp_data
      })
      console.log('serviceInfo:', _this.data.serviceInfo)
    }, true)
  },
  contentInputService: function (e) {
    this.data.content = e.detail.value
    this.setData({
      content: this.data.content
    })
  },
  /* 点击星星 */
  handleClickStar: function (e) {
    console.log('handleClickStar', e)
    let _this = this
    let { selectedstar, serviceindex, detailindex } = e.currentTarget.dataset
    console.log('selectedstar', selectedstar)

    let tmp_serviceInfo = _this.data.serviceInfo
    tmp_serviceInfo[serviceindex].detail[detailindex].selectedStar = selectedstar
    this.setData({
      serviceInfo: tmp_serviceInfo,
    })
    console.log(tmp_serviceInfo)
    /* 同时更新orderFoodList的star和orderFoodList属性 */
    /*         let tmp_orderFoodList = _this.data.orderFoodList
            tmp_orderFoodList[foodindex].star = star
            tmp_orderFoodList[foodindex].evaluateLabelsActive = _this.data.evaluateLabels[star]
            tmp_orderFoodList[foodindex].selectedTagNum = 0
    
            this.setData({
                orderFoodList: tmp_orderFoodList,
            })
    
            console.log('handleClickStar--star', star)
            console.log('handleClickStar--_this.data.evaluateLabels', _this.data.evaluateLabels) */

  },
  /* 点击预览图片 */
  handlePreviewImage: function (e) {
    let index = e.currentTarget.dataset.index; //预览图片的编号
    let imagePaths = []
    imagePaths = this.data.serviceImgInfo.imagePaths
    wx.previewImage({
      current: imagePaths[index], //预览图片链接
      urls: imagePaths, //图片预览list列表
      success: function (res) {

      },
      fail: function () {

      }
    })
  },
  //删除图片
  removeOneImage(e) {
    let index = e.currentTarget.dataset.index; //预览图片的编号
    this.data.serviceImgInfo.imagePaths.splice(index, 1)
    this.data.serviceImgInfo.images.splice(index, 1)
    this.setData({
      serviceImgInfo: this.data.serviceImgInfo,
    })

  },
  /* 点击上传图片 */
  handleClickAddImg: function (e) {
    let _this = this
    wx.chooseImage({
      count: 1, //最多可以选择的图片数，默认为9
      sizeType: ['orignal', 'compressed'], //original 原图，compressed 压缩图，默认二者都有
      sourceType: ['album', 'camera'], //album 从相册选图，camera 使用相机，默认二者都有
      success: function (res_0) {
        wx.uploadFile({
          url: baseUrl + '/file/uploadFile', //开发者服务器 url
          filePath: res_0.tempFilePaths[0], //要上传文件资源的路径
          name: 'file', //文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
          formData: { //HTTP 请求中其他额外的 form data
            orderCode: _this.data.orderCode,
            userCode: wx.getStorageSync('userCode'),
            type: 'EVALUATE'
          },
          success: function (res) {
            let tmp_data = JSON.parse(res.data)
            if (tmp_data.code == 200) {
              let tmp_serviceImgInfo = _this.data.serviceImgInfo
              tmp_serviceImgInfo.imagePaths.push(res_0.tempFilePaths[0])
              tmp_serviceImgInfo.images.push(tmp_data.data)
              _this.setData({
                serviceImgInfo: tmp_serviceImgInfo //预览图片响应式
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


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})