import { base } from "../../../comm/public/request";
let requestModel = new base();
const baseUrl = getApp().globalData.baseUrl;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeIndex: 3,
    evaluateLabels: {}, //餐品的评价标签
    serviceEvaluateLabels: {}, //服务的评价标签
    serviceInfo: {
      star: 5,
      serviceEvaluateLabelsActive: [],
      selectedTagNum: 0,
      content: "",
      imagePaths: [],
      images: [],
    },
    remrkSucceed: false,
    getDataAlready: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userCode: wx.getStorageSync("userCode"),
      orderCode: options.orderCode,
    });
    this.handleEvaluateOrder();
  },
  /* 去评价 */
  handleEvaluateOrder: function () {
    let url =
      "/orderEvaluate/getOrderInfo?userCode=" +
      this.data.userCode +
      "&orderCode=" +
      this.data.orderCode;
    let param = { url };
    requestModel.request(param, (data) => {
      let _this = this;
      let list = data.orderFoodList;
      let orderFoodList = [];

      for (let i = 0; i < list.length; i++) {
        let a = {};
        a.foodName = list[i].foodName;
        a.foodImage = list[i].foodImage;
        a.foodQuantity = list[i].foodQuantity;
        a.foodPrice = list[i].foodPrice;
        a.foodCode = list[i].foodCode;
        a.content = "";
        a.imagePaths = [];
        a.images = [];
        orderFoodList.push(a);
      }
      _this.setData({
        orderFoodList: orderFoodList,
        getDataAlready: true,
      });

      //在已经加载出来评价的时候才展示
      const query = wx.createSelectorQuery();
      query.select(".c_scrollPosition_forCalculate").boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        console.log("c_scrollPosition_forCalculate", res);
        _this.setData({
          scrollTop: res[0].top, // #the-id节点的上边界坐标
        });
      });

      const query2 = wx.createSelectorQuery();
      query2.select(".button-view").boundingClientRect();
      query2.selectViewport().scrollOffset();
      query2.exec(function (res) {
        console.log("button-view", res);
        _this.setData({
          scrollBottom: res[0].top, // #the-id节点的上边界坐标
        });
      });

      //关闭底部
      wx.hideTabBar();
      /* 请求星级标签列表 */
      let param = {
        url:
          "/orderEvaluate/getEvaluateTagList?userCode=" + _this.data.userCode,
      };
      requestModel.request(param, (data) => {
        //处理标签 餐品标签+评价标签
        let evaluateLabels = {};
        let serviceEvaluateLabels = {};
        data.tagFoodStarList.forEach((item) => {
          evaluateLabels[item.star] = item.tagList;
        });
        data.tagServiceStarList.forEach((item) => {
          serviceEvaluateLabels[item.star] = item.tagList;
        });

        for (let i = 0; i < orderFoodList.length; i++) {
          //餐品 默认五星好评
          orderFoodList[i].star = 5;
          if (evaluateLabels[5] && evaluateLabels[5].length > 0) {
            //orderFoodList[i].evaluateLabelsActive = evaluateLabels[5] //必须用下面的深拷贝，否则每个i的数据都指向同一段内存，互相污染
            orderFoodList[i].evaluateLabelsActive = JSON.parse(
              JSON.stringify(evaluateLabels[5])
            );
            orderFoodList[i].selectedTagNum = 0;
          }
        }
        //服务 默认五星好评
        let tmp_serviceInfo = _this.data.serviceInfo;
        tmp_serviceInfo.star = 5;
        tmp_serviceInfo.selectedTagNum = 0;
        tmp_serviceInfo.serviceEvaluateLabelsActive = serviceEvaluateLabels[5];
        console.log("orderFoodList", orderFoodList);
        _this.setData({
          serviceInfo: tmp_serviceInfo,
          orderFoodList: orderFoodList,
          evaluateLabels: evaluateLabels,
          serviceEvaluateLabels: serviceEvaluateLabels,
        });
      });
    });
  },
  /* 点击标签--餐品标签 */
  handleClickLabel: function (e) {
    let _this = this;
    let { foodindex, labelindex } = e.currentTarget.dataset;
    let tmp_orderFoodList = _this.data.orderFoodList;
    let tmp_activeStatus =
      tmp_orderFoodList[foodindex].evaluateLabelsActive[labelindex].active;

    const maxNumber = 3;
    let selectedTagNum = tmp_orderFoodList[foodindex].selectedTagNum;
    //原来是true的话，正常修改为false
    if (tmp_activeStatus) {
      tmp_orderFoodList[foodindex].evaluateLabelsActive[
        labelindex
      ].active = false;
      tmp_orderFoodList[foodindex].selectedTagNum -= 1;
      _this.setData({
        orderFoodList: tmp_orderFoodList,
      });
    } else {
      if (selectedTagNum >= maxNumber) {
        wx.showToast({
          title: "最多选" + maxNumber + "个",
          image: "/images/msg/warning.png",
          duration: 1000,
        });
      } else {
        tmp_orderFoodList[foodindex].evaluateLabelsActive[
          labelindex
        ].active = true;
        tmp_orderFoodList[foodindex].selectedTagNum += 1;
        _this.setData({
          orderFoodList: tmp_orderFoodList,
        });
      }
    }
  },
  /* 点击标签--服务标签 */
  handleClickLabelService: function (e) {
    let _this = this;
    let { labelindex } = e.currentTarget.dataset;

    let tmp_serviceInfo = _this.data.serviceInfo;

    let tmp_activeStatus =
      tmp_serviceInfo.serviceEvaluateLabelsActive[labelindex].active;

    //原来是true的话，正常修改为false
    const maxNumber = 3;
    let selectedTagNum = tmp_serviceInfo.selectedTagNum;

    //原来是true的话，正常修改为false
    if (tmp_activeStatus) {
      tmp_serviceInfo.serviceEvaluateLabelsActive[labelindex].active = false;
      tmp_serviceInfo.selectedTagNum -= 1;
      _this.setData({
        serviceInfo: tmp_serviceInfo,
      });
    } else {
      if (selectedTagNum >= maxNumber) {
        wx.showToast({
          title: "最多选" + maxNumber + "个",
          image: "/images/msg/warning.png",
          duration: 1000,
        });
      } else {
        tmp_serviceInfo.serviceEvaluateLabelsActive[labelindex].active = true;
        tmp_serviceInfo.selectedTagNum += 1;
        _this.setData({
          serviceInfo: tmp_serviceInfo,
        });
      }
    }
  },
  /* 点击预览图片 */
  handlePreviewImage: function (e) {
    let foodIndex = e.currentTarget.dataset.foodindex;
    let index = e.currentTarget.dataset.index; //预览图片的编号

    let flag = e.currentTarget.dataset.flag; //判断是餐品 还是服务（SERVICE）
    let imagePaths = [];
    if (flag === "SERVICE") {
      imagePaths = this.data.serviceInfo.imagePaths;
    } else {
      imagePaths = this.data.orderFoodList[foodIndex].imagePaths;
    }
    wx.previewImage({
      current: imagePaths[index], //预览图片链接
      urls: imagePaths, //图片预览list列表
      success: function (res) {},
      fail: function () {},
    });
  },
  //删除图片
  removeOneImage(e) {
    let flag = e.currentTarget.dataset.flag; //判断是餐品 还是服务（SERVICE）
    let foodIndex = e.currentTarget.dataset.foodindex;
    let index = e.currentTarget.dataset.index; //预览图片的编号
    if (flag === "SERVICE") {
      this.data.serviceInfo.imagePaths.splice(index, 1);
      this.data.serviceInfo.images.splice(index, 1);
      this.setData({
        serviceInfo: this.data.serviceInfo,
      });
    } else {
      this.data.orderFoodList[foodIndex].imagePaths.splice(index, 1);
      this.data.orderFoodList[foodIndex].images.splice(index, 1);
      this.setData({
        orderFoodList: this.data.orderFoodList,
      });
    }
  },
  /* 点击上传图片--餐品 */
  handleClickAddImg: function (e) {
    let _this = this;
    let foodIndex = e.currentTarget.dataset.foodindex;
    let flag = e.currentTarget.dataset.flag; //判断是餐品上传还是服务（SERVICE）上传的图片
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
            if (flag === "SERVICE") {
              let tmp_data = JSON.parse(res.data);
              if (tmp_data.code == 200) {
                let tmp_serviceInfo = _this.data.serviceInfo;
                tmp_serviceInfo.imagePaths.push(res_0.tempFilePaths[0]);
                tmp_serviceInfo.images.push(tmp_data.data);
                _this.setData({
                  serviceInfo: tmp_serviceInfo, //预览图片响应式
                });
              } else {
                wx.showToast({
                  title: tmp_data.msg,
                  image: "/images/msg/error.png",
                  duration: 2000,
                });
              }
            } else {
              let tmp_data = JSON.parse(res.data);
              if (tmp_data.code == 200) {
                let tmp_orderFoodList = _this.data.orderFoodList;
                tmp_orderFoodList[foodIndex].imagePaths.push(
                  res_0.tempFilePaths[0]
                );
                tmp_orderFoodList[foodIndex].images.push(tmp_data.data);
                _this.setData({
                  orderFoodList: tmp_orderFoodList, //预览图片响应式
                });
              } else {
                wx.showToast({
                  title: tmp_data.msg,
                  image: "/images/msg/error.png",
                  duration: 2000,
                });
              }
            }
          },
        });
      },
    });
  },
  /* 去评价的对话框的确定 */
  buttonClickYes_ratings: function (e) {
    let _this = this;
    wx.requestSubscribeMessage({
      tmplIds: ["k9_hMQJDtcP6thO3JsrAjeiFFfupnsE82BaaGaWRUMM"],
      complete(res) {
        if (_this.data.operatingNow) {
          return;
        }
        _this.setData({
          operatingNow: true,
        });
        let tmpData = {
          userCode: _this.data.userCode,
          orderCode: _this.data.orderCode,
          wechatFormId: e.detail.formId,
          star: _this.data.serviceInfo.star,
          tagCodeList: [],
          content: _this.data.serviceInfo.content,
          images: _this.data.serviceInfo.images,
          foodEvaluateList: [],
        };
        _this.data.orderFoodList.forEach((food) => {
          let a = {};
          a.foodCode = food.foodCode;
          a.star = food.star;
          a.content = food.content;
          a.images = food.images;
          a.tagCodeList = [];
          food.evaluateLabelsActive.forEach((element) => {
            if (element.active) {
              a.tagCodeList.push(element.tagCode);
            }
          });
          tmpData.foodEvaluateList.push(a);
        });
        let tagCodeList = [];
        _this.data.serviceInfo.serviceEvaluateLabelsActive.forEach(
          (element) => {
            if (element.active) {
              tagCodeList.push(element.tagCode);
            }
          }
        );
        tmpData.tagCodeList = tagCodeList;

        let param = {
          url: "/orderEvaluate/orderEvaluate",
          method: "post",
          data: tmpData,
        };
        console.log("param", param);
        requestModel.request(param, () => {
          // wx.showToast({
          //     title: '成功评价',
          //     image: '/images/msg/success.png',
          //     duration: 1000
          // })
          _this.setData({
            remrkSucceed: true,
          });
          setTimeout(() => {
            wx.reLaunch({
              url: "/pages/order/order",
            });
          }, 2000);
        });
      },
    });
  },

  /* 点击星星--餐品 */
  handleClickFoodStar: function (e) {
    console.log("handleClickStar", e);
    let _this = this;
    let { star, foodindex } = e.currentTarget.dataset;

    /* 同时更新orderFoodList的star和orderFoodList属性 */
    let tmp_orderFoodList = _this.data.orderFoodList;
    tmp_orderFoodList[foodindex].star = star;
    tmp_orderFoodList[foodindex].evaluateLabelsActive = JSON.parse(
      JSON.stringify(_this.data.evaluateLabels[star])
    );
    tmp_orderFoodList[foodindex].selectedTagNum = 0;

    this.setData({
      orderFoodList: tmp_orderFoodList,
    });

    console.log("handleClickStar--star", star);
    console.log(
      "handleClickStar--_this.data.evaluateLabels",
      _this.data.evaluateLabels
    );
  },
  /* 点击星星--服务 */
  handleClickServiceStar: function (e) {
    console.log("handleClickServiceStar", e);
    let _this = this;
    let { star } = e.currentTarget.dataset;

    /* 同时更新orderFoodList的star和orderFoodList属性 */
    let tmp_serviceInfo = _this.data.serviceInfo;
    tmp_serviceInfo.star = star;
    tmp_serviceInfo.serviceEvaluateLabelsActive =
      _this.data.serviceEvaluateLabels[star];
    tmp_serviceInfo.selectedTagNum = 0; //每次点击服务标签，先要把服务标签的选中标签数归零
    this.setData({
      serviceInfo: tmp_serviceInfo,
    });

    /*         console.log('handleClickServiceStar--star', star)
                console.log('handleClickServiceStar--_this.data.evaluateLabels', _this.data.evaluateLabels) */
  },
  contentInput: function (e) {
    this.data.orderFoodList[e.currentTarget.dataset.foodindex].content =
      e.detail.value;
    this.setData({
      orderFoodList: this.data.orderFoodList,
    });
  },
  contentInputService: function (e) {
    this.data.serviceInfo.content = e.detail.value;
    this.setData({
      serviceInfo: this.data.serviceInfo,
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
  },
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
