Component({
  /* 通信数据 */
  properties: {
    discountList: Array,
    useType: {
      type: String,
      value: 0
    },
    adviceDiscountObj:{
      type: Object,
      value: {}
    }
  },
  /* 私有数据 */
  data: {
  },
  methods: {
    handleSelectDiscount: function(e){
/*       this.setData({
        adviceDiscountObj:e.currentTarget.dataset.advicediscountobj
      })    */
      this.triggerEvent('changeselectdiscountflag', e.currentTarget.dataset.advicediscountobj)
    },
    /* 点击优惠券触发的事件 */
    handleClickDiscount: function(e){
      console.log(e.currentTarget.dataset)
    }

  },
  /* 生命周期 */
  pageLifetimes: {
    show() {
      console.log('3333',this.data.useType)
    }
  }

})