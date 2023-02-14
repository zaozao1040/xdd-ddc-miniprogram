import { base } from "../../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    notAllowed: false,
    //送餐地址
    organizeAddressList: [],
    currentAddressIndex: 0,
    deliveryAddressCode: "",
    address: "",

    value: 0,
    date: "",
    mealType: "",
    mealTypeNameList: {
      BREAKFAST: "早餐",
      LUNCH: "午餐",
      DINNER: "晚餐",
      NIGHT: "夜宵",
    },
    list: [],
    userCode: "",
    quantity: 0,
    canadd: true,
    hasdata: false,
    hasalready: false,
    remarkCount: 0,
    markDetail: [],
    popContent: {},
    modalContent: {},
    showQueding: false,
    userInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let _this = this;
    let { userInfo } = wx.getStorageSync("userInfo");
    requestModel.getUserCode((userCode) => {
      _this.setData({
        userCode: userCode,
        userInfo: userInfo,
      });
      _this.getOrganizeAddressList();
    });
  },
  bindRemakInput(e) {
    this.setData({
      remarkValue: e.detail.value,
      remarkCount: e.detail.cursor,
    });
  },
  handleClickAddress(e) {
    let { deliveryAddressCode, address } = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    this.getAddfoodData(deliveryAddressCode);
    this.setData({
      currentAddressIndex: index,
      deliveryAddressCode: deliveryAddressCode,
      address: address,
    });
  },
  getOrganizeAddressList() {
    let _this = this;
    let param = {
      url:
        "/organize/listOrganizeDeliveryAddress?userCode=" + _this.data.userCode,
    };

    requestModel.request(param, (data) => {
      if (data instanceof Array && data.length > 0) {
        _this.getAddfoodData(data[0].deliveryAddressCode);
        _this.setData({
          organizeAddressList: data,
          deliveryAddressCode: data[0].deliveryAddressCode,
          address: data[0].address,
        });
      }
    });
  },
  getAddfoodData(deliveryAddressCode) {
    let _this = this;
    let param = {
      url:
        "/admin/getNewOrderSupplement?userCode=" +
        _this.data.userCode +
        "&deliveryAddressCode=" +
        deliveryAddressCode,
    };

    requestModel.request(
      param,
      (data) => {
        console.log("======= data ====== ", data);
        let tmp_markDetail = [];
        if (data.temporaryReport && Array.isArray(data.temporaryReport)) {
          tmp_markDetail = data.temporaryReport.map((item) => {
            return {
              mark: item.remark,
              quantity: item.foodNum,
              reportCode: item.reportCode,
            };
          });
        }
        if (tmp_markDetail.length == 0) {
          tmp_markDetail.push({ mark: "", quantity: 0 });
        }
        _this.setData({
          date: data.mealDate,
          mealType: data.mealType,
          canadd: data.add,
          hasdata: data.has,
          endTime: data.endTime,
          lunchEndTime: data.lunchEndTime,
          dinnerEndTime: data.dinnerEndTime,
          list: data.orderSupplementaryRecord,
          quantity: data.quantity,
          value: data.quantity ? data.quantity : 0,
          supplementCode: data.supplementCode,
          remarkValue: data.mark,
          remarkCount: data.mark ? data.mark.length : 0,
          markDetail: tmp_markDetail,
        });
        let a = 0;
        if (tmp_markDetail && tmp_markDetail.length > 0) {
          tmp_markDetail.forEach((item) => {
            a += item.quantity;
          });
        }
        _this.setData({
          remarkCountTotal: a,
          hasalready: true,
        });

        if (_this.data.pull) {
          wx.stopPullDownRefresh();
          _this.data.pull = false;
        }
      },
      false,
      () => {
        //不可报餐的回调
        _this.setData({
          hasalready: true,
          notAllowed: true, //不可报餐
        });
      }
    );
  },
  clickConfirm() {
    this.doIncreaseFood();
  },
  clickCancel() {
    this.setData({
      showQueding: false,
    });
  },
  increaseFood() {
    // let re = true;
    // let len = this.data.markDetail.length;
    // for (let i = 0; i < len; i++) {
    //   if (this.data.markDetail[i].quantity == 0) {
    //     re = false;
    //     i = len;
    //   }
    // }
    // if (re == false) {
    //   wx.showToast({
    //     title: "数量不可为0",
    //     image: "/images/msg/error.png",
    //     duration: 2000,
    //   });
    //   return;
    // }
    // let totalNum = this.data.markDetail.reduce((prev, cur) => {
    //   prev += cur.quantity;
    //   return prev;
    // }, 0);
    // if (totalNum == 0) {
    //   wx.showToast({
    //     title: "数量必需大于0",
    //     image: "/images/msg/error.png",
    //     duration: 2000,
    //   });
    //   return;
    // }
    this.setData({
      showQueding: true,
    });
  },
  doIncreaseFood() {
    let param = {
      userCode: this.data.userCode,
      mealDate: this.data.date,
      mealType: this.data.mealType,
      supplementCode: this.data.supplementCode,
      mark: this.data.remarkValue,
      markDetail: this.data.markDetail,
      deliveryAddressCode: this.data.deliveryAddressCode,
      //
      addressName: this.data.userInfo.deliveryAddress,
      organizeCode: this.data.userInfo.organizeCode,
      organizeName: this.data.userInfo.organizeName,
      reportMealPrice: this.data.reportMealPrice,
    };

    console.log("======= param ======= ", param);
    let params = {
      data: param,
      url: "/admin/updateNewOrderSupplement",
      method: "post",
    };
    let _this = this;
    requestModel.request(params, () => {
      _this.getAddfoodData(_this.data.deliveryAddressCode);
      wx.showToast({
        title: "报餐成功",
        icon: "success",
        duration: 2000,
      });
    });
  },
  deleteUncompleteRemark() {
    let _this = this;
    _this.data.markDetail.pop();
    _this.setData({
      markDetail: _this.data.markDetail,
      modalIndex: 0,
    });
  },
  inputAddfoodNumber(event) {
    console.log(event.detail);

    let tmp_value = event.detail.value;

    let remarkCountTotal = this.data.remarkCountTotal;
    if (remarkCountTotal > 0) {
      //备注不等于空的时候的操作
      if (tmp_value == "" || tmp_value < remarkCountTotal) {
        this.data.popContent.show = true;
        this.data.popContent.content =
          "报餐的餐品的数量不能小于备注餐品的总数量";
        this.setData({
          popContent: this.data.popContent,

          value: this.data.value,
        });
        return;
      }
    }
    if (tmp_value == "") {
      tmp_value = 0;
    }
    tmp_value = parseInt(tmp_value);
    if (tmp_value > 1000) {
      tmp_value = 0;
      wx.showToast({
        title: "不能超过1000份",
        icon: "none",
      });
    }
    this.setData({
      value: tmp_value,
    });
  },
  minus() {
    if (this.data.value > 0 && this.data.value > this.data.remarkCountTotal) {
      this.setData({
        value: this.data.value - 1,
      });
    }
  },
  add() {
    if (this.data.value < 1000) {
      this.setData({
        value: this.data.value + 1,
      });
    } else {
      wx.showToast({
        title: "不能超过1000份",
        icon: "none",
      });
    }
  },
  addRemark(e) {
    //添加备注
    this.data.markDetail.push({
      mark: "",
      quantity: 1,
      reportCode: null,
    });
    this.setData({
      markDetail: this.data.markDetail,
    });
  },
  closeModal() {
    let _this = this;
    _this.data.popContent.show = false;
    _this.setData({
      popContent: _this.data.popContent,
    });
  },
  inputRemarkName(e) {
    //添加备注name
    let value = e.detail.value;
    let { remarkindex } = e.currentTarget.dataset;
    console.log("value", value);
    value = value.replace(/\s/i, "");
    console.log("value", value);
    this.data.markDetail[remarkindex].mark = value;
    this.setData({
      markDetail: this.data.markDetail,
    });
  },
  inputRemarkCount(e) {
    //添加备注count
    let value = e.detail.value;
    let { remarkindex } = e.currentTarget.dataset;
    let _this = this;
    if (value == 0) {
      let a = {};
      a.content = "您确定删除这条备注吗？";
      a.eventParam = e.currentTarget.dataset;
      _this.setData({
        modalContent: a,
        modalIndex: 1,
      });
    } else {
      let oldcount = this.data.markDetail[remarkindex].quantity;
      //如果之前的餐品的数量不为空，那么计算现在的和是不是超过个餐品的数目
      this.data.markDetail[remarkindex].quantity = value;
      this.data.remarkCountTotal =
        this.data.remarkCountTotal - oldcount + value;

      this.setData({
        markDetail: this.data.markDetail,
      });
    }
  },
  closeModalModal() {
    this.setData({
      modalIndex: 0,
    });
  },
  handleRemarkMinus(e) {
    //添加备注
    let { remarkindex } = e.currentTarget.dataset;
    if (this.data.markDetail[remarkindex].quantity > 1) {
      this.data.markDetail[remarkindex].quantity--;
      this.data.remarkCountTotal--;
    } else {
      let _this = this;

      let a = {};
      a.content = "您确定删除这条备注吗？";
      a.eventParam = e.currentTarget.dataset;
      _this.setData({
        modalContent: a,
        modalIndex: 1,
      });
    }
    this.setData({
      markDetail: this.data.markDetail,
    });
  },
  handleRemarkAdd(e) {
    //添加备注
    let { remarkindex } = e.currentTarget.dataset;
    this.data.markDetail[remarkindex].quantity++;
    this.data.remarkCountTotal++;
    this.setData({
      markDetail: this.data.markDetail,
    });
  },
  deleteOneRemarkForModal(e) {
    //删除一条备注
    let { remarkindex } = e.detail;

    let oldcount = this.data.markDetail[remarkindex].quantity;
    this.data.markDetail.splice(remarkindex, 1);
    this.data.remarkCountTotal -= oldcount;

    this.setData({
      markDetail: this.data.markDetail,
      modalIndex: 0,
    });
  },
  deleteOneRemark(e) {
    if (this.data.markDetail.length == 1) {
      wx.showToast({
        title: "至少一条记录",
        image: "/images/msg/error.png",
        duration: 2000,
      });
      return;
    }
    // let totalNum = this.data.markDetail.reduce((prev, cur) => {
    //   prev += cur.quantity;
    //   return prev;
    // }, 0);
    // if (totalNum == 0) {
    //   wx.showToast({
    //     title: "数量必需大于0",
    //     image: "/images/msg/error.png",
    //     duration: 2000,
    //   });
    //   return;
    // }
    //删除一条备注
    let { remarkindex } = e.currentTarget.dataset;
    this.data.markDetail[remarkindex].quantity = 0;
    this.setData({
      markDetail: this.data.markDetail,
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
  onPullDownRefresh: function () {
    this.data.pull = true;
    this.getAddfoodData(this.data.deliveryAddressCode);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
