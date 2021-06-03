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
      console.log(
        "@@@@@@@ this.data.selectedDiscountInfo @@@@@@@ ",
        userDiscountCode,
        discountMoney,
        this.data.selectedDiscountInfo
      );
      if (
        this.data.selectedDiscountInfo &&
        userDiscountCode === this.data.selectedDiscountInfo.userDiscountCode
      ) {
        // 找出那张券是选中的
        let tmp_discountList = [...this.data.discountList];
        tmp_discountList.forEach((item) => {
          item.selected = false;
        });
        this.setData({
          selectedDiscountInfo: {},
          discountList: tmp_discountList,
        });
      } else {
        // 找出那张券是选中的
        let tmp_discountList = [...this.data.discountList];
        tmp_discountList.forEach((item) => {
          if (item.userDiscountCode == userDiscountCode) {
            item.selected = true;
          } else {
            item.selected = false;
          }
        });
        this.setData({
          selectedDiscountInfo: {
            userDiscountCode,
            discountMoney,
          },
          discountList: tmp_discountList,
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
