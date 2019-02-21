
import { mine } from '../mine/mine-model.js'
let mineModel = new mine()
import { login } from './login-model.js'
let loginModel = new login()
import { organize } from '../mine/organize/organize-model.js'
let organizeModel = new organize()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    timer: null,
    canClick: true,
    //
    windowHeight: 0,
    loading: false,
    showAddressFlag: false,
    showGobackFlag: false,
    location: {},
    organizeList: [],
    organize: '',
    employeeNumber: '',//是否需要填写企业员工的工号  true需要 false不需要
    usernumber: '', //工号
    organizeCode: '',
    search: '',
    code: '',
    name: '',
    /*     target:'', */
    firstCode: true,
    waitTime: -1,
    action: "",
    userInfo: {},
    organizeListNoResult: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {
    if (this.data.timer) {
      clearTimeout(this.data.timer)
    }
  },
  initRegister: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          windowHeight: res.windowHeight
        })
      }
    })
    const query = wx.createSelectorQuery()
    query.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].top // #the-id节点的上边界坐标
      })
    })
  },
  showAddress: function () {
    let _this = this
    _this.setData({
      showAddressFlag: true
    })
    _this.initRegister()
    //请求经纬度信息，以便注册
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log('地理位置：', res)
        let param = {
          myLongitude: res.longitude,
          myLatitude: res.latitude
        }
        wx.showLoading({
          title: '企业列表加载中'
        })
        //请求企业列表
        loginModel.getOrganizeListByLocation(param, (res) => {
          console.log('收到请求(企业列表):', res)
          wx.hideLoading()
          if (res.code === 0) {
            _this.setData({
              organizeList: res.data,
              showGobackFlag: true
            })
          }
        })
      }
    })
  },
  changeShowAddressFlag: function () {
    this.setData({
      showAddressFlag: !this.data.showAddressFlag
    });
  },
  selectOrganize: function (e) {
    this.setData({
      organize: e.currentTarget.dataset.organizename,
      employeeNumber: e.currentTarget.dataset.employeenumber
    });
    this.data.organizeCode = e.currentTarget.dataset.organizecode
    this.changeShowAddressFlag()
  },
  nameInput: function (e) {
    this.setData({
      name: e.detail.value
    });
  },
  usernumberInput: function (e) {
    this.setData({
      usernumber: e.detail.value
    });
  },
  organizeInput: function (e) {
    this.setData({
      organize: e.detail.value
    });
  },
  searchInput: function (e) {
    let _this = this
    _this.setData({
      search: e.detail.value
    });
    let param = {
      organizeName: e.detail.value
    }
    wx.showLoading({
      title: '加载中',
    })
    //请求企业列表
    loginModel.getOrganizeListByLocation(param, (res) => {
      console.log('收到请求(企业列表):', res)
      wx.hideLoading()
      if (res.code === 0) {
        _this.setData({
          organizeList: res.data
        })
        if (res.data.length == 0) {
          _this.setData({
            organizeListNoResult: true //查到企业列表无结果，则相应视图
          })
        } else {
          _this.setData({
            organizeListNoResult: false
          })
        }
      }
    })
  },

  /* 绑定企业 */
  bindOrganize: function () { //点击注册，先获取个人信息，这个是微信小程序的坑，只能通过这个button来实现
    let _this = this
    if (_this.data.name == '') {
      wx.showToast({
        title: "请输入姓名",
        image: '../../images/msg/error.png',
        duration: 2000
      })
    } else if (_this.data.organize == '') {
      wx.showToast({
        title: "请选择企业",
        image: '../../images/msg/error.png',
        duration: 2000
      })
    } else if (_this.data.employeeNumber == true && _this.data.usernumber == '') {
      wx.showToast({
        title: "请输入工号",
        image: '../../images/msg/error.png',
        duration: 2000
      })
    } else {
      let param = {
        userCode: wx.getStorageSync('userInfo').userCode,
        userName: _this.data.name,
        organizeCode: _this.data.organizeCode,
        userOrganizeCode: _this.data.usernumber //工号
      }
      _this.setData({ //【防止狂点1】
        loading: true
      })
      wx.showLoading({ //【防止狂点2】
        title: '加载中',
        mask: true
      })
      organizeModel.bindOrganize(param, (res) => {
        console.log('收到请求(绑定组织):', res)
        if (res.code === 0) {
          let tmp_userInfo = wx.getStorageSync('userInfo')
          tmp_userInfo.organizeCode = _this.data.organizeCode
          tmp_userInfo.organizeName = _this.data.organize
          tmp_userInfo.name = _this.data.name
          wx.setStorageSync('userInfo', tmp_userInfo)
          if (_this.data.timer) {
            clearTimeout(_this.data.timer)
          }
          _this.data.timer = setTimeout(function () {
            wx.login({
              success: function (res) {
                if (res.code) {
                  let param = {
                    code: res.code, //微信code
                    userCode: wx.getStorageSync('userInfo').userCode
                  }
                  mineModel.getMineData(param, (res) => {
                    if (res.code == 0) {
                      wx.setStorageSync('userInfo', res.data) //刷新用户信息--这一步是必须的
                      _this.setData({
                        userInfo: res.data
                      })
                      wx.reLaunch({  //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
                        url: '/pages/home/home',
                      })
                      wx.hideLoading()
                      wx.showToast({
                        title: '登录成功',
                        image: '../../images/msg/success.png',
                        duration: 2000
                      })
                    }
                  })
                }
              }
            })
          }, 2000)
        } else {
          wx.showToast({
            title: res.msg,
            icon: 'none',
            duration: 2000
          })
          _this.setData({
            loading: false
          })
        }
      })
    }
  },


})