import config from "../../../comm_plus/config/config.js";
import { request } from "../../../comm_plus/public/request.js";
import jiuaiDebounce from "../../../comm_plus/jiuai-debounce/jiuai-debounce.js";

Page({
  data: {
    //自定义loading
    loading: false,
    //
    currentFoodtype: 'LUNCH',
    //
    userCode: "",
    userInfo: null,
    //
    cabinetList: [],
    currentOrganizeInfo: {},
    currentCabinetIndex: 0,
    currentCabinetInfo: {},
    cellList: [],
    currentCellInfo: {},
    foodList: [],
    //传递给header子组件
    onlineInfo: {},
    //操作弹出层
    dialogTitle: "",
    showOperationFlag: {
      cabinet: false,
      cell: false,
      mergeBind: false,
    },
    //合并绑定
    currentUserName: "",
    currentHeatStatus: undefined,
    currentOrderCode: "",
    mergeFoodList: [],
  },
  onPullDownRefresh() {
    this.getCabinetList();
    this.setData({
      currentCabinetIndex: 0,
      currentCabinetInfo: this.data.cabinetList[0],
    });
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
        userCode: wx.getStorageSync("userInfo").userInfo.userCode,
      });
      this.getCabinetList();
    } else {
      //获取企业信息-----------
    }
  },
  handleClickFoodtype: function (e) {
    let _this = this
    let foodtype = e.currentTarget.dataset.foodtype;
    _this.setData({
      currentFoodtype: foodtype
    }, () => {
      this.getCellList(_this.data.currentCabinetInfo.cabinetCode);
    });
  },
  getCabinetList: function () {
    let _this = this;
    let params = {
      url: config.baseUrl + "/client/cabinet/queryCabinetListByOrganizeCode",
      method: "GET",
      data: {
        organizeCode: _this.data.currentOrganizeInfo.organizeCode,
        userCode: _this.data.userCode,
      },
    };
    request(params, (result) => {
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        let tmp_cabinetList = result.data.data || [];
        if (tmp_cabinetList.length > 0) {
          let tmp_currentCabinetInfo = tmp_cabinetList[0];
          if (tmp_currentCabinetInfo.cabinetStatus == 1) {
            wx.showToast({
              title: "该柜已离线",
              duration: 3000,
              icon: "none",
            });
          }
          _this.getCellList(tmp_currentCabinetInfo.cabinetCode);
          _this.getCabinetOnlineStatusInfo(tmp_currentCabinetInfo.cabinetCode);
          _this.setData({
            cabinetList: tmp_cabinetList,
            currentCabinetInfo: tmp_currentCabinetInfo,
          });
        }
      }
    });
  },
  // 获取柜子的在线状态
  getCabinetOnlineStatusInfo(cabinetCode) {
    let _this = this;
    let tmp_cabinetCode = "";
    if (cabinetCode) {
      tmp_cabinetCode = cabinetCode;
    } else {
      tmp_cabinetCode = _this.data.currentCabinetInfo.cabinetCode;
    }
    let params = {
      url: config.baseUrl + "/client/cabinet/queryCabinetOnlineStatus",
      method: "get",
      // needLoading: true,
      data: {
        cabinetCode: tmp_cabinetCode,
        userCode: _this.data.userCode,
      },
    };
    request(params, (result) => {
      if (
        result.data.code === 200 &&
        _this.data.onlineInfo.status !== result.data.data.cabinetOnlineStaus
      ) {
        let tmp_onlineInfo = {
          status: result.data.data.cabinetOnlineStaus,
          des: ["离线", "在线", "未激活"][result.data.data.cabinetOnlineStaus],
        };
        _this.setData({
          onlineInfo: tmp_onlineInfo,
        });
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
          mergeBind: false,
        },
      });
    } else {
      this.setData({
        currentCabinetIndex: index,
        currentCabinetInfo: item,
      });
      this.getCellList(item.cabinetCode);
      this.getCabinetOnlineStatusInfo(item.cabinetCode);
    }
  },
  // 获取4*9格子列表 
  getCellList: function (cabinetCode) {
    let _this = this;
    let params = {
      url: config.baseUrl + "/ningxia/getCabinetUserAndFood",
      method: "GET",
      data: {
        cabinetCode: cabinetCode,
        mealType: _this.data.currentFoodtype,
        organizeCode: _this.data.currentOrganizeInfo.organizeCode,
      },
    };
    _this.setData({
      loading: true,
    });
    request(params, (result) => {
      _this.setData({
        loading: false,
      });
      if (result.data.code !== 200) {
        wx.showToast({
          title: result.data.msg,
          icon: "none",
        });
      } else {
        let tmp_cellList = result.data.data || [];
        //let tmp_newCellList = this.generateVerticalArr(tmp_cellList);
        _this.setData({
          cellList: tmp_cellList,
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

  // 绑定（初次）
  handleFirstBind(cellInfo) {
    let _this = this;
    let { index, cabinetCode, cellSort } = cellInfo;
    wx.scanCode({
      type: "qr",
      success: (res) => {
        let params = {
          url: config.baseUrl + "/client/cell/bindFood",
          method: "POST",
          data: {
            cabinetCode: cabinetCode,
            cellSort: cellSort,
            orderCode: res.result,
            bindType: "first",
          },
        };
        request(params, (result) => {
          if (result.data.code === 1001) {
            _this.setData({
              currentUserName: result.data.data.userName,
              currentHeatStatus: result.data.data.heatStatus,
              mergeFoodList: result.data.data.mergeFoodList,
              showOperationFlag: {
                cabinet: false,
                cell: false,
                mergeBind: true,
              },
              currentOrderCode: res.result,
              currentCellInfo: cellInfo, //这里为了展示格子编号
            });
          } else if (result.data.code !== 200) {
            wx.showToast({
              title: result.data.msg,
              icon: "none",
            });
          } else {
            let { userName, userCode, heatStatus } = result.data.data;
            let tmp_newCellList = this.data.cellList;
            tmp_newCellList[index].userName = userName;
            tmp_newCellList[index].userCode = userCode;
            tmp_newCellList[index].heatStatus = heatStatus;
            _this.setData({
              cellList: tmp_newCellList,
            });
            wx.showToast({
              title: "绑定成功",
              icon: "success",
            });
          }
        });
      },
      fail: (res) => {
        wx.showToast({
          title: "扫描失败",
          icon: "none",
        });
      },
    });
  },
  // 绑定（合并）
  handleMergeBind(e) {
    let _this = this;
    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_handleMergeBind",
      time: 500,
      success: () => {
        let {
          index,
          cabinetCode,
          cellSort,
          heatStatus,
        } = e.currentTarget.dataset.item;
        if (_this.data.currentHeatStatus != heatStatus) {
          wx.showModal({
            title: '不允许合绑',
            content: '两种餐品加热状态不一致，不能放在同一个格子',
            showCancel: false,
            confirmText: "确定",
          })
          return;
        }
        let params = {
          url: config.baseUrl + "/client/cell/openCell",
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
            let params = {
              url: config.baseUrl + "/client/cell/bindFood",
              method: "POST",
              data: {
                cabinetCode: cabinetCode,
                cellSort: cellSort,
                orderCode: _this.data.currentOrderCode,
                bindType: "merge",
              },
            };
            request(params, (result) => {
              if (result.data.code !== 200) {
                wx.showToast({
                  title: result.data.msg,
                  icon: "none",
                });
              } else {
                _this.setData({
                  showOperationFlag: {
                    cabinet: false,
                    cell: false,
                    mergeBind: false,
                  },
                });
                wx.showToast({
                  title: "绑定成功",
                  icon: "success",
                });
              }
            });
          }
        });
      },
    });
  },
  handleMergeBindNotHeatStatus() {
    wx.showModal({
      title: '不允许合绑',
      content: '两种餐品加热状态不一致，不能放在同一个格子',
      showCancel: false,
      confirmText: "确定",
    })
  },
  // 绑定（继续）
  handleContinueBind() {
    let _this = this;
    console.log(_this.data.currentOrderCode, '4');

    jiuaiDebounce.canDoFunction({
      type: "jieliu",
      immediate: true,
      key: "key_handleContinueBind",
      time: 2000,
      success: () => {
        let { index, cabinetCode, cellSort } = _this.data.currentCellInfo;
        let params = {
          url: config.baseUrl + "/client/cell/bindFood",
          method: "POST",
          data: {
            cabinetCode: cabinetCode,
            cellSort: cellSort,
            orderCode: _this.data.currentOrderCode,
            bindType: "continue",
          },
        };
        request(params, (result) => {
          if (result.data.code !== 200) {
            wx.showToast({
              title: result.data.msg,
              icon: "none",
            });
          } else {
            let { userName, userCode, heatStatus } = result.data.data;
            let tmp_newCellList = this.data.cellList;
            tmp_newCellList[index].userName = userName;
            tmp_newCellList[index].userCode = userCode;
            tmp_newCellList[index].heatStatus = heatStatus;
            _this.setData({
              cellList: tmp_newCellList,
              showOperationFlag: {
                cabinet: false,
                cell: false,
                mergeBind: false,
              },
            });
            wx.showToast({
              title: "绑定成功",
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
    let { index, cabinetCode, cellShowSort, cellSort } = cellInfo;
    let params = {
      url: config.baseUrl + "/client/cell/openCell",
      method: "POST",
      data: {
        cabinetCode: cabinetCode,
        cellSort: cellSort,
        userCode: _this.data.userCode,
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
          cellShowSort: cellShowSort,
          index: index,
        };
        _this.handleFirstBind(cellInfo);
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
      time: 500,
      success: () => {
        let {
          cellShowSort,
          userCode,
          runningStatus,
          cabinetCode,
          cellSort,
          foodList,
          userName,
          phone
        } = e.currentTarget.dataset.item;
        let index = e.currentTarget.dataset.index;

        if (runningStatus == 0) {
          wx.showToast({
            title: "单元格故障",
            duration: 2000,
            icon: "none",
          });
        } else if (foodList.length > 0) {

          _this.setData({
            foodList: foodList,
            dialogTitle:
              _this.data.currentCabinetInfo.cabinetSort + " - " + cellShowSort,
            userInfo: {
              userName: userName,
              phone: phone
            },
            showOperationFlag: {
              cabinet: false,
              cell: true,
              mergeBind: false,
            },
            currentCellInfo: { index: index, ...e.currentTarget.dataset.item },
          });
        } else {
          let cellInfo = {
            cabinetCode,
            cellSort,
            cellShowSort,
            index,
          };
          _this.handleOpenBind(cellInfo);
        }
      },
    });
  },
  // 长按点击格子
  handleLongClickCell(e) {
    let {
      cellShowSort,
      runningStatus,
      cabinetCode,
      cellSort,
      foodList,
      userName,
      phone
    } = e.currentTarget.dataset.item;
    this.setData({
      foodList: foodList
    });
    let index = e.currentTarget.dataset.index;
    if (runningStatus == 0) {
      wx.showToast({
        title: "单元格故障",
        duration: 2000,
        icon: "none",
      });
    } else {
      this.setData({
        dialogTitle:
          this.data.currentCabinetInfo.cabinetSort + " - " + cellShowSort,
        userInfo: {
          userName: userName,
          phone: phone
        },
        showOperationFlag: {
          cabinet: false,
          cell: true,
          mergeBind: false,
        },
        currentCellInfo: { index: index, ...e.currentTarget.dataset.item },
      });
    }
  },
  clickOperation() {
    console.log('44', this.data.showOperationFlag)
    this.setData({
      showOperationFlag: {
        cabinet: false,
        cell: false,
        mergeBind: false,
      },
    });
  },
  clickOperationStop() { },
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
          url = "/client/cabinet/openCells";
          successMsg = "打开成功";
        } else if (type == "heatAll") {
          url = "/client/cabinet/heatCells";
          successMsg = "加热成功";
        } else if (type == "cancelHeatAll") {
          url = "/client/cabinet/cancelHeatCells";
          successMsg = "取消加热成功";
        } else if (type == "lightAll") {
          url = "/client/cabinet/lightCells";
          successMsg = "开启照明灯成功";
        } else if (type == "cancelLightAll") {
          url = "/client/cabinet/cancelLightCells";
          successMsg = "关闭照明灯成功";
        } else if (type == "disinfectAll") {
          url = "/client/cabinet/disinfectCells";
          successMsg = "开启消毒灯成功";
        } else if (type == "cancelDisinfectAll") {
          url = "/client/cabinet/cancelDisinfectCells";
          successMsg = "关闭消毒灯成功";
        } else if (type == "boxLightAll") {
          url = "/client/cabinet/boxLightCells";
          successMsg = "开启灯箱成功";
        } else if (type == "cancelBoxLightAll") {
          url = "/client/cabinet/cancelBoxLightCells";
          successMsg = "关闭灯箱成功";
        }
        let tmp_cabinetCode = _this.data.currentCabinetInfo.cabinetCode;
        let params = {
          url: config.baseUrl + url,
          method: "POST",
          data: {
            cabinetCode: tmp_cabinetCode,
            userCode: _this.data.userCode,
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
      url: config.baseUrl + "/client/cell/queryFoodList",
      method: "GET",
      data: {
        cabinetCode,
        cellSort,
        userCode: this.data.userCode,
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
          url = "/client/cell/openCell";
          successMsg = "打开成功";
        } else if (type == "heat") {
          url = "/client/cell/heatCell";
          successMsg = "加热成功";
        } else if (type == "cancelHeat") {
          url = "/client/cell/cancelHeatCell";
          successMsg = "取消加热成功";
        } else if (type == "light") {
          url = "/client/cell/lightCell";
          successMsg = "开启照明灯成功";
        } else if (type == "cancelLight") {
          url = "/client/cell/cancelLightCell";
          successMsg = "关闭照明灯成功";
        } else if (type == "disinfect") {
          url = "/client/cell/disinfectCell";
          successMsg = "开启消毒灯成功";
        } else if (type == "cancelDisinfect") {
          url = "/client/cell/cancelDisinfectCell";
          successMsg = "关闭消毒灯成功";
        } else if (type == "bind") {
          let cellInfo = {
            cabinetCode,
            cellSort,
            index,
          };
          _this.handleFirstBind(cellInfo);
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
            userCode: _this.data.userCode,
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

});
