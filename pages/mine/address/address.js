
import { address } from './address-model.js'
let addressModel = new address()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer: null,
    frontPageFlag: null, //代表前一个页面的标志
    scrollTop: 0,
    buttonTop: 0,
    loading: false,
    location: {},
    addressList: [],
    addressDes: '',
    organizeCode: '',
    search: '',
    addressListNoResult: false,
    showRoomNumberFlag: false,
    roomNumber: '', //银利体育 宿舍号
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let tmp_frontPageFlag = options.frontPageFlag
    if (tmp_frontPageFlag) {
      this.setData({
        frontPageFlag: tmp_frontPageFlag
      })
      console.log('oload......', options)
    }

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    //请求地址列表，以便选择后提交
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode,
    }
    wx.showLoading({
      title: '地址列表加载中'
    })
    //请求企业地址列表
    addressModel.getaddressList(param, (res) => {
      console.log('收到请求(地址列表):', res)
      wx.hideLoading()
      if (res.code === 0) {
        _this.setData({
          addressList: res.data
        })
        if (res.data.length == 0) {
          _this.setData({
            addressListNoResult: true //查到企业列表无结果，则相应视图
          })
        } else {
          _this.setData({
            addressListNoResult: false
          })
        }
      }
    })
  },
  /* 页面隐藏后回收定时器指针 */
  onHide: function () {
    if (this.data.timer) {
      clearTimeout(this.data.timer)
    }
  },
  roomNumberInput: function (e) {
    this.setData({
      roomNumber: e.detail.value
    })
  },
  selectDefaultAddress: function (e) {
    this.setData({
      addressDes: e.currentTarget.dataset.addressdes,
      showRoomNumberFlag: e.currentTarget.dataset.useraddaddress,
      roomNumber: e.currentTarget.dataset.adorm
    })
    this.data.addressCode = e.currentTarget.dataset.addresscode
  },
  changeDefaultAddress: function () {
    let _this = this
    if (!_this.data.addressCode) {
      wx.showToast({
        title: "请先选择一个地址",
        image: '../../../images/msg/error.png',
        duration: 2000
      })
    } else {
      if (_this.data.showRoomNumberFlag && !_this.data.roomNumber) {
        wx.showToast({
          title: "请填写宿舍号",
          image: '../../../images/msg/error.png',
          duration: 2000
        })
      } else {
        let param = {
          userCode: wx.getStorageSync('userInfo').userCode,
          addressCode: _this.data.addressCode,
          adorm: _this.data.roomNumber
        }
        _this.setData({ //【防止狂点1】
          loading: true
        })
        wx.showLoading({ //【防止狂点2】
          title: '加载中',
          mask: true
        })
        addressModel.commitDefaultAddress(param, (res) => {
          console.log('收到请求(提交默认地址):', res)
          if (res.code === 0) {
            if (_this.data.frontPageFlag == 'confirm' && _this.data.showRoomNumberFlag) {  //这里要区分上一个页面来源，然后设置缓存
              let tmp_userInfo = wx.getStorageSync('userInfo')
              tmp_userInfo.addressCode = _this.data.addressCode
              tmp_userInfo.address = _this.data.addressDes + _this.data.roomNumber
              wx.setStorageSync('userInfo', tmp_userInfo)
            } else {
              let tmp_userInfo = wx.getStorageSync('userInfo')
              tmp_userInfo.addressCode = _this.data.addressCode
              tmp_userInfo.address = _this.data.addressDes
              wx.setStorageSync('userInfo', tmp_userInfo)
            }
            if (_this.data.timer) {
              clearTimeout(_this.data.timer)
            }
            _this.data.timer = setTimeout(function () {
              if (_this.data.frontPageFlag == 'confirm') {
                wx.navigateBack({
                  delta: 1, // 回退前 delta(默认为1) 页面
                })
              } else {
                wx.switchTab({
                  url: '/pages/mine/mine',
                })
              }
              wx.hideLoading()
              wx.showToast({
                title: '地址选择成功',
                image: '../../../images/msg/success.png',
                duration: 2000
              })
            }, 2000)
          } else {
            wx.showToast({
              title: res.msg,
              image: '../../../images/msg/error.png',
              duration: 2000
            })
            _this.setData({
              loading: false
            })
          }
        })
      }
    }
  },
})