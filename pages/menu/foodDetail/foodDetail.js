import { base } from "../../../comm/public/request";
import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 10, // 每页条数
    hasMoreDataFlag: true, //是否还有更多数据  默认还有
    itemStatusActiveFlag: true,
    //
    windowHeight: 0,
    scrollTop: 0,
    //
    foodCode: undefined,
    foodInfo: {},
    btnFlag: "all",
    ratingsInfoList: [],
    ratingsListNoResult: false,
    ratingsInfoListAll: [],
    hasContentFlag: false,
    hasImgFlag: false,
    enLargeImageShow: false,

    //
    mealDateAndTypeList: [],
    rightList: [],
    show: false,
    activeLeftItem: {},
    activeRightItem: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { foodCode } = options;
    this.setData({
      foodCode: foodCode,
    });
    let url =
      "/v3/getFoodDetail?userCode=" +
      wx.getStorageSync("userInfo").userInfo.userCode +
      "&foodCode=" +
      foodCode;
    let param = {
      url,
    };
    requestModel.request(param, (data) => {
      this.setData({
        foodInfo: data,
      });
    });

    this.initRatings();
  },
  //加入购物车
  handleAddtoCart() {
    this.getMealDateAndType();
  },

  addOneFood() {
    let _this = this;
    let param = {
      url: config.baseUrlPlus + "/v3/cart/addCart",
      method: "post",
      data: {
        userCode: wx.getStorageSync("userInfo").userInfo.userCode,
        foodCode: _this.data.foodInfo.foodCode,
        foodName: _this.data.foodInfo.foodName,
        foodPrice: _this.data.foodInfo.foodPrice,
        foodQuantity: 1,
        mealDate: _this.data.activeLeftItem.mealDate,
        mealType: _this.data.activeRightItem.value,
        image: _this.data.foodInfo.image,
      },
    };
    wx.showLoading();
    request(param, (resData) => {
      if (resData.data.code === 200) {
        wx.showToast({
          title: "添加成功",
          duration: 2000,
        });
        wx.hideLoading();
        _this.setData({
          show: false,
        });
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });
  },

  // 获取指定餐品的排餐日期和餐别
  getMealDateAndType() {
    let _this = this;
    let param = {
      url:
        config.baseUrlPlus +
        "/themeRecommend/getCanAddCartMealDateAndMealType?userCode=" +
        wx.getStorageSync("userCode") +
        "&foodCode=" +
        _this.data.foodInfo.foodCode,
      method: "get",
    };
    request(param, (resData) => {
      if (resData.data.code === 200) {
        if (resData.data.data && resData.data.data.length > 0) {
          let tmp_mealTypeList = resData.data.data[0].mealTypeList;
          _this.setData({
            mealDateAndTypeList: resData.data.data,
            rightList: tmp_mealTypeList,
            show: true,
            activeLeftItem: resData.data.data[0],
            activeRightItem: tmp_mealTypeList[0],
          });
        } else {
          wx.showToast({
            title: "未排餐",
            image: "/images/msg/error.png",
            duration: 2000,
          });
        }
      } else {
        wx.showToast({
          title: resData.data.msg,
          image: "/images/msg/error.png",
          duration: 2000,
        });
      }
    });
  },
  closeMask() {
    this.setData({
      show: false,
    });
  },
  //放大图片
  showImage(e) {
    let { image, imagelist } = e.currentTarget.dataset;
    wx.previewImage({
      current: image, //预览图片链接
      urls: imagelist, //图片预览list列表
    });
  },
  handleCloseImage() {
    this.setData({
      enLargeImageShow: false,
      enLargeImage: "",
    });
  },
  //用于解决小程序的遮罩层滚动穿透
  preventTouchMove: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {},
  // 获取高度等信息
  initRatings: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
    const query = wx.createSelectorQuery();
    query.select(".c_scrollPosition_forCalculate").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].bottom, // #the-id节点的上边界坐标
      });
    });
  },
  /* 获取评价列表 */
  getRatings: function () {
    let _this = this;
    this.setData({
      loadingData: true,
    });
    //获取后台数据
    let page = _this.data.page;
    let limit = _this.data.limit;

    requestModel.getUserCode((userCode) => {
      let url =
        "/food/getFoodEvaluate?userCode=" +
        userCode +
        "&foodCode=" +
        _this.data.foodCode +
        "&page=" +
        page +
        "&limit=" +
        limit;

      let param = { url };
      requestModel.request(param, (data) => {
        let { list, amount } = data;
        if (page == 1) {
          _this.setData({
            ratingsInfoList: list, //concat是拆开数组参数，一个元素一个元素地加进去
            loadingData: false,
            amount: amount,
          });
        } else {
          _this.setData({
            ratingsInfoList: _this.data.ratingsInfoList.concat(list), //concat是拆开数组参数，一个元素一个元素地加进去
            loadingData: false,
            amount: amount,
          });
        }
        // 大于amount，说明已经加载完了
        if (page * limit >= amount) {
          _this.setData({
            hasMoreDataFlag: false,
          });
        } else {
          _this.setData({
            hasMoreDataFlag: true,
            page: page + 1,
          });
        }
      });
    });
  },

  /* 手动点击触发下一页 */
  gotoNextPage: function () {
    if (this.data.hasMoreDataFlag) {
      this.getRatings();
    }
  },
  /* 切换标题 */
  changeItemStatusActiveFlag: function (e) {
    let flag = e.currentTarget.dataset.flag;
    if (flag == "detail") {
      this.setData({
        itemStatusActiveFlag: true,
      });
    } else if (flag == "ratings") {
      this.setData({
        itemStatusActiveFlag: false,
        page: 1,
      });
      this.getRatings(); //获取该food的评论列表
    }
  },

  /* 切换评价标签 */
  changeBtnActiveFlag: function (e) {
    if (e.currentTarget.dataset.flag == "all") {
      this.data.btnFlag = "all";
      this.setData({
        btnFlag: "all",
      });
    } else {
      this.data.btnFlag = "fivestar";
      this.setData({
        btnFlag: "fivestar",
      });
    }
  },
  /* 切换 是否内容 标签 */
  changeHasContentFlag: function () {
    this.setData({
      hasContentFlag: !this.data.hasContentFlag,
    });
  },
  /* 切换 是否有图 标签 */
  changeHasImgFlag: function () {
    this.setData({
      hasImgFlag: !this.data.hasImgFlag,
    });
  },
  clickLeftItem: function (e) {
    let { item } = e.currentTarget.dataset;
    console.log("@@@@@@@ 2 @@@@@@@ ", item);
    this.setData({
      activeLeftItem: item,
    });
  },
  clickRightItem: function (e) {
    let { item } = e.currentTarget.dataset;
    console.log("@@@@@@@ 2 @@@@@@@ ", item);
    this.setData({
      activeRightItem: item,
    });
  },
  handleDonothing() {},
  clickConfirm() {
    this.addOneFood();
  },
});
