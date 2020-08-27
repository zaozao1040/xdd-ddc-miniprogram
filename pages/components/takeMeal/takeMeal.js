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
        LUNCH: [],
        DINNER: [],
        NIGHT: [],
      }
    },
    takeMealLimitMealTypes: Array,
    takeMealLimitFlag: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    selectedConfirmFlag: false,
    breakfastActiveQueue: -1,
    lunchActiveQueue: -1,
    dinnerActiveQueue: -1,
    nightActiveQueue: -1,
    breakfastStartTime: null,
    breakfastEndTime: null,
    lunchStartTime: null,
    lunchEndTime: null,
    dinnerStartTime: null,
    dinnerEndTime: null,
    nightStartTime: null,
    nightEndTime: null,
    selectedConfirmDes: null

  },

  /**
   * 组件的方法列表
   */
  methods: {

    updateSelectedConfirmFlag() {
      let tmpFlag = true //默认为true 命中下面四个if中任一个都会设置为false
      if ((this.data.takeMealLimitMealTypes.indexOf(1) !== -1) && (this.data.breakfastActiveQueue == -1)) {
        tmpFlag = false
      }
      else if ((this.data.takeMealLimitMealTypes.indexOf(2) !== -1) && (this.data.lunchActiveQueue == -1)) {
        tmpFlag = false
      }
      else if ((this.data.takeMealLimitMealTypes.indexOf(3) !== -1) && (this.data.dinnerActiveQueue == -1)) {
        tmpFlag = false
      }
      else if ((this.data.takeMealLimitMealTypes.indexOf(4) !== -1) && (this.data.nightActiveQueue == -1)) {
        tmpFlag = false
      }
      this.setData({
        selectedConfirmFlag: tmpFlag
      })
    },
    clickItem(e) {
      let _this = this
      let { type, queue, starttime, endtime } = e.currentTarget.dataset;
      if (type === 'breakfast') {
        _this.setData({
          breakfastActiveQueue: queue,
          breakfastStartTime: starttime,
          breakfastEndTime: endtime
        }, () => { _this.updateSelectedConfirmFlag() })
      } else if (type === 'lunch') {
        _this.setData({
          lunchActiveQueue: queue,
          lunchStartTime: starttime,
          lunchEndTime: endtime
        }, () => { _this.updateSelectedConfirmFlag() })
      } else if (type === 'dinner') {
        _this.setData({
          dinnerActiveQueue: queue,
          dinnerStartTime: starttime,
          dinnerEndTime: endtime
        }, () => { _this.updateSelectedConfirmFlag() })
      } else if (type === 'night') {
        _this.setData({
          nightActiveQueue: queue,
          nightStartTime: starttime,
          nightEndTime: endtime
        }, () => { _this.updateSelectedConfirmFlag() })
      }


    },

    handleConfirm() {
      if (this.data.takeMealLimitLists.BREAKFAST.length > 0 && this.data.breakfastActiveQueue == -1) {
        wx.showToast({
          title: '请选择早餐时段',
          image: '/images/msg/error.png',
          duration: 2000
        })
        return
      }
      if (this.data.takeMealLimitLists.LUNCH.length > 0 && this.data.lunchActiveQueue == -1) {
        wx.showToast({
          title: '请选择午餐时段',
          image: '/images/msg/error.png',
          duration: 2000
        })
        return
      }
      if (this.data.takeMealLimitLists.DINNER.length > 0 && this.data.dinnerActiveQueue == -1) {
        wx.showToast({
          title: '请选择晚餐时段',
          image: '/images/msg/error.png',
          duration: 2000
        })
        return
      }
      if (this.data.takeMealLimitLists.NIGHT.length > 0 && this.data.nightActiveQueue == -1) {
        wx.showToast({
          title: '请选择夜宵时段',
          image: '/images/msg/error.png',
          duration: 2000
        })
        return
      }
      let tmp_arr = []
      if (this.data.breakfastActiveQueue != -1) {
        tmp_arr.push({
          mealType: 1,
          queue: this.data.breakfastActiveQueue,
          des: '早:' + this.data.breakfastStartTime + '~' + this.data.breakfastEndTime
        })
      }
      if (this.data.lunchActiveQueue != -1) {
        tmp_arr.push({
          mealType: 2,
          queue: this.data.lunchActiveQueue,
          des: '午:' + this.data.lunchStartTime + '~' + this.data.lunchEndTime
        })
      }
      if (this.data.dinnerActiveQueue != -1) {
        tmp_arr.push({
          mealType: 3,
          queue: this.data.dinnerActiveQueue,
          des: '晚:' + this.data.dinnerStartTime + '~' + this.data.dinnerEndTime
        })
      }
      if (this.data.nightActiveQueue != -1) {
        tmp_arr.push({
          mealType: 4,
          queue: this.data.nightActiveQueue,
          des: '夜:' + this.data.nightStartTime + '~' + this.data.nightEndTime
        })
      }

      console.log('iiii', tmp_arr)
      this.triggerEvent('handleTakeMealLimitConfirm', tmp_arr)
      this.setData({
        takeMealLimitFlag: false
      })
    },
  },
  lifetimes: {

    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  // ready: function () {
  //   // 在组件实例进入页面节点树时执行
  //   console.log('33k', this.data.takeMealLimitLists)
  //   let tmp_selectedConfirm = {
  //     total: false,
  //     breakfast: false,
  //     lunch: false,
  //     dinner: false,
  //     night: false
  //   }
  //   
  // },
})
