Component({
  /* 通信数据 */
  properties: {
    discountList: Array,
    useType: {
      type: String,
      value: 0
    },
    adviceDiscountObj: {
      type: Object,
      value: {}
    }
  },
  /* 私有数据 */
  data: {
  },
  methods: {
    /* 点击优惠券触发的事件 */
    handleClickDiscount: function (e) {
      this.triggerEvent('changeselectdiscount', e.currentTarget.dataset.item)
    }

  },

})