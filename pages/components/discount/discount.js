Component({
  /* 通信数据 */
  properties: {
    discountList: Array,
    useType: {
      type: String,
      value: 0,
    },
    combineDiscountInfo: {
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
      setTimeout(() => {
        console.log(
          "####### 3 ####### ",
          this.data.discountList,
          this.data.combineDiscountInfo
        );
      }, 1000);

      // if (this.data.combineDiscountInfo.userDiscountCode) {
      //   this.setData({
      //     newSelectedDiscountInfo: JSON.parse(JSON.stringify(this.data.combineDiscountInfo))
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
      console.log("@@@@@@@ 2 @@@@@@@ ", e.currentTarget.dataset.item);

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
