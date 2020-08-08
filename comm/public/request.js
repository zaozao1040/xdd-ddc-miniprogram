const baseUrl = getApp().globalData.baseUrl

class base {
    a = {
        500: '网路故障',
        1001: "微信信息错误，请重新授权登录",
        1002: "微信信息错误，请重新授权登录",
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
        2001: "未获取到微信信息，请退出后重试",
        2002: "手机号码为空",
        2003: "未查询到用户信息，请退出后重试",
        2004: "未查询到用户信息，请退出后重试",
        2005: "当前用户不可用，请联系客服",
        2006: "未查询到相关企业，请联系客服",
        2007: "用户已绑定当前企业，不可重复绑定",
        2008: "企业当前不可用，请联系客服",
        2009: "企业当前不可用，请联系客服",
        2010: "员工工号为空",
        2011: "姓名为空",
        2012: "姓名长度超出限制，限制10字符",
        2013: "绑定企业失败",
        2014: "当前用户不可用，请联系客服",
        2015: "未查询到用户信息，请退出后重试",
        2016: "查询用户信息失败，请退出后重试",
        2017: "用户非管理员，无权限切换",
        2018: "企业管理员身份切换失败",
        2019: "验证码为空",
        2020: "修改手机号码失败",
        2021: "手机验证码无效",
        2022: "用户信息不完整，请联系客服",
        2023: "收货地址不存在",
        2024: "收货地址不可用",
        2025: "设置默认收货地址失败",
        2026: "已绑定企业，不可再次绑定",
        2027: "非游客用户",
        2028: "非管理员用户",
        2101: "企业不支持充值",
        2102: "充值金额错误",
        2103: "充值失败",
        2201: "兑换积分只能为100的整数",
        2202: "用户积分不足",
        2203: "用户兑换积分已达一周兑换上限",
        2204: "用户兑换积分失败",
        3001: "未查询到相关企业，请联系客服",
        3002: "未查询到相关企业，请联系客服",
        3003: "企业当前不可用，请联系客服",
        3004: "企业当前不可用，请联系客服",
        3005: "配送地址不存在",
        3006: "企业未开通该餐别",
        3007: "企业名称过短",
        3008: "企业名称过长",
        3009: "配送地址不可用",
        3010: "企业当前餐别不可点餐",
        3011: "用户餐别设置错误，请联系客服",
        3012: "当前用户未选择标签",
        4019: "报餐餐品数量不可为0，请重新输入",
        4020: "报餐日期错误",
        4021: "当前餐别不可报餐",
        4022: "报餐数量错误，请重新输入",
        4023: "当前已有报餐，只允许修改",
        4024: "未查询到已有报餐记录",
        4025: "报餐数量与已有数量一致",
        4026: "报餐日期错误",
        4027: "报餐餐别错误",
        4028: "报餐失败",
        4029: "当前餐别不可点餐，请联系客服",
        4030: "订单付款价格错误",
        4031: "订单餐品不存在",
        4032: "订单餐品超出库存量",
        4033: "订单餐品超出限购",
        4034: "订单积分抵扣只允许是100的整数倍",
        4035: "订单积分抵扣金额高于所需支付金额",
        4036: "企业管理员不允许补餐",
        4037: "用户积分不足",
        4038: "钱包余额不足",
        4039: "订单交易失败，请查询确认后重新下单",
        4040: "下单失败，请查询确认后重新下单",
        4041: "钱包支付失败，请重新支付",
        4042: "订单不存在",
        4043: "订单不存在",
        4044: "订单已确认，不可取消",
        4045: "订单取消失败",
        4046: "订单不允许支付",
        4047: "订单已支付，不可再次支付",
        4048: "订单不可取餐",
        4049: "订单取餐失败，请重试",
        4050: "订单餐品数量错误",
        4052: "订单已取消",
        4053: "下单失败，请返回点餐页重新结算",
        4054: "下单失败，请返回点餐页重新结算",
        4055: "请勿重复下单",
        4056: "下单失败，当前用户信息错误，请退出后重试",
        4057: "下单失败，当前用户与下单用户不一致，请退出后重试",
        4058: '备注错误',
        4059: '您当前无权限以企业管理员身份下单',
        4060: "您当前无权限以企业管理员报餐",
        4061: "订单金额小于最小下单金额",
        4062: "您还未使用完餐标额度，请继续点餐",
        4063: "订单返还餐标额度失败",
        4064: "订单取消失败，企业钱包无法扣减返还金额",
        4101: "订单评价内容为空",
        4102: "您无法查看该订单",
        4103: "订单不可评价",
        4104: "订单评价失败，请重试",
        5001: "未获取到您的用餐日期，请重试",
        5002: "当前餐别不可点餐，请确认您已绑定企业或联系客服",
        5003: "餐品不存在，请您刷新菜单重试",
        6001: "文件错误，请重新上传",
        6002: "文件过大，请压缩后上传",
        6003: "文件上传失败，请重试",
        7001: "当前用户不可进行服务评价",
        7002: "当前用户非管理员状态，不可进行服务评价",
        7003: "当前用户已超出评价次数限制（5次）",
        7004: "当前当天未用餐，不可评价服务",
        7005: "服务标签未选择，请选择",
        7006: "服务评价失败，请重试",
        9001: "建议内容不可为空",
        9002: "建议内容长度过长",
        9003: "建议提交失败，请重试"
    }
    //hasToast表示sCallback回调函数中有没有wx.showToast
    //有的话，就在回调函数中执行wx.hideLoading,有的话hasToast=true
    request(params, sCallback, flag, eCallback) {
        if (!flag) {
            wx.showLoading({
                title: '正在加载'
            })
        }

        wx.request({
            //timeout: 5000,//超时时间
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
                            showCancel: false,
                        })
                    } else {
                        wx.showToast({
                            title: content,
                            image: '/images/msg/error.png',
                            duration: 2000
                        })
                    }
                    //失败的回调
                    eCallback && eCallback();
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
        console.log('e')
        let { userInfo, time } = wx.getStorageSync('userInfo')
        let duration = undefined

        if (time) {
            // 如果上次获取时间超过30分钟，就再次拉取
            duration = ((new Date()).getTime() - (new Date(time)).getTime()) / 60000 > 30
        }

        this.getUserCode(() => {
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
                }, true)


            } else {
                sCallback && sCallback(userInfo);
            }
        })
    }
    //在每个onShow里写就可以了
    getUserCode(sCallback) {
        //只要这个userCode为空，就跳转到首页 
        let userCode = wx.getStorageSync('userCode')
        if (!userCode) {
            wx.switchTab({
                url: '/pages/home/home',
            })
        } else {
            sCallback && sCallback(userCode)
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
            success: function (res) {
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
            fail: function (err) { }
        });
    }
}
export {
    base
}