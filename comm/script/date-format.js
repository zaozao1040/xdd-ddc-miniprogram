module.exports = {
    _token: /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    _timezone: /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    _timezoneClip: /[^-+\dA-Z]/g,
    _pad: function(e, t) {
        for (e = String(e), t = t || 2; e.length < t; ) e = "0" + e;
        return e;
    },
    _i18n: {
        dayNames: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
        monthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
    },
    _masks: {
        default: "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "HH:MM",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "yyyy-mm-dd'T'HH:MM:ss.lo",
        chineseDate: "yyyy年mm月dd日",
        DateTime: "yyyy-mm-dd HH:MM",
        chineseDatetime: "yyyy年mm月dd日 HH点MM分",
        chineseshortDate: "HH点MM分",
        DateTimeYMD: "yyyy/mm/dd",
        pointYMD: "yyyy.mm.dd",
        chineseDatetime2: "yyyy年mm月dd日 HH:MM",
        chineseDate3: "yyyy年mm月dd号 ",
        chineseDate4: "yyyy年mm月dd日 HH时MM分ss秒",
        chineseDate5: "HH时MM分ss秒"
    },
    _dateFormater: function(e, t, y) {
        if (1 != arguments.length || "[object String]" != Object.prototype.toString.call(e) || /\d/.test(e) || (t = e, 
        e = void 0), e = e ? new Date(e) : new Date(), isNaN(e)) throw SyntaxError("invalid date");
        "UTC:" == (t = String(this._masks[t] || t || this._masks.default)).slice(0, 4) && (t = t.slice(4), 
        y = !0);
        var a = y ? "getUTC" : "get", i = e[a + "Date"](), m = e[a + "Day"](), d = e[a + "Month"](), s = e[a + "FullYear"](), n = e[a + "Hours"](), h = e[a + "Minutes"](), r = e[a + "Seconds"](), o = e[a + "Milliseconds"](), M = y ? 0 : e.getTimezoneOffset(), l = {
            d: i,
            dd: this._pad(i),
            ddd: this._i18n.dayNames[m],
            dddd: this._i18n.dayNames[m + 7],
            m: d + 1,
            mm: this._pad(d + 1),
            mmm: this._i18n.monthNames[d],
            mmmm: this._i18n.monthNames[d + 12],
            yy: String(s).slice(2),
            yyyy: s,
            h: n % 12 || 12,
            hh: this._pad(n % 12 || 12),
            H: n,
            HH: this._pad(n),
            M: h,
            MM: this._pad(h),
            s: r,
            ss: this._pad(r),
            l: this._pad(o, 3),
            L: this._pad(o > 99 ? Math.round(o / 10) : o),
            t: n < 12 ? "a" : "p",
            tt: n < 12 ? "am" : "pm",
            T: n < 12 ? "A" : "P",
            TT: n < 12 ? "AM" : "PM",
            Z: y ? "UTC" : (String(e).match(this._timezone) || [ "" ]).pop().replace(this._timezoneClip, ""),
            o: (M > 0 ? "-" : "+") + this._pad(100 * Math.floor(Math.abs(M) / 60) + Math.abs(M) % 60, 4),
            S: [ "th", "st", "nd", "rd" ][i % 10 > 3 ? 0 : (i % 100 - i % 10 != 10) * i % 10]
        };
        return t.replace(this._token, function(e) {
            return e in l ? l[e] : e.slice(1, e.length - 1);
        });
    }
};