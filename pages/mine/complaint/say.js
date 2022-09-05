import { base } from "../../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeNum: 0,
    count: 0,
    max: 6,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let wordList = [{
    //         title: '菜品丰富',
    //         active: true,
    //     },
    //     {
    //         title: '食材新鲜',
    //         active: false,
    //     },
    //     {
    //         title: '好吃不油腻',
    //         active: false,
    //     },
    //     {
    //         title: '食材很新鲜',
    //         active: false,
    //     },
    //     {
    //         title: '食材新鲜',
    //         active: false
    //     }
    // ]
    // this.setData({
    //     wordList: wordList
    // })
    let _this = this;
    wx.getSystemInfo({
      success(res) {
        if (res) {
          _this.setData({
            windowHeight: res.windowHeight,
          });
        }
      },
    });

    _this.getRecommendTopics();
  },
  getRecommendTopics() {
    let _this = this;
    let url =
      "/help/getRecommendUserTopicList?userCode=" +
      wx.getStorageSync("userCode");
    let param = { url };
    requestModel.request(param, (data) => {
      data.forEach((item) => {
        item.active = false;
      });
      _this.setData({
        wordList: data,
      });
    });
  },
  deleteOne(e) {
    let index = e.currentTarget.dataset.index;
    this.data.wordList.splice(index, 1);
    this.setData({
      wordList: this.data.wordList,
    });
  },
  changeSelect(e) {
    let _this = this;
    let index = e.currentTarget.dataset.index;
    let item = _this.data.wordList[index];
    if (item.active) {
      item.active = false;
      _this.data.activeNum--;
      _this.setData({
        wordList: _this.data.wordList,
      });
    } else {
      if (_this.data.activeNum == _this.data.max) {
        wx.showToast({
          title: "最多选" + _this.data.max + "个",
          icon: "none",
          duration: 2000,
        });
      } else {
        item.active = true;
        _this.data.activeNum++;
        _this.setData({
          wordList: _this.data.wordList,
        });
      }
    }
  },
  bindTextAreaInput(e) {
    if (e.detail.value) {
      this.setData({
        value: e.detail.value,
        count: e.detail.cursor,
      });
    }
  },
  gotoAddWords() {
    wx.navigateTo({
      url: "./words/words",
    });
  },
  buttonClickYes_ratings: function (e) {
    let _this = this;
    wx.requestSubscribeMessage({
      tmplIds: ["k9_hMQJDtcP6thO3JsrAjeiFFfupnsE82BaaGaWRUMM"],
      complete(res) {
        _this.makeComplaints();
      },
    });
  },
  makeComplaints() {
    let _this = this;
    if (_this.data.value) {
      let param = {};
      param.userCode = wx.getStorageSync("userCode");
      param.content = _this.data.value;
      let topicCodeList = [];
      _this.data.wordList.forEach((item) => {
        if (item.active) {
          topicCodeList.push(item.topicCode);
        }
      });
      param.topicCodeList = topicCodeList;
      let url = "/help/submitSuggestion";
      let params = {
        data: param,
        url,
        method: "post",
      };

      requestModel.request(params, () => {
        wx.showToast({
          title: "吐槽完成",
          icon: "success",
          duration: 2000,
        });

        wx.navigateBack({
          url: "./complaint",
        });

        wx.setStorageSync("refreshComplaint", true);
      });
    } else {
      wx.showToast({
        title: "填写吐槽内容",
        icon: "none",
        duration: 2000,
      });
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let addNewWord = wx.getStorageSync("addNewWord");
    if (this.data.activeNum < 6 && addNewWord) {
      addNewWord.active = true;
      this.data.activeNum++;
      this.data.wordList.unshift(addNewWord);
      this.setData({
        wordList: this.data.wordList,
      });
    }
    wx.removeStorageSync("addNewWord");
  },

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
