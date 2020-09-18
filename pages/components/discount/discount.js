Component({
  /* 通信数据 */
  properties: {
    discountList: Array,
    useType: {
      type: String,
      value: 0
    },
    discountSelectedInfo: {
      type: Object,
      value: {}
    }
  },
  /* 私有数据 */
  data: {
    windowHeight: 0,
    currentDiscountSelectedInfo: {}
  },
  lifetimes: {
    ready: function () {
      this.initPage()
    },
  },
  methods: {
    initPage: function () {
      let _this = this
      wx.getSystemInfo({
        success: function (res) {
          _this.setData({
            windowHeight: res.windowHeight
          })
        }
      })
    },
    /* 点击优惠券触发的事件 */
    handleClickDiscount: function (e) {
      let { userDiscountCode } = e.currentTarget.dataset.item
      if (userDiscountCode === this.data.currentDiscountSelectedInfo.userDiscountCode) {
        // 如果点击是同一个，则置空
        this.setData({
          currentDiscountSelectedInfo: {}
        })
      } else {
        this.setData({
          currentDiscountSelectedInfo: e.currentTarget.dataset.item
        })
      }
    },
    handleConfirm: function () {
      console.log('this.data.currentDiscountSelectedInfo', this.data.currentDiscountSelectedInfo)
      this.triggerEvent('changeselectdiscount', this.data.currentDiscountSelectedInfo)
    },
    handleRemove: function () {
      console.log('xxxxx', this.data.discountSelectedInfo)
      this.triggerEvent('removeselectdiscount', this.data.discountSelectedInfo)
    }

  },

})