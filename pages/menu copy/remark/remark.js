// pages/menu/remark/remark.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectedFoods: [],
    mealEnglistLabel: ["breakfast", "lunch", "dinner", "night"],
    popContent: {},
    modalContent: {},
    modalIndex: 0, //1:删除一条，2：删除全部，3：删除未完成的
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let selectedFoods = wx.getStorageSync("sevenSelectedFoods");
    this.setData({
      selectedFoods: selectedFoods,
    });
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight,
        });
      },
    });
    _this.getScrollHeight();
  },
  getScrollHeight() {
    let _this = this;
    const query_1 = wx.createSelectorQuery();
    query_1.select("#c_warpper_calculation").boundingClientRect();
    query_1.selectViewport().scrollOffset();
    query_1.exec(function (res) {
      _this.setData({
        scrollHeight: res[0].height, // #the-id节点的上边界坐标
      });
    });
  },
  closeModalModal() {
    this.setData({
      modalIndex: 0,
    });
  },
  closeModal() {
    let _this = this;
    _this.data.popContent.show = false;
    _this.setData({
      popContent: _this.data.popContent,
    });
  },
  addRemark(e) {
    //添加备注
    let { dayindex, menuitem, foodindex } = e.currentTarget.dataset;
    let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[
      foodindex
    ];
    if (!onefood.remarkList || onefood.remarkList.length == 0) {
      onefood.remarkList = [{ mark: "", quantity: onefood.foodCount }];
      onefood.remarkCountTotal = onefood.foodCount;
      this.setData({
        selectedFoods: this.data.selectedFoods,
      });
      this.getScrollHeight();
    } else if (onefood.remarkCountTotal < onefood.foodCount) {
      let lastRemark = onefood.remarkList[onefood.remarkList.length - 1];
      if (lastRemark.mark.trim() && lastRemark.quantity) {
        onefood.remarkList.push({
          mark: "",
          quantity: onefood.foodCount - onefood.remarkCountTotal,
        });
        onefood.remarkCountTotal = onefood.foodCount;
        this.setData({
          selectedFoods: this.data.selectedFoods,
        });
        this.getScrollHeight();
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
  inputRemarkName(e) {
    //添加备注name
    let value = e.detail.value;
    let {
      dayindex,
      menuitem,
      foodindex,
      remarkindex,
    } = e.currentTarget.dataset;
    this.data.selectedFoods[dayindex][menuitem].selectedFoods[
      foodindex
    ].remarkList[remarkindex].mark = value;
    this.setData({
      selectedFoods: this.data.selectedFoods,
    });
  },
  inputRemarkCount(e) {
    //添加备注count
    let value = e.detail.value;
    if (value != "") {
      value = parseInt(value);
    }
    let {
      dayindex,
      menuitem,
      foodindex,
      remarkindex,
    } = e.currentTarget.dataset;
    let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[
      foodindex
    ];
    let oldcount = onefood.remarkList[remarkindex].quantity;
    //如果之前的餐品的数量不为空，那么计算现在的和是不是超过个餐品的数目

    if (value == "") {
      onefood.remarkList[remarkindex].quantity = value;
      if (oldcount) {
        onefood.remarkCountTotal = onefood.remarkCountTotal - oldcount;
      }
    } else {
      if (oldcount) {
        if (onefood.remarkCountTotal - oldcount + value > onefood.foodCount) {
          onefood.remarkList[remarkindex].quantity = oldcount;

          let tmp_pop = {};
          tmp_pop.content = "备注餐品的总数量不能超过点的餐品的数量";
          tmp_pop.show = true;
          this.setData({
            popContent: tmp_pop,
          });
        } else {
          onefood.remarkList[remarkindex].quantity = value;
          onefood.remarkCountTotal =
            onefood.remarkCountTotal - oldcount + value;
        }
      } else {
        if (onefood.remarkCountTotal + value > onefood.foodCount) {
          onefood.remarkList[remarkindex].quantity = "";

          let _this = this;
          _this.data.popContent.show = true;
          _this.data.popContent.content =
            "备注餐品的总数量不能超过点的餐品的数量";
          _this.setData({
            popContent: _this.data.popContent,
          });
        } else {
          onefood.remarkList[remarkindex].quantity = value;
          onefood.remarkCountTotal = onefood.remarkCountTotal + value;
        }
      }
    }
    this.setData({
      selectedFoods: this.data.selectedFoods,
    });
  },
  minus(e) {
    //添加备注
    let {
      dayindex,
      menuitem,
      foodindex,
      remarkindex,
    } = e.currentTarget.dataset;
    let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[
      foodindex
    ];

    if (onefood.remarkList[remarkindex].quantity > 1) {
      onefood.remarkList[remarkindex].quantity--;
      onefood.remarkCountTotal--;
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
      selectedFoods: this.data.selectedFoods,
    });
  },
  add(e) {
    let _this = this;
    //添加备注
    let {
      dayindex,
      menuitem,
      foodindex,
      remarkindex,
    } = e.currentTarget.dataset;
    let onefood =
      _this.data.selectedFoods[dayindex][menuitem].selectedFoods[foodindex];
    if (onefood.remarkCountTotal == onefood.foodCount) {
      _this.data.popContent.show = true;
      _this.data.popContent.content =
        "备注餐品的总数量已经等于点的餐品的数量！";
      _this.setData({
        popContent: _this.data.popContent,
      });
    } else {
      onefood.remarkList[remarkindex].quantity++;
      onefood.remarkCountTotal++;

      _this.setData({
        selectedFoods: _this.data.selectedFoods,
      });
    }
  },
  deleteOneRemark(e) {
    //删除一条备注
    let {
      dayindex,
      menuitem,
      foodindex,
      remarkindex,
    } = e.currentTarget.dataset;
    let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[
      foodindex
    ];
    let oldcount = onefood.remarkList[remarkindex].quantity;
    onefood.remarkList.splice(remarkindex, 1);
    onefood.remarkCountTotal -= oldcount;

    this.setData({
      selectedFoods: this.data.selectedFoods,
    });
    this.getScrollHeight();
  },
  deleteOneRemarkForModal(e) {
    //删除一条备注

    let { dayindex, menuitem, foodindex, remarkindex } = e.detail;
    let onefood = this.data.selectedFoods[dayindex][menuitem].selectedFoods[
      foodindex
    ];
    let oldcount = onefood.remarkList[remarkindex].quantity;
    onefood.remarkList.splice(remarkindex, 1);
    onefood.remarkCountTotal -= oldcount;

    this.setData({
      selectedFoods: this.data.selectedFoods,
      modalIndex: 0,
    });
    this.getScrollHeight();
  },
  //清空所有备注
  clearAllRemark() {
    let _this = this;

    _this.data.modalContent.content = "您确定清空所有备注吗？";
    _this.setData({
      modalContent: _this.data.modalContent,
      modalIndex: 2,
    });
  },
  clearAllRemarkForModal() {
    let _this = this;
    for (let i = 0; i < _this.data.selectedFoods.length; i++) {
      let tmp_selectedFoods = _this.data.selectedFoods[i];
      if (tmp_selectedFoods.count > 0) {
        _this.data.mealEnglistLabel.forEach((mealType) => {
          if (
            tmp_selectedFoods[mealType] &&
            tmp_selectedFoods[mealType].selectedFoods.length > 0
          ) {
            //选了这个餐时的菜

            tmp_selectedFoods[mealType].selectedFoods.forEach((onefood) => {
              onefood.remarkCountTotal = 0;
              onefood.remarkList = [];
            });
          }
        });
      }
    }

    _this.setData({
      selectedFoods: _this.data.selectedFoods,
      modalIndex: 0, //关闭弹窗
    });
    _this.getScrollHeight();
  },
  saveAllRemark() {
    let complete = true;
    let _this = this;
    for (let i = 0; i < _this.data.selectedFoods.length; i++) {
      let tmp_selectedFoods = _this.data.selectedFoods[i];
      if (tmp_selectedFoods.count > 0) {
        _this.data.mealEnglistLabel.forEach((mealType) => {
          if (
            tmp_selectedFoods[mealType] &&
            tmp_selectedFoods[mealType].selectedFoods.length > 0
          ) {
            //选了这个餐时的菜

            tmp_selectedFoods[mealType].selectedFoods.forEach((onefood) => {
              if (onefood.remarkList && onefood.remarkList.length > 0) {
                //判断最后一个备注是否完整
                let lastRemark =
                  onefood.remarkList[onefood.remarkList.length - 1];
                if (!lastRemark.mark || !lastRemark.quantity) {
                  console.log("lastRemark--quantity", lastRemark.quantity);
                  complete = false;
                }
              }
            });
          }
        });
      }
    }
    //如果有的备注没有填
    if (!complete) {
      let a = {};
      a.content = "有未完成的备注，是否删除未完成的备注？";
      a.confirm = "确定删除";
      a.cancel = "一会再弄";
      _this.setData({
        modalContent: a,
        modalIndex: 3,
      });
    } else {
      wx.setStorageSync("sevenSelectedFoods", _this.data.selectedFoods);

      wx.showToast({
        title: "保存成功",
        icon: "success",
      });
      wx.navigateBack({ url: "/pages/menu/today/confirm/confirm" });
    }
  },
  deleteUncompleteRemark() {
    let _this = this;
    for (let i = 0; i < _this.data.selectedFoods.length; i++) {
      let tmp_selectedFoods = _this.data.selectedFoods[i];
      if (tmp_selectedFoods.count > 0) {
        _this.data.mealEnglistLabel.forEach((mealType) => {
          if (
            tmp_selectedFoods[mealType] &&
            tmp_selectedFoods[mealType].selectedFoods.length > 0
          ) {
            //选了这个餐时的菜

            tmp_selectedFoods[mealType].selectedFoods.forEach((onefood) => {
              if (onefood.remarkList && onefood.remarkList.length > 0) {
                //判断最后一个备注是否完整
                let lastRemark =
                  onefood.remarkList[onefood.remarkList.length - 1];
                if (!lastRemark.mark || !lastRemark.quantity) {
                  onefood.remarkList.splice(onefood.remarkList.length - 1, 1);
                }
              }
            });
          }
        });
      }
    }
    _this.setData({
      selectedFoods: _this.data.selectedFoods,
      modalIndex: 0,
    });
    _this.getScrollHeight();
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
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
