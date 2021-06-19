import { base } from "../../comm/public/request";
let requestModel = new base();
Page({

  /**
   * 页面的初始数据
   */
  data: {
detail:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
if(options.id){
  this.getWenzhangDetail(options.id)
}

  },
  getWenzhangDetail(id) {
    let _this = this;
    let url = "/v3/getArticleDetail?id=" + id;
    let param = {
      url,
    };

    requestModel.request(param, (resData) => {
      console.log('@@@@@@@ 2 @@@@@@@ ',resData);
      if (resData&&resData.detail) {
      const regex = new RegExp("<img", "gi");
      let tmp_detail = resData.detail.replace(
        regex,
        "<img style='max-width: 100%;'"
      );
        _this.setData({
          detail:tmp_detail
        });
      }
    });
  },
})