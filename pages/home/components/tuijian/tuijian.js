import { base } from "../../../../comm/public/request";
import config from "../../../../comm_plus/config/config.js";
import { request } from "../../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base();
Component({
  /* 通信数据 */
  properties: {},
  /* 私有数据 */
  data: {
    foodList: [],
    labelList: [],
    activeLabelId: -99,
    foodInfo: {},
    foodLabelTypeListData:[],
    //分页
    page: 1, // 设置加载的第几次，默认是第一次
    limit: 6, // 每页条数
    loadingData:false
  },
  lifetimes: {
    ready: function () {
      let _this = this;
      _this.getLabelList();
    },
  },
  methods: {
    getLabelList: function () {
      let _this = this;
      let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
      if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
        let tmp_userInfo = tmp_tmp_userInfo.userInfo;
        let param = {
          url: "/v3/listFoodLabelType?labelTypeId=2&userCode=" +
          tmp_userInfo.userCode,
        };
        requestModel.request(param, (resData) => {
          if (resData && resData.length > 0) {
            _this.setData(
              {
                labelList: resData,
                activeLabelId: resData[0].id,
              }
            ,()=>{
              _this.getFoodList()
            });
          }
        });
      }

    },
    getFoodList: function () {
      let _this = this;
      let page = _this.data.page
      let limit = _this.data.limit
      let tmp_tmp_userInfo = wx.getStorageSync("userInfo");
      if (tmp_tmp_userInfo && tmp_tmp_userInfo.userInfo) {
        let tmp_userInfo = tmp_tmp_userInfo.userInfo;
        let param = {
          url: "/v3/listLabelFood?typeId="+_this.data.activeLabelId+"&userCode=" +
          tmp_userInfo.userCode+"&page=" +
          page+"&limit=" +
          limit,
        };
        requestModel.request(param, (resData) => {
          
          if (resData && resData.list.length > 0) {

            let tmp_list = resData.list
            if (page == 1) {
                _this.setData({
                    foodList: tmp_list,
                    loadingData: false
                })
            } else {
                _this.setData({
                    foodList: _this.data.foodList.concat(tmp_list),
                    loadingData: false
                })
            }
            //下面开始分页  
            if (page * limit >= resData.amount) { //说明已经请求完了 

                _this.setData({
                    hasMoreDataFlag: false
                })
            } else {
                _this.setData({
                    hasMoreDataFlag: true
                })
                _this.data.page = page + 1
            }
          }
        });
      }

    },


    clickLabel: function (e) {
      let _this = this;
      let {item,index} = e.currentTarget.dataset;
      _this.setData({
        activeLabelId: item.id
      },()=>{
        _this.getFoodList()
      });
    },

    gotoFoodDetail: function (e) {
      let foodCode = e.currentTarget.dataset.item.foodCode;
      wx.navigateTo({
        url: "/pages/menu/foodDetail/foodDetail?foodCode=" + foodCode,
      });
    },
    //加入购物车
    handleAddtoCart(e) {
      let tmpData = {
        foodCode: e.currentTarget.dataset.item.foodCode,
      };
      this.setData({
        foodInfo: e.currentTarget.dataset.item,
      });
      this.selectComponent("#mealDateType").show(tmpData);
    },
  },
});
