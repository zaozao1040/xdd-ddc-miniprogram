
import { request } from "../../comm_plus/public/request.js";
import { base } from '../../comm/public/request'
import config from "../../comm_plus/config/config.js";
import jiuaiDebounce from "../../comm_plus/jiuai-debounce/jiuai-debounce.js";
let requestModel = new base()
Page({
    data: {
      userCode: '',
      organizeName: '',
      userName: '',


      userInfo: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      let tmp_userInfo = wx.getStorageSync("userInfo").userInfo;

      if (tmp_userInfo) {
        this.setData(
          {
            userInfo: tmp_userInfo,
          }
        );
      }
    },


    /* 页面隐藏后回收定时器指针 */
    onHide: function () { },


    userNameInput: function (e) {
        this.setData({
            userName: e.detail.value
        });
    },
    organizeNameInput: function (e) {
      this.setData({
        organizeName: e.detail.value
      });
    },
    tryBind(){
      let _this = this;
      jiuaiDebounce.canDoFunction({
        type: "jieliu",
        immediate: true,
        key: "key_tryBind",
        time: 1000,
        success: () => {
         _this.doTryBind()
        },
      });
    },
    doTryBind() {
      let _this = this;
      if (!_this.data.userName) {
        wx.showToast({
          title: "请输入姓名",
          image: '/images/msg/error.png',
          duration: 2000
        })
      } else if (!_this.data.organizeName) {
        wx.showToast({
          title: "请输入企业",
          image: '/images/msg/error.png',
          duration: 2000
        })
      }else{
        let param = {
          url: config.baseUrlPlus + "/user/bindTryOrganize",
          method: "post",
          data: {
            userCode: _this.data.userInfo.userCode,
            organizeName: _this.data.organizeName,
            userName: _this.data.userName,
          },
        };
        request(param, (resData) => {
          
          if (resData.data.code === 200) {
            wx.showToast({
              title: "提交成功",
              duration: 1000,
            });
            wx.reLaunch({
              url: "/pages/home/home",
            });

          } else {
            wx.showToast({
              title: resData.data.msg,
              image: "/images/msg/error.png",
              duration: 2000,
            });
          }
        });        
      }

    },
    /* button的绑定企业 */
    changeOrganize: function () {
        let _this = this
        if (!_this.data.userName) {
            wx.showToast({
                title: "请输入姓名",
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else if (!_this.data.organize || !_this.data.organizeCode) {
            wx.showToast({
                title: "请选择企业",
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else if (_this.data.employeeNumber == true && !_this.data.usernumber) {
            wx.showToast({
                title: "请输入工号",
                image: '/images/msg/error.png',
                duration: 2000
            })
        } else {
            let param = {
                userCode: _this.data.userCode,
                userName: _this.data.userName,
                organizeCode: _this.data.organizeCode,
                userOrganizeCode: _this.data.employeeNumber ? _this.data.usernumber : null
            }
            let params = {
                data: param,
                url: '/user/bindOrganize',
                method: 'post'
            }

            requestModel.request(params, () => {

                requestModel.getUserInfo((userInfo) => {

                    if (_this.data.userType == 'ADMIN') {
                        _this.setData({
                            bindAlready: true, //已经绑定
                            bindUncheck: false, //审核未通过
                            canBinding: false, //可绑定
                            bindChecking: false //审核中
                        })
                    } else {
                        _this.setData({
                            bindAlready: false, //已经绑定
                            bindUncheck: false, //审核未通过
                            canBinding: false, //可绑定
                            bindChecking: true //审核中
                        })
                        wx.reLaunch({ url: '/pages/home/home' })
                    }
                    _this.setData({
                        organizeName: userInfo.organizeName
                    })
                }, true)


            })

        }
    },

    goback() {
        wx.switchTab({
            url: '/pages/mine/mine',
        })
    }
})