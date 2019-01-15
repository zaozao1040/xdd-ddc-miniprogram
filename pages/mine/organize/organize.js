var t = require("../../../comm/script/helper")
import { register } from '../../register/register-model.js'
import { organize } from './organize-model.js'
let registerModel = new register()
let organizeModel = new organize()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollTop: 0,
    buttonTop: 0,
    loading: false,
    location: {},
    organizeList:[],
    organize: '',
    employeeNumber:'',//是否需要填写企业员工的工号  true需要 false不需要
    usernumber:'', //工号
    organizeCode: '',
    search: '',
    organizeListNoResult: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initAddress()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    //请求经纬度信息，以便注册
    wx.getLocation({
      type: 'gcj02', 
      success: function(res){
        console.log('地理位置：',res)
        let param = {
          userCode: wx.getStorageSync('userInfo').userCode, 
          myLongitude: res.longitude, 
          myLatitude: res.latitude
        }
        wx.showLoading({ 
          title: '企业列表加载中'
        })
        //请求企业列表
        registerModel.getOrganizeListByLocation(param,(res)=>{
          console.log('收到请求(企业列表):',res)
          wx.hideLoading() 
          if(res.code === 0){
            _this.setData({
              organizeList: res.data
            })                       
          }
        }) 
      }
    })
  },
  initAddress: function(){
    let _this = this;
    const query = wx.createSelectorQuery()
    query.select('.c_scrollPosition_forCalculate').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function (res) {
      _this.setData({
        scrollTop: res[0].top // #the-id节点的上边界坐标
      })
    })
    const query_1 = wx.createSelectorQuery()
    query_1.select('.c_buttonPosition_forCalculate').boundingClientRect()
    query_1.selectViewport().scrollOffset()
    query_1.exec(function (res) {
      _this.setData({
        buttonTop: res[0].top // #the-id节点的上边界坐标
      })
    })
  },
  selectOrganize:function(e){
    this.setData({
      organize: e.currentTarget.dataset.organizename,
      employeeNumber: e.currentTarget.dataset.employeenumber
    });
    this.data.organizeCode = e.currentTarget.dataset.organizecode
    console.log(this.data.employeeNumber)
  },
  usernumberInput: function(e) {
    this.setData({
      usernumber: e.detail.value
    });
  },
  organizeInput: function(e) {
    this.setData({
      organize: e.detail.value
    });
  },
  searchInput: function(e) {
    let _this = this
    _this.setData({
      search: e.detail.value
    });
    let param = {
      userCode: wx.getStorageSync('userInfo').userCode, 
      organizeName: e.detail.value
    }
    wx.showLoading({ 
      title: '加载中',
    })
    //请求企业列表
    registerModel.getOrganizeListByLocation(param,(res)=>{
      console.log('收到请求(企业列表):',res)
      wx.hideLoading() 
      if(res.code === 0){
        _this.setData({
          organizeList: res.data
        })   
        if(res.data.length==0){
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
  /* button的绑定企业 */
  changeOrganize:function(){
    let _this = this
    if(_this.data.organize==''){
      wx.showToast({
        title: "请从下拉列表选择企业",
        icon: "none",
        duration: 2000
      })
    }else if(_this.data.employeeNumber==true&&_this.data.usernumber==''){
      wx.showToast({
        title: "请输入工号",
        icon: "none",
        duration: 2000
      })
    }else{
      let param = {
        userCode: wx.getStorageSync('userInfo').userCode, 
        organizeCode: this.data.organizeCode,
        userOrganizeCode: _this.data.usernumber //工号
      }
      _this.setData({ //【防止狂点1】
        loading: true
      })
      wx.showLoading({ //【防止狂点2】
        title: '加载中',
        mask: true
      })
      organizeModel.changeOrganize(param,(res)=>{
        console.log('收到请求(更换组织):',res)
        if(res.code === 0){
          let tmp_userInfo = wx.getStorageSync('userInfo')
          tmp_userInfo.organizeCode = _this.data.organizeCode
          tmp_userInfo.organizeName = _this.data.organize
          wx.setStorageSync('userInfo', tmp_userInfo)
          setTimeout(function(){
            wx.reLaunch({  //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
              url: '/pages/home/home',
            })
            wx.hideLoading() 
            wx.showToast({
              title: '企业更换成功',
              icon: 'success',
              duration: 2000
            })
          },2000) 
        }else{
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