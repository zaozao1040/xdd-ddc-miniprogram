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
  },

  /**

   * 生命周期函数--监听页面加载

   */

  onLoad: function () {
    let _this = this;

    requestModel.getUserCode((userCode) => {
      _this.setData({
        userCode: userCode,
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
        "/admin/getOrderSupplement?userCode=" +
        _this.data.userCode +
        "&deliveryAddressCode=" +
        deliveryAddressCode,
    };

    requestModel.request(
      param,

      (data) => {
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

          markDetail: data.markDetail ? data.markDetail : [],
        });

        let a = 0;

        if (data.markDetail && data.markDetail.length > 0) {
          data.markDetail.forEach((item) => {
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
    this.setData({
      showQueding: true,
    });
  },

  doIncreaseFood() {
    if (!this.data.value & (this.data.value != 0)) {
      wx.showToast({
        title: "请输入份数",

        image: "/images/msg/error.png",

        duration: 2000,
      });
    } else {
      let flag = true;

      if (this.data.markDetail.length > 0) {
        let last = this.data.markDetail[this.data.markDetail.length - 1];

        if (!last.mark.trim() || !last.quantity) {
          flag = false;

          let _this = this;

          let a = {};

          a.content = "有未完成的备注，是否删除未完成的备注？";

          a.confirm = "确定删除";

          a.cancel = "一会再弄";

          _this.setData({
            modalContent: a,

            modalIndex: 3,
          });
        }
      }

      if (flag) {
        let param = {
          userCode: this.data.userCode,

          mealDate: this.data.date,

          mealType: this.data.mealType,

          foodQuantity: this.data.value,

          supplementCode: this.data.supplementCode,

          mark: this.data.remarkValue,

          markDetail: this.data.markDetail,

          deliveryAddressCode: this.data.deliveryAddressCode,
        };

        let params = {
          data: param,

          url: "/admin/updateOrderSupplement",

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
      }
    }
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

    if (this.data.markDetail.length == 0 && this.data.value > 0) {
      this.data.markDetail = [{ mark: "", quantity: this.data.value }];

      this.data.remarkCountTotal = this.data.value;

      this.setData({
        markDetail: this.data.markDetail,
      });
    } else if (this.data.remarkCountTotal < this.data.value) {
      let lastRemark = this.data.markDetail[this.data.markDetail.length - 1];

      if (lastRemark.mark.trim() && lastRemark.quantity) {
        this.data.markDetail.push({
          mark: "",

          quantity: this.data.value - this.data.remarkCountTotal,
        });

        this.data.remarkCountTotal = this.data.value;

        this.setData({
          markDetail: this.data.markDetail,
        });
      } else {
        wx.showToast({
          title: "补全备注再添加",

          image: "/images/msg/error.png",

          duration: 2000,
        });
      }
    } else {
      let _this = this;

      _this.data.popContent.show = true;

      _this.data.popContent.content =
        "备注餐品的总数量已经等于点的餐品的数量，不可再添加备注";

      _this.setData({
        popContent: _this.data.popContent,
      });
    }
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

      if (
        oldcount &&
        this.data.remarkCountTotal - oldcount + value > this.data.value
      ) {
        this.data.markDetail[remarkindex].quantity = oldcount;

        let _this = this;

        _this.data.popContent.show = true;

        _this.data.popContent.content =
          "备注餐品的总数量不能超过报餐的餐品的数量";

        _this.setData({
          popContent: _this.data.popContent,
        });
      } else {
        this.data.markDetail[remarkindex].quantity = value;

        this.data.remarkCountTotal =
          this.data.remarkCountTotal - oldcount + value;
      }

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

    if (this.data.remarkCountTotal == this.data.value) {
      this.data.popContent.show = true;

      this.data.popContent.content = "备注餐品的总数量已经等于点的餐品的数量！";

      this.setData({
        popContent: this.data.popContent,
      });
    } else {
      this.data.markDetail[remarkindex].quantity++;

      this.data.remarkCountTotal++;

      this.setData({
        markDetail: this.data.markDetail,
      });
    }
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
    //删除一条备注

    let { remarkindex } = e.currentTarget.dataset;

    let oldcount = this.data.markDetail[remarkindex].quantity;

    this.data.markDetail.splice(remarkindex, 1);

    this.data.remarkCountTotal -= oldcount;

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
