function t() {
    var t = getApp().globalData.trackingUrl;
    this.u = t || "https://dt.hwwt8.com/dcs04vrsi10000cl4vj1k4ehd_8m3w/dcs.gif?WT.branch=kfc_201705_xiaochengxu", 
    this.p = "", this.t = "", this.WT = {}, this.z = !0;
}

t.prototype.V = function() {
    var t = getApp(), e = t.globalData.mwosDomain, i = "", n = t.globalData.sysWidth, s = t.globalData.sysHeight, o = "";
    getCurrentPages().length - 1 >= 0 && (i = getCurrentPages()[getCurrentPages().length - 1].__route__), 
    getCurrentPages().length - 2 >= 0 && (o = getCurrentPages()[getCurrentPages().length - 2].__route__), 
    this.p += "&dcssip=" + e + "&dcsuri=" + i + "&WT.es=" + i, "" != o && "-" != o && (this.p += "&dcsref=" + o), 
    this.p += "&WT.sr=" + n + "x" + s;
}, t.prototype.M = function() {}, t.prototype.G = function() {
    for (var t = this.p + "&dcsdat=" + new Date().getTime() + this.t, e = {}, i = t.toLowerCase().split("&"), n = 0; n < i.length; n++) i[n].length > 0 && (e[i[n].split("=")[0]] = i[n].split("=")[1]);
    wx.request({
        url: this.u + t,
        method: "GET",
        header: {
            Cookie: this.cookie
        },
        success: function(t) {},
        fail: function(t) {},
        complete: function() {}
    });
}, t.prototype.S = function() {
    this.z && (this.z = !1, this.G());
}, t.prototype.dcsMultiTrack = function() {
    var t = arguments;
    if (t.length % 2 == 0) for (var e = 0; e < t.length; e += 2) this.t += "&" + t[e] + "=" + encodeURIComponent(t[e + 1]);
    this.G(), this.t = "";
}, Function.prototype.wtbind = function(t) {
    var e = this;
    return function() {
        return e.apply(t, arguments);
    };
}, t.prototype.F = function() {
    var t = "2", e = new Date(), i = new Date(e.getTime() + 31536e7), n = new Date(e.getTime());
    if (this.cookie = "", -1 != this.cookie.indexOf("WT_FPC=") && (this.p += "&WT.vt_f=3", 
    -1 != (t = this.cookie.substring(this.cookie.indexOf("WT_FPC=") + 10)).indexOf(";") && (t = t.substring(0, t.indexOf(";"))), 
    e.getTime() < new Date(parseInt(t.substring(t.indexOf(":lv=") + 4, t.indexOf(":ss=")))).getTime() + 18e5 ? n.setTime(new Date(parseInt(t.substring(t.indexOf(":ss=") + 4))).getTime()) : this.p += "&WT.entry=2", 
    t = t.substring(0, t.indexOf(":lv="))), t.length < 10) {
        this.p += "&WT.vt_f=1&WT.entry=1";
        for (var s = e.getTime().toString(), o = 2; o <= 32 - s.length; o++) t += Math.floor(16 * Math.random()).toString(16);
        t += s;
    }
    t = encodeURIComponent(t), this.p += "&WT.co_f=" + t, this.cookie = "WT_FPC=id=" + t + ":lv=" + e.getTime().toString() + ":ss=" + n.getTime().toString() + "; expires=" + i.toGMTString() + "; path=/; domain=.kfc.com.cn";
};

var e = new t();

try {
    e.V(), e.M(), e.F();
} catch (t) {}

e.S(), module.exports = {
    tag: e
};