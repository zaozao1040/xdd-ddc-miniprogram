module.exports = {
    MD5: function(r) {
        function n(r, n) {
            return r << n | r >>> 32 - n;
        }
        function t(r, n) {
            var t, o, e, u, f;
            return e = 2147483648 & r, u = 2147483648 & n, t = 1073741824 & r, o = 1073741824 & n, 
            f = (1073741823 & r) + (1073741823 & n), t & o ? 2147483648 ^ f ^ e ^ u : t | o ? 1073741824 & f ? 3221225472 ^ f ^ e ^ u : 1073741824 ^ f ^ e ^ u : f ^ e ^ u;
        }
        function o(r, n, t) {
            return r & n | ~r & t;
        }
        function e(r, n, t) {
            return r & t | n & ~t;
        }
        function u(r, n, t) {
            return r ^ n ^ t;
        }
        function f(r, n, t) {
            return n ^ (r | ~t);
        }
        function i(r, e, u, f, i, a, c) {
            return r = t(r, t(t(o(e, u, f), i), c)), t(n(r, a), e);
        }
        function a(r, o, u, f, i, a, c) {
            return r = t(r, t(t(e(o, u, f), i), c)), t(n(r, a), o);
        }
        function c(r, o, e, f, i, a, c) {
            return r = t(r, t(t(u(o, e, f), i), c)), t(n(r, a), o);
        }
        function C(r, o, e, u, i, a, c) {
            return r = t(r, t(t(f(o, e, u), i), c)), t(n(r, a), o);
        }
        function g(r) {
            var n, t = "", o = "";
            for (n = 0; n <= 3; n++) t += (o = "0" + (r >>> 8 * n & 255).toString(16)).substr(o.length - 2, 2);
            return t;
        }
        var h, d, m, S, l, s, v, A, p, y = Array();
        for (y = function(r) {
            for (var n, t = r.length, o = t + 8, e = 16 * ((o - o % 64) / 64 + 1), u = Array(e - 1), f = 0, i = 0; i < t; ) f = i % 4 * 8, 
            u[n = (i - i % 4) / 4] = u[n] | r.charCodeAt(i) << f, i++;
            return n = (i - i % 4) / 4, f = i % 4 * 8, u[n] = u[n] | 128 << f, u[e - 2] = t << 3, 
            u[e - 1] = t >>> 29, u;
        }(r = function(r) {
            r = r.replace(/\r\n/g, "\n");
            for (var n = "", t = 0; t < r.length; t++) {
                var o = r.charCodeAt(t);
                o < 128 ? n += String.fromCharCode(o) : o > 127 && o < 2048 ? (n += String.fromCharCode(o >> 6 | 192), 
                n += String.fromCharCode(63 & o | 128)) : (n += String.fromCharCode(o >> 12 | 224), 
                n += String.fromCharCode(o >> 6 & 63 | 128), n += String.fromCharCode(63 & o | 128));
            }
            return n;
        }(r)), s = 1732584193, v = 4023233417, A = 2562383102, p = 271733878, h = 0; h < y.length; h += 16) d = s, 
        m = v, S = A, l = p, v = C(v = C(v = C(v = C(v = c(v = c(v = c(v = c(v = a(v = a(v = a(v = a(v = i(v = i(v = i(v = i(v, A = i(A, p = i(p, s = i(s, v, A, p, y[h + 0], 7, 3614090360), v, A, y[h + 1], 12, 3905402710), s, v, y[h + 2], 17, 606105819), p, s, y[h + 3], 22, 3250441966), A = i(A, p = i(p, s = i(s, v, A, p, y[h + 4], 7, 4118548399), v, A, y[h + 5], 12, 1200080426), s, v, y[h + 6], 17, 2821735955), p, s, y[h + 7], 22, 4249261313), A = i(A, p = i(p, s = i(s, v, A, p, y[h + 8], 7, 1770035416), v, A, y[h + 9], 12, 2336552879), s, v, y[h + 10], 17, 4294925233), p, s, y[h + 11], 22, 2304563134), A = i(A, p = i(p, s = i(s, v, A, p, y[h + 12], 7, 1804603682), v, A, y[h + 13], 12, 4254626195), s, v, y[h + 14], 17, 2792965006), p, s, y[h + 15], 22, 1236535329), A = a(A, p = a(p, s = a(s, v, A, p, y[h + 1], 5, 4129170786), v, A, y[h + 6], 9, 3225465664), s, v, y[h + 11], 14, 643717713), p, s, y[h + 0], 20, 3921069994), A = a(A, p = a(p, s = a(s, v, A, p, y[h + 5], 5, 3593408605), v, A, y[h + 10], 9, 38016083), s, v, y[h + 15], 14, 3634488961), p, s, y[h + 4], 20, 3889429448), A = a(A, p = a(p, s = a(s, v, A, p, y[h + 9], 5, 568446438), v, A, y[h + 14], 9, 3275163606), s, v, y[h + 3], 14, 4107603335), p, s, y[h + 8], 20, 1163531501), A = a(A, p = a(p, s = a(s, v, A, p, y[h + 13], 5, 2850285829), v, A, y[h + 2], 9, 4243563512), s, v, y[h + 7], 14, 1735328473), p, s, y[h + 12], 20, 2368359562), A = c(A, p = c(p, s = c(s, v, A, p, y[h + 5], 4, 4294588738), v, A, y[h + 8], 11, 2272392833), s, v, y[h + 11], 16, 1839030562), p, s, y[h + 14], 23, 4259657740), A = c(A, p = c(p, s = c(s, v, A, p, y[h + 1], 4, 2763975236), v, A, y[h + 4], 11, 1272893353), s, v, y[h + 7], 16, 4139469664), p, s, y[h + 10], 23, 3200236656), A = c(A, p = c(p, s = c(s, v, A, p, y[h + 13], 4, 681279174), v, A, y[h + 0], 11, 3936430074), s, v, y[h + 3], 16, 3572445317), p, s, y[h + 6], 23, 76029189), A = c(A, p = c(p, s = c(s, v, A, p, y[h + 9], 4, 3654602809), v, A, y[h + 12], 11, 3873151461), s, v, y[h + 15], 16, 530742520), p, s, y[h + 2], 23, 3299628645), A = C(A, p = C(p, s = C(s, v, A, p, y[h + 0], 6, 4096336452), v, A, y[h + 7], 10, 1126891415), s, v, y[h + 14], 15, 2878612391), p, s, y[h + 5], 21, 4237533241), A = C(A, p = C(p, s = C(s, v, A, p, y[h + 12], 6, 1700485571), v, A, y[h + 3], 10, 2399980690), s, v, y[h + 10], 15, 4293915773), p, s, y[h + 1], 21, 2240044497), A = C(A, p = C(p, s = C(s, v, A, p, y[h + 8], 6, 1873313359), v, A, y[h + 15], 10, 4264355552), s, v, y[h + 6], 15, 2734768916), p, s, y[h + 13], 21, 1309151649), A = C(A, p = C(p, s = C(s, v, A, p, y[h + 4], 6, 4149444226), v, A, y[h + 11], 10, 3174756917), s, v, y[h + 2], 15, 718787259), p, s, y[h + 9], 21, 3951481745), 
        s = t(s, d), v = t(v, m), A = t(A, S), p = t(p, l);
        return (g(s) + g(v) + g(A) + g(p)).toLowerCase();
    }
};