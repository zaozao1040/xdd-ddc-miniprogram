var t = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t) {
    return typeof t;
} : function(t) {
    return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t;
};

!function() {
    function e(e) {
        return null == e ? e + "" : "object" === (void 0 === e ? "undefined" : t(e)) || "function" == typeof e ? u[l.call(e)] || "object" : void 0 === e ? "undefined" : t(e);
    }
    function n(t) {
        return "function" === e(t);
    }
    function r(t) {
        var n = !!t && "length" in t && t.length, r = e(t);
        return "function" !== r && ("array" === r || 0 === n || "number" == typeof n && n > 0 && n - 1 in t);
    }
    function o(t) {
        var e, n;
        return !(!t || "[object Object]" !== l.call(t)) && (!(e = c(t)) || "function" == typeof (n = f.call(e, "constructor") && e.constructor) && s.call(n) === d);
    }
    function i(t, e) {
        var n, o = 0;
        if (r(t)) for (n = t.length; o < n && !1 !== e.call(t[o], o, t[o]); o++) ; else for (o in t) if (!1 === e.call(t[o], o, t[o])) break;
        return t;
    }
    function a() {
        var e, r, i, c, u, l, f = arguments[0] || {}, s = 1, d = arguments.length, y = !1;
        for ("boolean" == typeof f && (y = f, f = arguments[s] || {}, s++), "object" === (void 0 === f ? "undefined" : t(f)) || n(f) || (f = {}), 
        s === d && (f = this, s--); s < d; s++) if (null != (e = arguments[s])) for (r in e) i = f[r], 
        f !== (c = e[r]) && (y && c && (o(c) || (u = Array.isArray(c))) ? (u ? (u = !1, 
        l = i && Array.isArray(i) ? i : []) : l = i && o(i) ? i : {}, f[r] = a(y, l, c)) : void 0 !== c && (f[r] = c));
        return f;
    }
    var c = Object.getPrototypeOf, u = {}, l = u.toString, f = u.hasOwnProperty, s = f.toString, d = s.call(Object);
    i("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "), function(t, e) {
        u["[object " + e + "]"] = e.toLowerCase();
    });
    var y = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    module.exports = {
        _CHARS: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(""),
        _cellphonePatten: /^1[0-9]{10}$/,
        _namePatten: /^[0-9a-zA-Z]{1,24}|[\u4E00-\u9FA5]{1,12}$/,
        _passwordPatten: /^[\da-zA-Z]{6,16}$/i,
        _codePatten: /^[a-zA-Z0-9]{6,10}$/i,
        _reDescText: /^[\x21-\x7e\u4E00-\u9FA5\s，。！？、；：‘’“”（）《》【】]+$/,
        _trimD: function(t) {
            return t.replace(/(^D(B|N)?)|^P|^N|(BBN)/g, "").trim();
        },
        _trimD2: function(t) {
            return t.replace(/(^D(B|N)?)|^P|^N/, "").trim();
        },
        _trimBBN: function(t) {
            return t.replace(/(BBN)/g, "").trim();
        },
        _getUUID: function(t, e) {
            var n = wx.getStorageSync("deviceId");
            if (!n) {
                var r, o = this._CHARS, i = [];
                if (e = e || o.length, t) for (r = 0; r < t; r++) i[r] = o[0 | Math.random() * e]; else {
                    var a;
                    for (i[8] = i[13] = i[18] = i[23] = "-", i[14] = "4", r = 0; r < 36; r++) i[r] || (a = 0 | 16 * Math.random(), 
                    i[r] = o[19 == r ? 3 & a | 8 : a]);
                }
                n = i.join("");
            }
            return wx.setStorageSync("deviceId", n), n;
        },
        _valid: function(t, e) {
            return "string" == typeof t && (t = reg[t] || new RegExp(t)), !(!t || "function" != typeof t.test) && t.test(e);
        },
        _validCellPhone: function(t) {
            return this._valid(this._cellphonePatten, t);
        },
        _validName: function(t) {
            return this._valid(this._namePatten, t);
        },
        _validPassword: function(t) {
            return this._valid(this._passwordPatten, t);
        },
        _validCode: function(t) {
            return this._valid(this._codePatten, t);
        },
        _backToHome: function() {
            getApp().globalData.backHomeFlag = !0, wx.reLaunch({
                url: "../home/home"
            });
        },
        _formateThousandth: function(t) {
            return t.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, "$&,");
        },
        _checkStrLength: function(t) {
            for (var e = 0, n = 0; n < t.length; n++) {
                var r = t.charCodeAt(n);
                r >= 1 && r <= 126 || 65376 <= r && r <= 65439 ? e++ : e += 2;
            }
            return e;
        },
        _validDescText: function(t) {
            return this._valid(this._reDescText, t);
        },
        _hasSpecialChar: function(t) {
            for (var e = new Array("|", "%", "<", ">", "+", "script", "src", "select", "update", "delete", "insert"), n = t.substring(0).toLowerCase(), r = 0; r < e.length; r++) if (n.indexOf(e[r]) >= 0) return e[r];
            return !1;
        },
        _clearLocalInfo: function(t) {
            for (var e = 0; e < t.length; e++) wx.removeStorageSync(t[e]);
        },
        _updateMemKey: function(t) {
            var e = wx.getStorageSync("sessionInfo");
            if (e && t) {
                var n = JSON.parse(e);
                n && (n.data.memcacheKey = t), wx.setStorageSync("sessionInfo", JSON.stringify(n));
            }
        },
        noop: function() {},
        error: function(t) {
            throw new Error(t);
        },
        parseJSON: function() {
            return JSON.parse.apply(this, arguments);
        },
        trim: function(t) {
            return null == t || void 0 == t ? "" : (t + "").replace(y, "");
        },
        typeOf: e,
        isFunction: n,
        isNumeric: function(t) {
            var n = e(t);
            return ("number" === n || "string" === n) && !isNaN(t - parseFloat(t));
        },
        isArrayLike: r,
        isPlainObject: o,
        each: i,
        extend: a,
        union: function() {
            var e, r, i, a, c, u, l = arguments[0] || {}, f = 1, s = arguments.length, d = !1;
            for ("boolean" == typeof l && (d = l, l = arguments[f] || {}, f++), "object" === (void 0 === l ? "undefined" : t(l)) || n(l) || (l = {}), 
            f === s && (l = this, f--); f < s; f++) if (null !== (e = arguments[f])) for (r in e) i = l[r], 
            l !== (a = e[r]) && (d && a && (o(a) || (c = Array.isArray(a))) ? (c ? (c = !1, 
            u = i && Array.isArray(i) ? i : []) : u = i && o(i) ? i : {}, l[r] = $.extend(d, u, a)) : void 0 === a || null === a || void 0 !== i && null !== i || (l[r] = a));
            return l;
        }
    };
}();