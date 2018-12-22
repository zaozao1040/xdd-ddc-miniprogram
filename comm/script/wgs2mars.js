function t(t, n, a, h) {
    this.west = Math.min(t, a), this.north = Math.max(n, h), this.east = Math.max(t, a), 
    this.south = Math.min(n, h);
}

function n(t, n, a) {
    return t.west <= n && t.east >= n && t.north >= a && t.south <= a;
}

function a(t, a) {
    for (var h = 0; h < M.length; h++) if (n(M[h], t, a)) {
        for (h = 0; h < o.length; h++) if (n(o[h], t, a)) return !1;
        return !0;
    }
    return !1;
}

function h(t, n) {
    var a = 2 * t - 100 + 3 * n + .2 * n * n + .1 * t * n + .2 * Math.sqrt(Math.abs(t));
    return a += 2 * (20 * Math.sin(6 * t * s) + 20 * Math.sin(2 * t * s)) / 3, (a += 2 * (20 * Math.sin(n * s) + 40 * Math.sin(n / 3 * s)) / 3) + 2 * (160 * Math.sin(n / 12 * s) + 320 * Math.sin(n * s / 30)) / 3;
}

function r(t, n) {
    var a = 300 + t + 2 * n + .1 * t * t + .1 * t * n + .1 * Math.sqrt(Math.abs(t));
    return a += 2 * (20 * Math.sin(6 * t * s) + 20 * Math.sin(2 * t * s)) / 3, (a += 2 * (20 * Math.sin(t * s) + 40 * Math.sin(t / 3 * s)) / 3) + 2 * (150 * Math.sin(t / 12 * s) + 300 * Math.sin(t / 30 * s)) / 3;
}

var s = 3.141592653589793, e = 6378245, i = .006693421622965943, M = [ new t(79.4462, 49.2204, 96.33, 42.8899), new t(109.6872, 54.1415, 135.0002, 39.3742), new t(73.1246, 42.8899, 124.143255, 29.5297), new t(82.9684, 29.5297, 97.0352, 26.7186), new t(97.0253, 29.5297, 124.367395, 20.414096), new t(107.975793, 20.414096, 111.744104, 17.871542) ], o = [ new t(119.921265, 25.398623, 122.497559, 21.785006), new t(101.8652, 22.284, 106.665, 20.0988), new t(106.4525, 21.5422, 108.051, 20.4878), new t(109.0323, 55.8175, 119.127, 50.3257), new t(127.4568, 55.8175, 137.0227, 49.5574), new t(131.2662, 44.8922, 137.0227, 42.5692) ];

module.exports = {
    transformFromWGSToGCJ: function(t, n) {
        if (!a(t, n)) return {
            lat: n,
            lng: t
        };
        var M = h(t - 105, n - 35), o = r(t - 105, n - 35), u = n / 180 * s, w = Math.sin(u), w = 1 - i * w * w, f = Math.sqrt(w);
        return M = 180 * M / (e * (1 - i) / (w * f) * s), o = 180 * o / (e / f * Math.cos(u) * s), 
        {
            lat: n + M,
            lng: t + o
        };
    }
};