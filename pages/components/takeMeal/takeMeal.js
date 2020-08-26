// pages/components/takeMeal/takeMeal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    takeMealLimitLists: {
      type: Object,
      value: {
        BREAKFAST: [],
        LAUNCH: [],
        DINNER: [],
        NIGHT: [],
      }
    },
    takeMealLimitFlag: Boolean,
    content: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    canClickConfirm: {
      total: false,
      breakfast: false,
      lunch: false,
      dinner: false,
      night: false
    },
    selectedMealTypeList: [],
    // takeMealLimitFlag: false,
    // takeMealLimitBreakfastList: [],
    // takeMealLimitLunchList: [],
    // takeMealLimitDinnerList: [],
    // takeMealLimitNightList: [],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleConfirm() {
      if (this.data.canClickConfirm.total === false) {
        wx.showToast({
          title: '请选择时段',
          image: '/images/msg/error.png',
          duration: 2000
        })
      }
    },
  },
  observers: {
    'takeMealLimitLists': function (takeMealLimitLists) {
      console.log('takeMealLimitLists', takeMealLimitLists)
    }
  },
  lifetimes: {

    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  // ready: function () {
  //   // 在组件实例进入页面节点树时执行
  //   console.log('33k', this.data.takeMealLimitLists)
  //   let tmp_canClickConfirm = {
  //     total: false,
  //     breakfast: false,
  //     lunch: false,
  //     dinner: false,
  //     night: false
  //   }
  //   if (this.data.takeMealLimitLists.BREAKFAST.length == 0) {
  //     tmp_canClickConfirm.breakfast = true
  //   }
  //   if (this.data.takeMealLimitLists.LUNCH.length == 0) {
  //     tmp_canClickConfirm.lunch = true
  //   }
  //   if (this.data.takeMealLimitLists.DINNER.length == 0) {
  //     tmp_canClickConfirm.dinner = true
  //   }
  //   if (this.data.takeMealLimitLists.NIGHT.length == 0) {
  //     tmp_canClickConfirm.night = true
  //   }
  //   this.setData({
  //     canClickConfirm: tmp_canClickConfirm
  //   })
  // },
})
