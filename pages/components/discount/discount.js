Component({
  /* 通信数据 */
  properties: {
    discountList: Array,
    useType: {
      type: String,
      value: 0,
    },
    selectedDiscountInfo: {
      type: Object,
      value: {},
    },
  },
  /* 私有数据 */
  data: {
    windowHeight: 0,
    selectedDiscountInfo: {},
  },
  lifetimes: {
    ready: function () {
      setTimeout(() => {
        console.log(
          "####### 3 ####### ",
          this.data.discountList,
          this.data.selectedDiscountInfo
        );
      }, 1000);
    },
  },
  methods: {
    initPage: function () {
      let _this = this;
      wx.getSystemInfo({
        success: function (res) {
          _this.setData({
            windowHeight: res.windowHeight,
          });
        },
      });
    },
    /* 点击优惠券触发的事件 */
    handleClickDiscount: function (e) {
      let { userDiscountCode, discountMoney } = e.currentTarget.dataset.item;
      console.log("@@@@@@@ 2 @@@@@@@ ", userDiscountCode, discountMoney);
      if (
        userDiscountCode === this.data.selectedDiscountInfo.userDiscountCode
      ) {
        // 如果点击是同一个，则为空对象
        this.setData({
          selectedDiscountInfo: {},
        });
      } else {
        this.setData({
          selectedDiscountInfo: {
            userDiscountCode,
            discountMoney,
          },
        });
      }
    },
    handleConfirm: function () {
      this.triggerEvent("changeselectdiscount", this.data.selectedDiscountInfo);
    },
    handleRemove: function () {
      this.triggerEvent("removeselectdiscount");
    },
  },
});
