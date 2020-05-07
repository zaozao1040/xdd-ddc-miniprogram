import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentOrganizeInfo: {
      type: Object,
      value: {},
    },
    onlineInfo: {
      type: Object,
      value: {},
    },
  },
  /**
   * 组件的初始数据
   */
  data: {
    //
    showOperationFlag: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickOperation() {
      this.setData({
        showOperationFlag: !this.data.showOperationFlag,
      });
    },
    clickOperationStop() {},
    // 点击企业的一键操作按钮
    clickOrganizeOperation(e) {
      let _this = this;
      jiuaiDebounce.canDoFunction({
        type: "jieliu",
        immediate: true,
        key: "key_handle",
        time: 2000,
        success: () => {
          let type = e.currentTarget.dataset.type;
          let organizeCode = e.currentTarget.dataset.organizecode;
          let url = "";
          let successMsg = "";
          if (type == "openAll") {
            url = "/organize/openCells";
            successMsg = "打开成功";
          } else if (type == "heatAll") {
            url = "/organize/heatCells";
            successMsg = "加热成功";
          } else if (type == "cancelHeatAll") {
            url = "/organize/cancelHeatCells";
            successMsg = "取消加热成功";
          } else if (type == "disinfectAll") {
            url = "/organize/cancelHeatCells";
            successMsg = "开启消毒灯成功";
          } else if (type == "cancelDisinfectAll") {
            url = "/organize/cancelHeatCells";
            successMsg = "关闭消毒灯成功";
          }
          let params = {
            url: config.baseUrl + url,
            method: "POST",
            data: {
              organizeCode,
            },
          };
          wx.showLoading({
            content: "加载中...",
          });
          request(params, (result) => {
            if (result.data.code !== 200) {
              wx.showToast({
                title: result.data.msg,
                icon: "none",
              });
            } else {
              wx.showToast({
                title: successMsg,
                duration: 1000,
                icon: "success",
              });
              _this.setData({
                showOperationFlag: false,
              });
            }
          });
        },
      });
    },
    // 扫码解绑
    clickCancelBindFood() {
      let _this = this;
      jiuaiDebounce.canDoFunction({
        type: "jieliu",
        immediate: true,
        key: "key_handle",
        time: 1000,
        success: () => {
          wx.scanCode({
            type: "qr",
            success: (res) => {
              let params = {
                url: config.baseUrl + "/cell/cancelBindFood",
                method: "POST",
                data: {
                  orderCode: res.result,
                },
              };
              request(params, (result) => {
                if (result.data.code !== 200) {
                  wx.showToast({
                    title: result.data.msg,
                    icon: "none",
                  });
                } else {
                  //这里本应刷新一下格子列表页，暂不做这个优化
                  //
                  //
                  wx.showToast({
                    title: "解绑成功",
                    duration: 1000,
                    icon: "success",
                  });
                }
              });
            },
          });
        },
      });
    },
  },
});
