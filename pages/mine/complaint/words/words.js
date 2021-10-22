import { base } from "../../../../comm/public/request";
let requestModel = new base();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    activeLeft: 0,
    value: "",
    leftList: [
      {
        name: "我的",
        title: "我创建的 ",
        list: [],
        hasMoreDataFlag: true,
        page: 1,
        limit: 10,
      },
      {
        name: "推荐",
        title: "推荐",
        list: [],
        hasMoreDataFlag: true,
        page: 1,
        limit: 10,
      },
      {
        name: "好评",
        title: "好评",
        list: [],
        hasMoreDataFlag: true,
        page: 1,
        limit: 10,
      },
      {
        name: "吐槽",
        title: "吐槽",
        list: [],
        hasMoreDataFlag: true,
        page: 1,
        limit: 10,
      },
    ],
  },
  bindInput(e) {
    this.setData({
      value: e.detail.value,
    });
  },
  changeActiveLeft(e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      activeLeft: index,
    });

    if (this.data.leftList[index].list.length == 0) {
      this.getList();
    }
  },
  //创建反馈
  createMineWords() {
    // let word = this.data.value
    // word = word.trim()
    // let item = this.data.leftList[0].list
    // if (item.includes(word)) {
    //     return
    // }
    // item.unshift(word)
    // this.setData({
    //     leftList: this.data.leftList,
    //     value: '',
    // })
    let _this = this;
    _this.setData({
      activeLeft: 0,
    });
    let url = "/help/createUserTopic";
    let param = {
      userCode: wx.getStorageSync("userCode"),
      content: this.data.value,
    };
    let params = {
      url,
      data: param,
      method: "post",
    };
    requestModel.request(params, (data) => {
      _this.data.leftList[_this.data.activeLeft].page = 1;

      _this.setData({
        value: "",
      });
      _this.getList();
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

    const query = wx.createSelectorQuery();
    query.select(".wrapper").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].bottom, // #the-id节点的上边界坐标
      });
    });

    _this.getList();
  },

  getList() {
    let _this = this;
    let type = _this.data.activeLeft;
    let oneList = _this.data.leftList[type];

    let url =
      "/help/getUserTopicList?userCode=" +
      wx.getStorageSync("userCode") +
      "&type=" +
      (type + 1) +
      "&page=" +
      oneList.page +
      "&limit=" +
      oneList.limit;
    let param = {
      url,
    };
    requestModel.request(param, (data) => {
      let { list, amount } = data;
      if (oneList.page == 1) {
        oneList.list = list;
      } else {
        oneList.list = oneList.list.concat(list);
      }
      // 大于amount，说明已经加载完了
      if (oneList.page * oneList.limit >= amount) {
        oneList.hasMoreDataFlag = false;
        _this.data.leftList[type] = oneList; //需要吗？？
        _this.setData({
          leftList: _this.data.leftList,
        });
      } else {
        oneList.hasMoreDataFlag = true;
        oneList.page++;
        _this.data.leftList[type] = oneList; //需要吗？？
        _this.setData({
          leftList: _this.data.leftList,
        });
      }
    });
  },
  gotoNextPage: function () {
    if (this.data.leftList[this.data.activeLeft].hasMoreDataFlag) {
      this.getList();
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
    this.setData({
      // this.setData({
      scrollToView: "right10",
      // })
    });
  },
  handleAddWords(e) {
    let word = e.currentTarget.dataset.word;
    console.log("word", word);
    wx.setStorageSync("addNewWord", word);
    wx.navigateBack({
      delta: 1,
    });
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
