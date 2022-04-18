import { base } from "../../../comm/public/request";
let requestModel = new base();
const baseUrl = getApp().globalData.baseUrl;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    serviceInfo: [],
    content: "",
    serviceImgInfo: {
      imagePaths: [],
      images: [],
    },
    tagDes: ["", "极差", "较差", "一般", "不错", "很好"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    requestModel.getUserCode((userCode) => {
      let param = {
        url: "/evaluate/getServiceEvaluateList?userCode=" + userCode,
      };
      requestModel.request(
        param,
        (data) => {
          let tmp_data = [];
          tmp_data.push(
            {
              title: "配送服务",
              detail: data.deliveryServiceTagList,
            },
            {
              title: "引导服务",
              detail: data.guideServiceTagList,
            },
            {
              title: "清洁卫生",
              detail: data.cleanServiceTagList,
            },
            {
              title: "现场服务",
              detail: data.siteServiceTagList,
            },
            {
              title: "餐具设备",
              detail: data.tablewareServiceTagList,
            }
          );
          _this.setData({
            serviceInfo: tmp_data,
            userCode: userCode,
          });
        },
        true
      );
    });

    _this.getHeightInfo();
  },
  //或得高度
  getHeightInfo() {
    let _this = this;
    wx.getSystemInfo({
      success(res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });

    const query = wx.createSelectorQuery();
    query.select("#button").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      console.log("button", res);
      if (res[0]) {
        _this.setData({
          scrollHeight: res[0].top,
        });
      }
    });
  },
  contentInputService: function (e) {
    this.data.content = e.detail.value;
    this.setData({
      content: this.data.content,
    });
  },
  /* 点击星星 */
  handleClickStar: function (e) {
    console.log("handleClickStar", e);
    let _this = this;
    let { selectedstar, serviceindex, detailindex, selectedtagcode } =
      e.currentTarget.dataset;
    let tmp_serviceInfo = _this.data.serviceInfo;
    tmp_serviceInfo[serviceindex].detail[detailindex].selectedStar =
      selectedstar;
    tmp_serviceInfo[serviceindex].detail[detailindex].selectedtagcode =
      selectedtagcode;
    this.setData({
      serviceInfo: tmp_serviceInfo,
    });
    console.log(tmp_serviceInfo);
  },
  /* 点击预览图片 */
  handlePreviewImage: function (e) {
    let index = e.currentTarget.dataset.index; //预览图片的编号
    let imagePaths = [];
    imagePaths = this.data.serviceImgInfo.imagePaths;
    wx.previewImage({
      current: imagePaths[index], //预览图片链接
      urls: imagePaths, //图片预览list列表
      success: function (res) {},
      fail: function () {},
    });
  },
  //删除图片
  removeOneImage(e) {
    let index = e.currentTarget.dataset.index; //预览图片的编号
    this.data.serviceImgInfo.imagePaths.splice(index, 1);
    this.data.serviceImgInfo.images.splice(index, 1);
    this.setData({
      serviceImgInfo: this.data.serviceImgInfo,
    });
  },
  /* 点击上传图片 */
  handleClickAddImg: function (e) {
    let _this = this;
    wx.chooseImage({
      count: 1, //最多可以选择的图片数，默认为9
      sizeType: ["orignal", "compressed"], //original 原图，compressed 压缩图，默认二者都有
      sourceType: ["album", "camera"], //album 从相册选图，camera 使用相机，默认二者都有
      success: function (res_0) {
        wx.uploadFile({
          url: baseUrl + "/file/uploadFile", //开发者服务器 url
          filePath: res_0.tempFilePaths[0], //要上传文件资源的路径
          name: "file", //文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
          formData: {
            //HTTP 请求中其他额外的 form data
            orderCode: _this.data.orderCode,
            userCode: _this.data.userCode,
            type: "EVALUATE",
          },
          success: function (res) {
            let tmp_data = JSON.parse(res.data);
            if (tmp_data.code == 200) {
              let tmp_serviceImgInfo = _this.data.serviceImgInfo;
              tmp_serviceImgInfo.imagePaths.push(res_0.tempFilePaths[0]);
              tmp_serviceImgInfo.images.push(tmp_data.data);
              _this.setData({
                serviceImgInfo: tmp_serviceImgInfo, //预览图片响应式
              });
            } else {
              wx.showToast({
                title: tmp_data.msg,
                image: "/images/msg/error.png",
                duration: 2000,
              });
            }
          },
        });
      },
    });
  },

  /* 评价 */
  buttonClickYes_ratings: function (e) {
    let _this = this;
    let tmpData = {
      userCode: _this.data.userCode,
      content: _this.data.content,
      images: _this.data.serviceImgInfo.images,
      tagCodeList: [],
      wechatFormId: e.detail.formId,
    };
    //拼接tagCodeList
    let tmp_serviceInfo = _this.data.serviceInfo;
    tmp_serviceInfo.forEach((element_1) => {
      element_1.detail.forEach((element_2) => {
        if (element_2.selectedtagcode) {
          tmpData.tagCodeList.push(element_2.selectedtagcode);
        }
      });
    });
    let param = {
      url: "/evaluate/serviceEvaluate",
      method: "post",
      data: tmpData,
    };
    console.log("param", param);
    requestModel.request(param, () => {
      wx.showToast({
        title: "成功评价",
        image: "/images/msg/success.png",
        duration: 1000,
      });
      setTimeout(() => {
        wx.reLaunch({
          url: "/pages/mine/mine",
        });
      }, 1000);
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
