const baseUrl = getApp().globalData.baseUrl

class base {
    a = {
            500: '网路故障',
            1001: "微信信息错误，请重新授权登录",
            1002: "微信信息CODE，请重新授权登录",
            1003: "微信用户信息获取失败",
            1004: "微信用户手机信息获取失败",
            1005: "微信登录失败",
            1006: "手机号已被拉黑",
            1007: "账号为空",
            1008: "密码为空",
            1009: "账号不存在",
            1010: "密码错误",
            1011: "手机号码为空",
            1012: "短信类型错误",
            1013: "短信发送过于频繁，请稍后重试",
            1014: "手机号码不存在",
            1015: "短信发送失败",
            1101: "分页查询，页数错误",
            1102: "分页查询，每页数量错误",
            1103: "网络请求错误",
            2001: "微信openid为空",
            2002: "手机号码为空",
            2003: "用户编号为空",
            2004: "用户不存在",
            2005: "当前用户不可用",
            2006: "组织编号为空",
            2007: "用户已绑定当前企业",
            2008: "企业不可用",
            2009: "企业设置错误",
            2010: "用户员工工号为空",
            2011: "用户姓名为空",
            2012: "用户姓名长度超出限制，限制10字符",
            2013: "用户绑定企业失败",
            2014: "用户存在于黑名单",
            2015: "获取用户信息失败",
            2016: "获取用户详情信息失败",
            2017: "用户非管理员，无权限切换",
            2018: "企业管理员身份切换失败",
            2019: "验证码为空",
            2020: "修改手机号码失败",
            2021: "手机验证码无效",
            2022: "用户信息不完整，手机号码缺失",
            2023: "收货地址编号为空",
            2024: "收货地址不可用",
            2025: "用户设置默认收货地址失败",
            2026: "用户已绑定企业，不可再次绑定",
            2027: "用户非游客用户",
            2028: "用户非管理员用户",
            2101: "企业不支持充值",
            2102: "充值金额错误",
            2103: "用户充值失败",
            3001: "组织编号为空",
            3002: "组织不存在",
            3003: "组织不可用",
            3004: "企业设置错误",
            3005: "配送地址编号为空",
            3006: "未获取到组织餐时设置",
            3007: "企业名称过短",
            3008: "企业名称过长",
            3009: "配送地址不可用",
            3010: "企业当前餐时不可点餐，请联系管理员",
            3011: "未获取到用户餐时设置",
            4019: "报餐餐品数量不可重复为0",
            4020: "报餐日期错误",
            4021: "当前时餐不可报餐",
            4022: "报餐数量错误",
            4023: "当前已有报餐，只允许修改",
            4024: "未查询到已有报餐记录",
            4025: "报餐数量与已有数量一致",
            4026: "报餐日期错误",
            4027: "报餐餐别错误",
            4028: "报餐失败",
            4029: "餐时不可点",
            4030: "订单付款价格错误",
            4031: "订单餐品不存在",
            4032: "订单餐品超出库存量",
            4033: "订单餐品超出限购",
            4034: "订单积分抵扣只允许是100的整数倍",
            4035: "订单积分抵扣金额高于所需支付金额",
            4036: "企业管理员不允许补餐",
            4037: "用户积分不足",
            4038: "用户余额不足",
            4039: "订单生成交易失败",
            4040: "订单生成失败",
            4041: "订单余额支付失败",
            4042: "订单编号为空",
            4043: "订单不存在",
            4044: "订单已确认，不可取消",
            4045: "订单取消失败",
            4046: "订单不允许支付",
            4047: "订单已支付，不可再次支付",
            4048: "订单不可取餐",
            4049: "订单取餐失败",
            4101: "订单评价内容为空",
            4102: "订单不属于该用户",
            4103: "订单不可评价",
            4104: "订单评价失败",
            5001: "就餐日期为空",
            5002: "餐时错误",
            5003: "餐品编号为空",
            6001: "文件错误",
            6002: "文件过大",
            6003: "文件上传失败",
            9001: "建议内容不可为空",
            9002: "建议内容长度过长",
            9003: "建议提交失败"
        }
        //hasToast表示sCallback回调函数中有没有wx.showToast
        //有的话，就在回调函数中执行wx.hideLoading,有的话hasToast=true
    request(params, sCallback, flag) {
            if (!flag) {
                wx.showLoading({
                    title: '正在加载'
                })
            }

            wx.request({
                url: baseUrl + params.url,
                data: params.data || {}, //这个是不是可以传null或者undefined？
                method: params.method || 'GET',
                header: {
                    'content-type': 'application/json'
                },
                success: result => {
                    let { data, code } = result.data
                        // 成功
                    if (code == 200) {
                        if (!flag) {
                            wx.hideLoading()
                        }


                        sCallback && sCallback(data);

                    } else {
                        if (!flag) {
                            wx.hideLoading()
                        }
                        if (code == 2004) {
                            //清除所有缓存，并跳到首页。
                            //清除所有缓存咋写的2019-05-19

                            wx.removeStorageSync('userCode')
                            wx.removeStorageSync('userInfo')
                            wx.reLaunch({
                                url: '/pages/home/home',
                            })
                        }
                        let content = this.a[code]
                        if (!content) {
                            content = '请求失败'
                        }

                        if (content.length > 6) {
                            wx.showModal({
                                title: '提示',
                                content: content,
                                success(res) {
                                    if (res.confirm) {
                                        console.log('用户点击确定')
                                    } else if (res.cancel) {
                                        console.log('用户点击取消')
                                    }
                                }
                            })
                        } else {
                            wx.showToast({
                                title: content,
                                image: '/images/msg/error.png',
                                duration: 2000
                            })
                        }
                    }

                },
                fail: error => {
                    console.log(error)
                    if (!flag) {
                        wx.hideLoading()
                    }
                }
            });
        }
        // 获取用户信息
    getUserInfo(sCallback, pullDown) {
        let { userInfo, time } = wx.getStorageSync('userInfo')
        let duration = undefined

        if (time) {
            // 如果上次获取时间超过30分钟，就再次拉取
            duration = ((new Date()).getTime() - (new Date(time)).getTime()) / 60000 > 30
        }


        if (!time || duration || pullDown) {
            let param = {
                url: '/user/getUserInfo?userCode=' + wx.getStorageSync('userCode')
            }

            this.request(param, data => {
                let userInfo = {}
                userInfo.userInfo = data
                userInfo.time = new Date()
                wx.setStorageSync('userInfo', userInfo)
                sCallback && sCallback(data);

            })
        } else {
            sCallback && sCallback(userInfo);
        }
    }

    requestWithCatch(params, cacheTime) {
        var that = this
        var url = params.url;
        if (!params.type) {
            params.type = 'get';
        }
        wx.request({
            url: url,
            data: params.data,
            method: params.type,
            header: {
                'content-type': 'application/json',
                'cache-control': 'max-age=300' //缓存五分钟
            },
            success: function(res) {
                if (res.data.code == 1001) {
                    //清除缓存，同时：
                    //销毁所有页面后跳转到首页，销毁页面是为了防止个人用户登录后再次换绑企业可以点击订单导航，而导航栏应该隐藏才对
                    wx.removeStorageSync('userInfo')
                    wx.reLaunch({
                        url: '/pages/home/home',
                    })
                }
                params.sCallback && params.sCallback(res.data);
            },
            fail: function(err) {
                //console.log(err)
                //that._processError(err);
            }
        });
    }
}
export {
    base
}