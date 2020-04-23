import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";

Page({
  data: {
    //
    userInfo: null,
    //
    cabinetSimpleList: [],
    currentOrganizeInfo: {},
    currentCabinetIndex: 0,
    currentCabinetInfo: {},
    cellList: [],
    currentCellInfo: {},
    foodList: [],
    //操作弹出层
    dialogTitle: "",
    showOperationFlag: {
      cabinet: false,
      cell: false,
    },
  },
  onLoad() {
    if (wx.getStorageSync("userInfo")) {
      let tmp_organizeInfo = {
        organizeCode: wx.getStorageSync("userInfo").userInfo.organizeCode,
        organizeName: wx.getStorageSync("userInfo").userInfo.organizeName,
      };
      this.data.currentOrganizeInfo = tmp_organizeInfo;
      this.setData({
        currentOrganizeInfo: tmp_organizeInfo,
      });
      console.log("asdfasfas", this.data.currentOrganizeInfo);
      this.getCabinetSimpleList();
    } else {
      //获取企业信息-----------
    }
  },
  getCabinetSimpleList: function () {
    let _this = this;
    let params = {
      url: config.baseUrl + "/cabinet/queryCabinetSimpleList",
      method: "GET",
      data: {
        organizeCode: _this.data.currentOrganizeInfo.organizeCode,
      },
    };
    request(params, (result) => {
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        let tmp_cabinetSimpleList = result.data.data || [];
        if (tmp_cabinetSimpleList.length > 0) {
          let tmp_currentCabinetInfo = tmp_cabinetSimpleList[0];
          if (tmp_currentCabinetInfo.cabinetStatus == 1) {
            wx.showToast({
              title: "该柜已离线",
              duration: 3000,
              icon: "none",
            });
          }
          _this.getCellList(tmp_currentCabinetInfo.cabinetCode);
          _this.setData({
            cabinetSimpleList: tmp_cabinetSimpleList,
            currentCabinetInfo: tmp_currentCabinetInfo,
          });
        }
      }
    });
  },
  // 点击label
  handleClickLabel: function (e) {
    let index = e.currentTarget.dataset.index;
    let item = e.currentTarget.dataset.item;
    if (item.cabinetStatus == 1) {
      wx.showToast({
        title: "该柜已离线",
        duration: 3000,
        icon: "none",
      });
    }
    if (index == this.data.currentCabinetIndex) {
      this.setData({
        dialogTitle: item.cabinetSort + " 柜",
        showOperationFlag: {
          cabinet: true,
          cell: false,
        },
      });
    } else {
      this.setData({
        currentCabinetIndex: index,
        currentCabinetInfo: item,
      });
      this.getCellList(item.cabinetCode);
    }
  },
  // 获取4*9格子列表
  getCellList: function (cabinetCode) {
    let _this = this;
    let params = {
      url: config.baseUrl + "/cell/queryCellList",
      method: "GET",
      data: {
        cabinetCode: cabinetCode,
      },
    };
    request(params, (result) => {
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        let tmp_cellList = result.data.data || [];
        let tmp_newCellList = this.generateVerticalArr(tmp_cellList);
        _this.setData({
          cellList: tmp_newCellList,
        });
      }
    });
  },
  // 转化成竖向排列
  generateVerticalArr(oldArr) {
    let newArr = [];
    if (oldArr instanceof Array) {
      for (let j = 0; j < 9; j++) {
        for (let i = 0; i < oldArr.length; i++) {
          if ((i - j) % 9 == 0) {
            newArr.push(oldArr[i]);
          }
        }
      }
    }
    return newArr;
  },
  // 绑定
  handleBind(cellInfo) {
    let _this = this;
    let { index, cabinetCode, cellSort } = cellInfo;
    wx.scanCode({
      type: "qr",
      success: (res) => {
        console.log(res);
        let params = {
          url: config.baseUrl + "/cell/bindFood",
          method: "POST",
          data: {
            cabinetCode: cabinetCode,
            cellSort: cellSort,
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
            let { userName, userCode } = result.data.data;
            let tmp_newCellList = this.data.cellList;
            tmp_newCellList[index].userName = userName;
            tmp_newCellList[index].userCode = userCode;
            _this.setData({
              cellList: tmp_newCellList,
              showOperationFlag: false,
            });
            wx.showToast({
              title: "绑定成功",
              duration: 1000,
              icon: "success",
            });
          }
        });
      },
    });
  },
  // 开格并绑定
  handleOpenBind(cellInfo) {
    let _this = this;
    let { index, cabinetCode, cellSort } = cellInfo;
    let params = {
      url: config.baseUrl + "/cell/openCell",
      method: "POST",
      data: {
        cabinetCode: cabinetCode,
        cellSort: cellSort,
      },
    };
    request(params, (result) => {
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        let cellInfo = {
          cabinetCode: cabinetCode,
          cellSort: cellSort,
          index: index,
        };
        _this.handleBind(cellInfo);
      }
    });
  },
  // 短按点击格子
  handleShortClickCell(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_handle",
      time: 1000,
      success: () => {
        let {
          runningStatus,
          cabinetCode,
          cellSort,
        } = e.currentTarget.dataset.item;
        if (runningStatus == 0) {
          wx.showToast({
            title: "单元格故障",
            duration: 2000,
            icon: "none",
          });
        } else {
          let index = e.currentTarget.dataset.index;
          let cellInfo = {
            cabinetCode,
            cellSort,
            index,
          };
          _this.handleOpenBind(cellInfo);
        }
      },
    });
  },
  // 长按点击格子
  handleLongClickCell(e) {
    let { runningStatus, cabinetCode, cellSort } = e.currentTarget.dataset.item;
    this.getFoodList(cabinetCode, cellSort);
    let index = e.currentTarget.dataset.index;
    if (runningStatus == 0) {
      wx.showToast({
        title: "单元格故障",
        duration: 2000,
        icon: "none",
      });
    } else {
      this.setData({
        dialogTitle: "第 " + (index + 1) + " 格",
        showOperationFlag: {
          cabinet: false,
          cell: true,
        },
        currentCellInfo: { index: index, ...e.currentTarget.dataset.item },
      });
    }
  },
  clickOperation() {
    this.setData({
      showOperationFlag: {
        cabinet: false,
        cell: false,
      },
    });
  },
  clickOperationStop() {},
  // 点击柜子
  clickCabinetOperation(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_handle",
      time: 1000,
      success: () => {
        let type = e.currentTarget.dataset.type;
        let url = "";
        let successMsg = "";
        if (type == "openAll") {
          url = "/cabinet/openCells";
          successMsg = "打开成功";
        } else if (type == "heatAll") {
          url = "/cabinet/heatCells";
          successMsg = "加热成功";
        } else if (type == "cancelHeatAll") {
          url = "/cabinet/cancelHeatCells";
          successMsg = "取消加热成功";
        } else if (type == "disinfectAll") {
          url = "/cabinet/disinfectCells";
          successMsg = "开启消毒灯成功";
        } else if (type == "cancelDisinfectAll") {
          url = "/cabinet/cancelDisinfectCells";
          successMsg = "关闭消毒灯成功";
        }
        let tmp_cabinetCode = _this.data.currentCabinetInfo.cabinetCode;
        let params = {
          url: config.baseUrl + url,
          method: "POST",
          data: {
            cabinetCode: tmp_cabinetCode,
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
            if (type == "heatAll" || type == "cancelHeatAll") {
              _this.getCellList(tmp_cabinetCode); //目的是刷新格子列表渲染
            }
            wx.showToast({
              title: successMsg,
              duration: 1000,
              icon: "success",
            });
            this.setData({
              showOperationFlag: {
                cabinet: false,
                cell: false,
              },
            });
          }
        });
      },
    });
  },
  // 获取格子餐品列表
  getFoodList(cabinetCode, cellSort) {
    let params = {
      url: config.baseUrl + "/cell/queryFoodList",
      method: "GET",
      data: {
        cabinetCode,
        cellSort,
      },
    };
    request(params, (result) => {
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        this.setData({
          foodList: result.data.data || [],
        });
      }
    });
  },
  // 点击格子的各种操作
  clickCellOperation(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_handle",
      time: 1000,
      success: () => {
        let type = e.currentTarget.dataset.type;
        let { cabinetCode, cellSort, index } = this.data.currentCellInfo;
        let url = "";
        let successMsg = "";
        if (type == "open") {
          url = "/cell/openCell";
          successMsg = "打开成功";
        } else if (type == "heat") {
          url = "/cell/heatCell";
          successMsg = "加热成功";
        } else if (type == "cancelHeat") {
          url = "/cell/cancelHeatCell";
          successMsg = "取消加热成功";
        } else if (type == "disinfect") {
          url = "/cell/disinfectCell";
          successMsg = "开启消毒灯成功";
        } else if (type == "cancelDisinfect") {
          url = "/cell/cancelDisinfectCell";
          successMsg = "关闭消毒灯成功";
        } else if (type == "bind") {
          let cellInfo = {
            cabinetCode,
            cellSort,
            index,
          };
          _this.handleBind(cellInfo);
          return;
        } else if (type == "openBind") {
          let cellInfo = {
            cabinetCode,
            cellSort,
            index,
          };
          _this.handleOpenBind(cellInfo);
          return;
        }
        let params = {
          url: config.baseUrl + url,
          method: "POST",
          data: {
            cabinetCode: cabinetCode,
            cellSort: cellSort,
          },
        };
        request(params, (result) => {
          if (result.data.code !== 200) {
            wx.showToast({
              title: result.data.msg,
              icon: "none",
            });
          } else {
            if (type == "heat") {
              let tmp_newCellList = this.data.cellList;
              tmp_newCellList[index].heatStatus = 1;
              _this.setData({
                cellList: tmp_newCellList,
              });
              wx.showToast({
                title: successMsg,
                duration: 1000,
                icon: "success",
              });
            } else if (type == "cancelHeat") {
              let tmp_newCellList = this.data.cellList;
              tmp_newCellList[index].heatStatus = 0;
              _this.setData({
                cellList: tmp_newCellList,
              });
              wx.showToast({
                title: successMsg,
                duration: 1000,
                icon: "success",
              });
            } else {
              wx.showToast({
                title: successMsg,
                duration: 1000,
                icon: "success",
              });
            }
          }
        });
      },
    });
  },
  // 解绑
  handleUnbind(e) {
    let _this = this;
    let orderCode = e.currentTarget.dataset.ordercode;
    let { cabinetCode, cellSort, index } = this.data.currentCellInfo;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_handle",
      time: 1000,
      success: () => {
        let params = {
          url: config.baseUrl + "/cell/cancelBindFood",
          method: "POST",
          data: {
            orderCode,
          },
        };
        request(params, (result) => {
          if (result.data.code !== 200) {
            wx.showToast({
              title: result.data.msg,
              icon: "none",
            });
          } else {
            let { userName, userCode } = result.data.data;
            let tmp_newCellList = this.data.cellList;
            tmp_newCellList[index].userName = userName;
            tmp_newCellList[index].userCode = userCode;
            _this.setData({
              cellList: tmp_newCellList,
            }); //假刷新格子列表页
            _this.getFoodList(cabinetCode, cellSort); //food列表刷新
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
