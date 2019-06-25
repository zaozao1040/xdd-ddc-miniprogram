const mtjwxsdk = require('./utils/mtj-wx-sdk.js');
App({
    globalData: {
           baseUrl: 'https://wx.api.91dcan.cn', //线上真实数据，发布使用！！！！！！！！！！
         //  baseUrl: 'http://192.168.0.100:9082', //志康
        // baseUrl: 'https://wx.api.uat.91dcan.cn', //测试库

        userInfo: null,
        selectedFoods: [],
        cacheMenuDataAll: [
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null],
            [null, null, null, null]
        ], //7行4列数组，用于存所有选中的数据---当前所有数据
        totalCount: 0,
        totalMoney: 0, //总价格
        realMoney: 0, //实际价格
        totalCount: 0
    },

    /**
     * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
     */
    onLaunch: function() {


        wx.loadFontFace({
            family: 'PingFang-SC-Medium',
            source: 'url("https://oss.91dcan.cn/miniprogram/fonts/PingFangMedium.ttf")',
            success: function() { console.log('load font success') }
        })
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()

            updateManager.onCheckForUpdate(function(res) {
                // 请求完新版本信息的回调
                console.log(res.hasUpdate)
            })

            updateManager.onUpdateReady(function() {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    success: function(res) {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate()
                        }
                    }
                })
            })
            updateManager.onUpdateFailed(function() {
                // 新的版本下载失败
                wx.showModal({
                    title: '更新提示',
                    content: '新版本下载失败',
                    showCancel: false
                })
            })
        }


    },

    /**
     * 当小程序启动，或从后台进入前台显示，会触发 onShow
     */
    onShow: function(options) {
        this.checkUpdate()
    },

    /**
     * 当小程序从前台进入后台，会触发 onHide
     */
    onHide: function() {

    },

    /**
     * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
     */
    onError: function(msg) {

    },
    /**
     * 强制更新
     */
    checkUpdate() {
        if (wx.canIUse('getUpdateManager')) {
            const updateManager = wx.getUpdateManager()
            updateManager.onCheckForUpdate(function(res) {
                // 请求完新版本信息的回调
                if (res.hasUpdate) {
                    updateManager.onUpdateReady(function() {
                        wx.showModal({
                            title: '更新提示',
                            content: '新版本已经准备好,点击确认重启应用',
                            showCancel: false,
                            success: function(res) {
                                if (res.confirm) {
                                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                    updateManager.applyUpdate()
                                }
                            }
                        })
                    })
                    updateManager.onUpdateFailed(function() {
                        // 新的版本下载失败
                        wx.showModal({
                            title: '已经有新版本了哟~',
                            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~',
                        })
                    })
                }
            })
        } else {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    },
})