function e(e, t, a) {
    return t in e ? Object.defineProperty(e, t, {
        value: a,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[t] = a, e;
}

var t, a = require("../../comm/script/helper"), o = require("../../component/loading/loading");

module.exports = (t = {
    ajax: function(e, t, r, i, n, s) {
        var c = this, u = getApp();
        u && u.globalData.currPage && !i && o.show.call(u.globalData.currPage);
        var l = JSON.stringify(u && u.globalData ? u.globalData.wxSysInfo : null), d = JSON.stringify(u && u.globalData && u.globalData.userInfo ? u.globalData.userInfo : wx.getStorageSync("getUserInfo"));
        a.extend(t, {
            deviceId: u && u.getOpenId() ? u.getOpenId() : a._getUUID(),
            isWechatApp: !0,
            wxSysInfo: l,
            wxUserInfo: d
        });
        var g = wx.getStorageSync("sessionInfo"), f = g ? JSON.parse(g).data : null;
        -1 != e.indexOf("home/initSession") && n && (f = null);
        var h = f && f.memcacheKey ? f.memcacheKey : null, p = h ? "memcacheKey=" + h : null, x = c.getCookieValues(), m = p || "";
        x && (m += (p && x ? "; " : "") + x);
        var j = (u ? u.globalData.mwosDomain : "") + e;
        wx.request({
            url: j,
            data: t,
            method: "POST",
            header: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                Cookie: m
            },
            success: function(e) {
                if (10005 == e.data.errorCode || 14005 == e.data.errorCode || 10001 == e.data.errorCode || 12003 == e.data.errorCode || 14004 == e.data.errorCode || 80098 == e.data.errorCode || 80099 == e.data.errorCode || 89999 == e.data.errorCode) {
                    var t = e.data.errorMsg;
                    return t ? t += " " : t = "", e.data.traceId && (t += e.data.traceId), wx.showToast({
                        title: t,
                        icon: "none",
                        duration: 3e3
                    }), getApp() && getApp().globalData.currPage && o.hide.call(getApp().globalData.currPage), 
                    void (getApp() && getApp().clearUserInfo(function() {
                        setTimeout(function() {
                            getApp().globalData.getMenuFail ? (wx.navigateTo({
                                url: "../store/store?storeCode=" + getApp().globalData.getMenuFail + "&isfromMenuH5url=" + !0
                            }), getApp().globalData.getMenuFail = !1) : a._backToHome();
                        }, 1e3);
                    }));
                }
                if (e.data.traceId) {
                    var i = e.data.errorMsg;
                    i ? i += " " : i = "", i += e.data.traceId, wx.showToast({
                        title: i,
                        icon: "none",
                        duration: 3e3
                    }), setTimeout(function() {
                        "function" == typeof r && r(e);
                    }, 3e3);
                } else "function" == typeof r && r(e);
            },
            fail: function(e) {
                getApp() && getApp().globalData.currPage && o.hide.call(getApp().globalData.currPage), 
                -1 != e.errMsg.indexOf("request:fail") && (e.errMsg = "网络异常 请重试" + e.errMsg.replace("request:fail", "")), 
                wx.showToast({
                    title: e.errMsg,
                    icon: "none",
                    duration: 2e3
                });
            },
            complete: function(e) {
                var t = e && e.header && e.header["Set-Cookie"] ? e.header["Set-Cookie"] : null;
                c.resetCookies(t), "function" == typeof s && s();
            }
        });
    },
    getCookieValues: function() {
        var e = getApp(), t = e && e.globalData && e.globalData.cookies ? e.globalData.cookies : null;
        if (!t) return null;
        var a = "";
        for (var o in t) {
            var r = t[o];
            if (r && !r.expired) {
                var i = r.name + "=" + r.value;
                a && (a += "; "), a += i;
            }
        }
        return a;
    },
    resetCookies: function(e) {
        function t(e) {
            return "expires" == (e = e.toLowerCase()) || "max-age" == e || "maxage" == e || "domain" == e || "path" == e || "secure" == e || "httponly" == e;
        }
        if (e) {
            var a = getApp();
            a.globalData.cookies || (a.globalData.cookies = {});
            for (var o = e.split(","), r = 0; r < o.length; r++) {
                var i = function(e) {
                    if (!e) return null;
                    for (var a = {}, o = e.split(";"), r = 0; r < o.length; r++) {
                        var i = o[r].trim();
                        if (i) {
                            var n = i.split("=");
                            if (n.length && !(n.length < 2)) {
                                var s = n[0].trim(), c = n[1].trim();
                                if (s) {
                                    a[s] = c, t(s) || (a.name = s, a.value = c);
                                    var u = s.toLowerCase();
                                    "max-age" != u && "maxage" != u || "0" != c && 0 != c || (a.expired = !0);
                                }
                            }
                        }
                    }
                    return a;
                }(o[r]);
                i && i.name && (a.globalData.cookies[i.name] = i.expired ? null : i);
            }
        }
    },
    initSession: function(e, t, a) {
        this.ajax(e + "home/initSession", {}, t, !1, a);
    },
    getUserInfo: function(e, t) {
        this.ajax("wechat/getUserInfo", e, t, !0);
    },
    getCities: function(e) {
        this.ajax("misc/cities", {}, e);
    },
    login: function(e, t) {
        this.ajax("login", e, t);
    },
    validStore: function(e, t) {
        this.ajax("misc/valid/validStore", e, t);
    },
    createOrder: function(e, t) {
        this.ajax("order/create", e, t);
    },
    getMenuByStore: function(e, t) {
        this.ajax("menu/getMenuByStore", e, t);
    },
    orderConfirm: function(e, t) {
        this.ajax("order/confirm", e, t);
    },
    usePromotion: function(e, t) {
        this.ajax("order/usePromotion", e, t);
    },
    registerNew: function(e, t) {
        this.ajax("registerNew", e, t);
    },
    sendVerificationCode: function(e, t) {
        this.ajax("per/sendVerificationCode", e, t);
    },
    kgoldIndex: function(e, t) {
        this.ajax("kgold/kgoldIndex", e, t);
    },
    queryKgoldAccountInfo: function(e, t) {
        this.ajax("kgold/kgoldAccountInfo", e, t);
    },
    gpscity: function(e, t) {
        this.ajax("misc/search/getCityByRgeoCode", e, t);
    },
    verifyCode: function(e, t) {
        this.ajax("per/verifyVerificationCode", e, t);
    },
    forgetPwd: function(e, t) {
        this.ajax("forgetPwd", e, t);
    },
    upgrademember: function(e, t) {
        this.ajax("upgradeMember", e, t);
    },
    queryPointAccTrans: function(e, t) {
        this.ajax("kgold/queryPointAccTrans", e, t);
    },
    orderlist: function(e, t, a) {
        this.ajax("order/orderlist", e, t, a);
    },
    orderdetail: function(e, t) {
        this.ajax("order/orderdetail", e, t);
    },
    sendImageVerificationCode: function(e, t) {
        this.ajax("sendImageVerificationCode", e, t);
    },
    closeOrder: function(e, t) {
        this.ajax("fiveThousand/closeOrder", e, t);
    },
    queryOrderNumber: function(e, t) {
        this.ajax("order/getOrderNumber", e, t);
    },
    searchAllStoresByCityCode: function(e, t) {
        this.ajax("misc/search/searchAllStoresByCityCode", e, t);
    },
    searchAllStoresByKeyWord: function(e, t) {
        this.ajax("misc/search/searchAllStoresByCityCodeAndKeyword", e, t);
    },
    addPhone: function(e, t) {
        this.ajax("cust/phone/add", e, t);
    },
    submit: function(e, t) {
        this.ajax("order/submit", e, t);
    },
    isSupport5000Store: function(e, t) {
        this.ajax("fiveThousand/isSupport5000Store", e, t);
    },
    delPhoneNum: function(e, t) {
        this.ajax("cust/phone/del", e, t);
    },
    wechatLogin: function(e, t) {
        this.ajax("wechat/login", e, t, !0);
    },
    getPaymentUrl: function(e, t, a) {
        this.ajax("payment/getPaymentUrl", e, t, null, null, a);
    },
    getCouponList: function(e, t) {
        this.ajax("coupon/getCoupon", e, t);
    },
    resetLimitTimes: function(e, t) {
        this.ajax("order/resetLimitTimes", e, t);
    },
    useCouponCode: function(e, t) {
        this.ajax("order/useCouponCode", e, t);
    }
}, e(t, "usePromotion", function(e, t) {
    this.ajax("order/usePromotion", e, t);
}), e(t, "checkPayStatus", function(e, t) {
    this.ajax("payment/checkPayStatus", e, t);
}), e(t, "autoLogin", function(e, t) {
    this.ajax("login", e, t);
}), e(t, "logout", function(e, t) {
    this.ajax("logout", e, t);
}), e(t, "initHome", function(e, t) {
    this.ajax("home/initHome", e, t);
}), e(t, "getMealDeal", function(e, t) {
    this.ajax("menu/getMealDeal", e, t);
}), e(t, "getUserCodeByPhone", function(e, t) {
    this.ajax("kgold/getUserCodeByPhone", e, t);
}), e(t, "setPassword", function(e, t) {
    this.ajax("kgold/setPassword", e, t);
}), e(t, "cancelOrder", function(e, t) {
    this.ajax("order/cancel", e, t);
}), e(t, "getStoreByStoreCode", function(e, t) {
    this.ajax("misc/search/store", e, t);
}), e(t, "storeAndOrder", function(e, t) {
    this.ajax("misc/storeAndOrder", e, t);
}), e(t, "getOrderListHistory", function(e, t) {
    this.ajax("order/orderhistory", e, t);
}), e(t, "queryStores", function(e, t) {
    this.ajax("customer/queryStores", e, t);
}), e(t, "addStore", function(e, t, a) {
    this.ajax("customer/addStore", e, t, a);
}), e(t, "delStore", function(e, t, a) {
    this.ajax("customer/delStore", e, t, a);
}), e(t, "submitZeroOrder", function(e, t, a) {
    this.ajax("order/submit", e, t, null, null, a);
}), e(t, "getAccountStatus", function(e, t) {
    this.ajax("payment/getAccountStatus", {}, e, t);
}), e(t, "queryAvailablePrime", function(e, t) {
    this.ajax("prime/queryAvailablePrime", {}, e, t);
}), e(t, "getPrimeDiscountPrice", function(e, t) {
    this.ajax("prime/getPrimeDiscountPrice", e, t, !0);
}), e(t, "gotoCapthca", function(e) {
    getApp().globalData.getGt = e.geetest.gt, getApp().globalData.getChallenge = e.geetest.challenge, 
    getApp().globalData.getSuccess = e.geetest.success;
    wx.createSelectorQuery().select("#phone").fields({
        properties: [ "value" ]
    }, function(e) {
        wx.navigateTo({
            url: "../captcha/captcha-slide",
            fail: function(e) {
                wx.hideLoading();
            }
        });
    }).exec();
}), t);