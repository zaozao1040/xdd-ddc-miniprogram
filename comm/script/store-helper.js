Object.defineProperty(exports, "__esModule", {
    value: !0
});

var t = require("./date-format"), e = function(t) {
    try {
        return wx.getStorageSync(t);
    } catch (t) {}
}, n = function(t, e) {
    try {
        wx.setStorageSync(t, e);
    } catch (t) {}
}, r = function() {
    return new Promise(function(t, e) {
        wx.getClipboardData({
            success: function(e) {
                t(e.data);
            },
            fail: function(t) {
                e();
            }
        });
    });
}, a = function() {
    var t = getApp().globalData.mwosDomain, e = !1;
    return e = e || t.indexOf("devorder.kfc.com.cn") >= 0, e = e || t.indexOf("qaorder.kfc.com.cn") >= 0;
}, o = function(e, n) {
    if (!(e.length >= 13 && e.length <= 15)) {
        var r = "错误，test预约时间必须为yyyyMMdd-hhmm，长度为13 但输入的是" + e;
        return wx.showToast({
            title: r,
            icon: "none",
            duration: 3e3
        }), !1;
    }
    var a = !0, o = /^'?(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})'?$/, s = e.match(o);
    if (null == s) {
        a = !1;
        var i = "错误，test预约时间必须为yyyyMMdd-hhmm但输入的是" + e;
        return wx.showToast({
            title: i,
            icon: "none",
            duration: 3e3
        }), !1;
    }
    var u = parseInt(s[1]), c = parseInt(s[2]), f = parseInt(s[3]), h = parseInt(s[4]), d = parseInt(s[5]);
    c >= 1 && c <= 12 || (a = !1), f >= 1 && f <= 31 || (a = !1), h >= 0 && h <= 23 || (a = !1), 
    d >= 0 && d <= 59 || (a = !1);
    var l = new Date(u, c - 1, f, h, d);
    if (a = !(!a || l.getFullYear() !== u || l.getMonth() !== c - 1 || l.getDate() !== f), 
    !(a = !(!a || l.getHours() !== h || l.getMinutes() !== d))) {
        var g = "错误，test预约时间必须为yyyyMMdd-hhmm 但输入的是" + e;
        return wx.showToast({
            title: g,
            icon: "none",
            duration: 3e3
        }), !1;
    }
    return n.setFullYear(u, c - 1, f), n.setHours(h, d), getApp().globalData.sss = void 0, 
    wx.setClipboardData({
        data: "asss=" + e,
        success: function() {
            wx.hideToast();
        },
        fail: function(t) {
            console.log("剪贴板err:", t);
        },
        complete: function() {
            var e = t._dateFormater(n, "DateTime"), r = "正确，设置的test预约时间：" + e;
            wx.showToast({
                title: r,
                icon: "none",
                duration: 3e3
            }), console.log("正确，设置的test预约时间：", e, n, n.getTime());
        }
    }), !0;
};

exports.getObject = e, exports.saveOftenStoreInfo = function(t) {
    var r = e("OFTEN_STORE_INFO");
    r || (r = {});
    var a = r[t];
    a || (a = [], r[t] = a);
    var o = new Date().getTime();
    a.push(o), a.length >= 3 && a.splice(0, a.length - 2), n("OFTEN_STORE_INFO", r);
}, exports.judgeOftenStore = function(t) {
    var n = e("OFTEN_STORE_INFO");
    if (!n) return !1;
    var r = n[t];
    if (!r || r.length < 2) return !1;
    var a = new Date().getTime();
    return r.every(function(t, e) {
        return a - t <= 5184e6;
    });
}, exports.distanceBetweenPoints = function(t, e, n, r) {
    if (!(n && r && t && e)) return 0;
    var a = t * Math.PI / 180, o = n * Math.PI / 180, s = a - o, i = e * Math.PI / 180 - r * Math.PI / 180, u = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(s / 2), 2) + Math.cos(a) * Math.cos(o) * Math.pow(Math.sin(i / 2), 2)));
    return u *= 6378.137, u = Math.round(1e4 * u) / 10;
}, exports.sortOpenStore = function(t) {
    var e = [], n = [];
    return t.forEach(function(t) {
        t.isOpen ? e.push(t) : n.push(t);
    }), e.concat(n);
}, exports.setBookingTimeDay = function(t, e, n) {
    if (t && a()) {
        var s = void 0;
        if (e) s = String(e); else {
            var i = getApp().globalData.sss;
            if (!i) return void r().then(function(e) {
                return e && 0 === e.indexOf("sss=") ? (s = String(e.substr("sss=".length)), n(o(s, t))) : n(!0);
            }).catch(function(t) {
                return n(!0);
            });
            s = String(i);
        }
        return n(o(s, t));
    }
    return n(!0);
};