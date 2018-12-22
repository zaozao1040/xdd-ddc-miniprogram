var t = require("../../comm/script/helper");

module.exports = {
    _getDefaultClassInfo: function() {
        var t = getApp(), e = t.globalData.menuVoList.data, i = {};
        if (t.globalData.defaultClassId) i.classId = t.globalData.defaultClassId; else {
            for (var a = 0; a < e.length; a++) {
                var n = e[a];
                if ("1" == n.selected) {
                    i.classId = n.classExtId;
                    break;
                }
            }
            i.classId || (i.classId = e[0].classExtId);
        }
        return i;
    },
    _initSelectedClassInfo: function(e) {
        for (var i = 0; i < e.length; i++) {
            var a = !1, n = [];
            e[i].childClassList && e[i].childClassList.length > 0 ? (n = e[i].childClassList, 
            a = !0) : n[0] = e[i];
            for (var s = 0; s < n.length; s++) for (var r = n[s], _ = 0; _ < r.menuVoList.length; _++) {
                var l = r.menuVoList[_];
                if (l.__disabled__ = this._productCanBuy(l) ? 0 : 1, !l.__price__) {
                    l.__price__ = (l.price / 100).toFixed(1);
                    var u = t._trimD2(l.nameCn);
                    -1 != u.indexOf("BBN") && (l.__nameCns__ = u.split("BBN")), l.__nameCn__ = t._trimD(l.nameCn);
                    var o = getApp().globalData.bigSystemIds;
                    o && -1 != o.indexOf(l.productId) && (l.__showbigimg__ = !0);
                }
                var d = l.price, m = a ? getApp().globalData.menuVoList.data[i].childClassList[s].menuVoList[_].condimentRoundList : getApp().globalData.menuVoList.data[i].menuVoList[_].condimentRoundList;
                if (m) {
                    for (var p = !0, g = 0; g < m.length; g++) {
                        var c = m[g].condimentItemList;
                        p && c.length > 1 && (p = !1);
                        for (var f = 0; f < c.length; f++) {
                            var h = c[f];
                            void 0 === m[g].__minPrice__ ? m[g].__minPrice__ = h.price : m[g].__minPrice__ > h.price && (m[g].__minPrice__ = h.price);
                        }
                        d += m[g].__minPrice__ * m[g].itemCount;
                    }
                    l.__fixCondiment__ = p, 0 == l.__fixCondiment__ && getApp().globalData.condimentIds.push(l.productId);
                }
                d = (d / 100).toFixed(1), l.__price__ = d;
            }
        }
    },
    _productCanBuy: function(t, e) {
        var i = getApp(), a = i.globalData.menuVoList.configuration, n = i.globalData.halfProductList, s = i.globalData.hasAddedHalf;
        if (t && 1 == t.willSaleFlag) return !1;
        if (t && 1 == t.disabledFlag) return !1;
        if (t && t.__quantity__ >= t.maxQty) return !1;
        if (null != e && (7 == e.itemType || 8 == e.itemType || 9 == e.itemType)) return !1;
        if (null != e && e.condimentItems && e.condimentItems.length > 0 && !e.__fixCondiment__) return !1;
        if (this._isHalfProduct(t, e, n)) {
            if (e && !s[e.pmId] && (s[e.pmId] = e.quantity), t && !n[t.productId] && (n[t.productId] = t.lunch), 
            this._getAddedHalfNum() > a.halfPriceNum) return !1;
            if (t && t.__quantity__ >= a.eachHalfPriceNum) return !1;
            if (!t && e.quantity >= a.eachHalfPriceNum) return !1;
        }
        var r = this._getHalfSysId(t, e, n);
        return !r || (this._getAddedHalfNum() > a.halfPriceNum || s[r] >= a.eachHalfPriceNum);
    },
    _getAddedHalfNum: function(t) {
        var e = 0;
        for (var i in t) e += t[i];
        return e;
    },
    _isHalfProduct: function(t, e, i) {
        return null == t ? !!i[e.pmId] : !!t.lunch;
    },
    _getHalfSysId: function(t, e, i) {
        var a = null;
        for (var n in i) {
            if (null == t && e.pmId == i[n]) {
                a = n;
                break;
            }
            if (t && t.productId == i[n]) {
                a = n;
                break;
            }
        }
        return a;
    },
    isFixcondiment: function(t, e) {
        if (null != t) {
            for (var i = !0, a = 0; a < t.length; a++) {
                var n = t[a].condimentItemList;
                i && n.length > 1 && (i = !1);
            }
            return i;
        }
    },
    _syncMenuVoList: function(t, e, i, a) {
        var n = this, s = getApp().globalData.defaultClassId, r = getApp().globalData.isSpecialNeed, _ = null;
        getApp().globalData.hasAddedHalf = [];
        var l = [];
        if (!a) {
            for (b = 0; b < e.length; b++) {
                var u = !1, o = [];
                e[b].childClassList && e[b].childClassList.length > 0 ? (o = e[b].childClassList, 
                u = !0) : o[0] = e[b];
                for (var d = [], m = 0; m < o.length; m++) {
                    var p = o[m], g = {
                        classExtId: p.classExtId,
                        nameCn: p.nameCn,
                        imageCnUrl: p.imageCnUrl,
                        __quantity__: 0,
                        __prevQuantity__: 0,
                        menuVoList: []
                    };
                    p.__quantity__ = 0, p.__prevQuantity__ = 0;
                    for (V = 0; V < p.menuVoList.length; V++) {
                        p.menuVoList[V].iGroupVoList && p.menuVoList[V].iGroupVoList.length > 0 && p.menuVoList[V].iGroupVoList[0].iMenuVoList.forEach(function(t) {
                            t.__quantity__ = 0, t.__prevQuantity__ = 0;
                        });
                        var c = {
                            taste: p.menuVoList[V].taste,
                            isMultipleChoice: p.menuVoList[V].isMultipleChoice,
                            menuFlag: p.menuVoList[V].menuFlag,
                            productId: p.menuVoList[V].productId,
                            linkId: p.menuVoList[V].linkId,
                            systemId: p.menuVoList[V].systemId,
                            nameCn: p.menuVoList[V].nameCn,
                            descCn: p.menuVoList[V].descCn,
                            imageUrl: p.menuVoList[V].imageUrl,
                            price: p.menuVoList[V].price,
                            maxQty: p.menuVoList[V].maxQty,
                            __quantity__: 0,
                            __prevQuantity__: 0,
                            iGroupVoList: p.menuVoList[V].iGroupVoList,
                            condimentRoundList: p.menuVoList[V].condimentRoundList && p.menuVoList[V].condimentRoundList.length > 0,
                            __fixCondiment__: !!p.menuVoList[V].condimentRoundList && this.isFixcondiment(p.menuVoList[V].condimentRoundList, p.menuVoList[V].nameCn)
                        };
                        if ("G" == c.menuFlag) {
                            for (var f = c.iGroupVoList[0].iMenuVoList, h = 0; h < f.length; h++) if (f[h].taste && f[h].taste.length > 0) {
                                r || (r = !0, getApp().globalData.isSpecialNeed = !0);
                                for (var L = JSON.parse(f[h].taste), I = [], v = 0; v < L.length; v++) I.push({
                                    id: L[v].id,
                                    orderItemId: L[v].orderItemId,
                                    laberPmId: L[v].laberPmId,
                                    laberName: L[v].laberName,
                                    __choose__: !1
                                });
                                f[h].__tasteList__ = I;
                            }
                        } else if (c.taste && c.taste.length > 0) {
                            r || (r = !0, getApp().globalData.isSpecialNeed = !0);
                            for (var L = JSON.parse(c.taste), I = [], v = 0; v < L.length; v++) I.push({
                                id: L[v].id,
                                orderItemId: L[v].orderItemId,
                                laberPmId: L[v].laberPmId,
                                laberName: L[v].laberName,
                                __choose__: !1
                            });
                            c.__tasteList__ = I;
                        }
                        g.menuVoList.push(c), p.menuVoList[V].__quantity__ = 0, p.menuVoList[V].__prevQuantity__ = 0;
                    }
                    d.push(g);
                }
                var y = {};
                u ? ((y = JSON.parse(JSON.stringify(e[b]))).childClassList = d, y.__quantity__ = 0) : y = d[0], 
                _ || s != e[b].classExtId || (_ = y), l.push(y);
            }
            getApp().globalData.menuList = l;
        }
        for (var b = 0; b < t.items.length; b++) {
            var C = t.items[b];
            if (C.show) {
                C.__disabled__ = this._productCanBuy(null, C) ? 0 : 1;
                for (var V = 0; V < l.length; V++) {
                    var N = l[V], q = !1, P = [];
                    N.childClassList && N.childClassList.length > 0 ? (P = N.childClassList, q = !0) : P[0] = N;
                    for (var D = 0, S = 0; S < P.length; S++) {
                        for (var A = P[S], x = A.__quantity__, v = 0; v < A.menuVoList.length; v++) {
                            var O = A.menuVoList[v];
                            if ("G" == O.menuFlag) for (var J = 0; J < O.iGroupVoList[0].iMenuVoList.length; J++) {
                                var F = O.iGroupVoList[0].iMenuVoList[J];
                                F.productId == C.pmId && 0 == C.promotionType && (O.__quantity__ += C.quantity, 
                                O.__prevQuantity__ += C.quantity, F.__quantity__ = C.quantity, F.__prevQuantity__ += C.quantity, 
                                C.__fixCondiment__ = O.__fixCondiment__, x += C.quantity, !0, F.taste && F.taste.length > 0 && (O.subItems || (O.subItems = []), 
                                O.subItemsPrev || (O.subItemsPrev = []), (Q = JSON.parse(JSON.stringify(F))).__quantity__ = C.quantity, 
                                Q.__prevQuantity__ = C.quantity, Q.tasteList = n.getTasteListFromOrderItem(F.__tasteList__, C.specialNeeds), 
                                O.subItems.push(JSON.parse(JSON.stringify(Q))), O.subItemsPrev.push(JSON.parse(JSON.stringify(Q)))));
                            } else {
                                if (O.productId == C.pmId && 0 == C.promotionType && (O.__quantity__ += C.quantity, 
                                O.__prevQuantity__ += C.quantity, C.__fixCondiment__ = O.__fixCondiment__, x += C.quantity, 
                                !0, O.taste && O.taste.length > 0)) {
                                    O.subItems || (O.subItems = []), O.subItemsPrev || (O.subItemsPrev = []);
                                    var Q = JSON.parse(JSON.stringify(O));
                                    Q.subItems = null, Q.__quantity__ = C.quantity, Q.__prevQuantity__ = C.quantity, 
                                    Q.tasteList = n.getTasteListFromOrderItem(O.__tasteList__, C.specialNeeds), O.subItems.push(JSON.parse(JSON.stringify(Q))), 
                                    O.subItemsPrev.push(JSON.parse(JSON.stringify(Q)));
                                }
                                O.productId == C.pmId && (C.quantity >= O.maxQty ? C.__disablePlus__ = !0 : C.__disablePlus__ = !1);
                            }
                        }
                        D += x, A.__quantity__ = x, A.__prevQuantity__ = x;
                    }
                    q && (N.__quantity__ = D);
                }
            }
        }
        _ && i && this._initSelectedClassInfo(_);
    },
    _initialLabelClass: function() {
        for (var e = getApp().globalData.menuVoList.orderLabelClass.menuVoList, i = getApp().globalData.selectedLabelSysIds, a = 0; a < e.length; a++) {
            var n = e[a];
            if (n.__nameCn__ = t._trimD(n.nameCn), i.length > 0) for (var s = 0; s < i.length; s++) i[s] == n.productId && (n.__selected__ = !0);
        }
    },
    _getMenuBanner: function(t) {
        var e = "";
        if (t) for (var i = 0; i < t.length; i++) if (17 == t[i].bannerType) {
            e = t[i].imageUrl;
            break;
        }
        return e;
    },
    _filterIclassVos: function(t) {
        t && t[0] && ("3" != t[0].singlePageFlag && "4" != t[0].singlePageFlag || t.shift());
    },
    shopIsShow: function() {
        var t = getApp().globalData.couponNeedCountList;
        if (t && t.length > 0) return !0;
        var e = 0;
        return getApp().globalData.menuList.forEach(function(t) {
            e += t.__quantity__;
        }), e > 0;
    },
    getTasteListFromOrderItem: function(t, e) {
        for (var i = [], a = 0; a < t.length; a++) {
            for (var n = t[a], s = !1, r = 0; r < e.length; r++) if (n.laberPmId == e[r].laberPmId) {
                s = !0;
                break;
            }
            n.__choose__ = s, i.push(n);
        }
        return i;
    },
    _initPrimeCardName: function(t) {
        if (t) getApp().globalData.usedPrimeCardName = t; else {
            var e = getApp().globalData.primeCardVo;
            e && e.primeInfo && e.primeInfo.length > 0 ? getApp().globalData.usedPrimeCardName = "All" : getApp().globalData.usedPrimeCardName = "";
        }
    }
};