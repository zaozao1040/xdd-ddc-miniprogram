Component({
  /* 通信数据 */
  properties: {
    discountList: Array,
    useType: {
      type: String,
      value: 0,
    },
    oldSelectedDiscountInfo: {
      type: Object,
      value: {},
    },
  },
  /* 私有数据 */
  data: {
    windowHeight: 0,
    newSelectedDiscountInfo: {},
  },
  lifetimes: {
    ready: function () {
      // if (this.data.oldSelectedDiscountInfo.userDiscountCode) {
      //   this.setData({
      //     newSelectedDiscountInfo: JSON.parse(JSON.stringify(this.data.oldSelectedDiscountInfo))
      //   })
      // }
      // this.initPage()
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
      let { userDiscountCode } = e.currentTarget.dataset.item;
      if (
        userDiscountCode === this.data.newSelectedDiscountInfo.userDiscountCode
      ) {
        // 如果点击是同一个，则置空
        this.setData({
          newSelectedDiscountInfo: {},
        });
      } else {
        this.setData({
          newSelectedDiscountInfo: e.currentTarget.dataset.item,
        });
      }
    },
    handleConfirm: function () {
      this.triggerEvent(
        "changeselectdiscount",
        this.data.newSelectedDiscountInfo
      );
    },
    handleRemove: function () {
      this.triggerEvent("removeselectdiscount");
    },
  },
});
