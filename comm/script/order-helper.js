var t = require("../../comm/script/helper"), e = require("../../comm/script/model");

require("../../comm/script/date-format");

module.exports = {
    groupDeal: function(t) {
        var e = t.__quantity__, a = void 0 !== e && e != t.__prevQuantity__ || void 0 !== e && e == t.__prevQuantity__ && this.loopmenuVoList(t.menuVoList);
        return a;
    },
    loopmenuVoList: function(t) {
        for (var e = !1, a = 0; a < t.length; a++) {
            var i = t[a];
            "G" == i.menuFlag && (e = i.__quantity__ !== i.__prevQuantity__ || this.loopGroupList(i));
        }
        return e;
    },
    loopGroupList: function(t) {
        var e = !1;
        if ("G" == t.menuFlag) for (var a = 0; a < t.iGroupVoList[0].iMenuVoList.length; a++) {
            var i = t.iGroupVoList[0].iMenuVoList[a];
            if (i.__prevQuantity__ !== i.__quantity__) {
                e = !0;
                break;
            }
        }
        return e;
    },
    loopTasteList: function(t) {
        var e = !1;
        if (t.subItems || (t.subItems = []), t.subItemsPrev || (t.subItemsPrev = []), t.subItems.length != t.subItemsPrev.length) return !0;
        for (n = 0; n < t.subItems.length; n++) {
            for (var a = t.subItems[n], i = !1, r = 0; r < t.subItemsPrev.length; r++) {
                o = t.subItemsPrev[r];
                if ("G" == t.menuFlag) {
                    if (a.productId == o.productId && this.compareTaste(a.tasteList, o.tasteList)) {
                        i = !0, a.__quantity != o.quantity__ && (e = !0);
                        break;
                    }
                } else if (this.compareTaste(a.tasteList, o.tasteList)) {
                    i = !0, a.__quantity != o.quantity__ && (e = !0);
                    break;
                }
            }
            i || (e = !0);
        }
        for (var n = 0; n < t.subItemsPrev.length; n++) {
            for (var o = t.subItemsPrev[n], i = !1, r = 0; r < t.subItems.length; r++) {
                a = t.subItems[r];
                if ("G" == t.menuFlag) {
                    if (a.productId == o.productId && this.compareTaste(a.tasteList, o.tasteList)) {
                        i = !0;
                        break;
                    }
                } else if (this.compareTaste(a.tasteList, o.tasteList)) {
                    i = !0;
                    break;
                }
            }
            if (!i) {
                e = !0;
                break;
            }
        }
        return e;
    },
    _getProductsAdd: function(e) {
        for (var a = this, i = getApp(), r = [], n = i.globalData.menuList, o = i.globalData.order.items, s = 0; s < n.length; s++) {
            var u = !1, m = [];
            n[s].childClassList && n[s].childClassList.length > 0 ? (m = n[s].childClassList, 
            u = !0) : m[0] = n[s];
            for (var d = 0; d < m.length; d++) if (a.groupDeal(m[d])) {
                var l = [];
                l = m[d].menuVoList;
                for (var c = 0; c < l.length; c++) {
                    var _ = l[c];
                    if (void 0 !== _.__quantity__ && _.__quantity__ != _.__prevQuantity__ || void 0 !== _.__quantity__ && _.__quantity__ == _.__prevQuantity__ && "G" === _.menuFlag && a.loopGroupList(_) || a.loopTasteList(_)) {
                        for (var p = -1, f = 0; f < r.length; f++) if (_.productId == r[f].productId) {
                            p = f;
                            break;
                        }
                        if (-1 == p || _.__fixCondiment__) if (e && 0 == _.memberProduct && (-1 != _.menuFlag.indexOf("M") && "M" != _.menuFlag || (_.condimentRoundList && _.condimentRoundList.length) > 0)) {
                            for (var g = 0; g < o.length; g++) {
                                var h = o[g];
                                if (h.pmId == _.productId) {
                                    h.quantity = -h.quantity, v = h;
                                    break;
                                }
                            }
                            v && r.push(v);
                        } else if ("G" == _.menuFlag) {
                            for (var y = 0; y < _.iGroupVoList[0].iMenuVoList.length; y++) {
                                var I = _.iGroupVoList[0].iMenuVoList[y];
                                if (!(I.taste && I.taste.length > 0) && (I.__quantity__ >= 0 && I.__quantity__ != I.__prevQuantity__)) {
                                    v = {
                                        ruleid: I.productId,
                                        productId: I.productId,
                                        nameCN: t._trimD(I.nameCn),
                                        nameEN: I.nameEn,
                                        classId: m[d].classExtId,
                                        itemType: 0,
                                        mealFlag: -1 != I.menuFlag.indexOf("M"),
                                        lunch: I.lunch,
                                        price: I.price,
                                        quantity: e && 0 == I.memberProduct ? 0 : I.__quantity__,
                                        modify: !0,
                                        memberProduct: I.memberProduct,
                                        maxQty: I.maxQty
                                    };
                                    r.push(v);
                                }
                            }
                            a.addTasteProducts(e, _, r, m[d].classExtId);
                        } else {
                            var v = {
                                ruleid: _.productId,
                                productId: _.productId,
                                nameCN: _.showNameCn,
                                nameEN: _.showNameEn,
                                classId: m[d].classExtId,
                                itemType: 0,
                                mealFlag: -1 != _.menuFlag.indexOf("M"),
                                lunch: _.lunch,
                                price: _.price,
                                quantity: e && 0 == _.memberProduct ? 0 : _.__quantity__,
                                modify: !0,
                                condimentItems: []
                            };
                            if ("M2" == _.menuFlag) v.itemType = 92; else if ("M3" == _.menuFlag) v.itemType = 93; else if ("M4" == _.menuFlag) v.itemType = 94; else if (-1 != _.menuFlag.indexOf("M")) v.itemType = 1, 
                            r.push(v); else if (_.condimentRoundList) {
                                var b = v.quantity;
                                if (0 != b) {
                                    v.quantity = 1;
                                    for (var N = u ? i.globalData.menuVoList.data[s].childClassList[d].menuVoList[c].condimentRoundList : i.globalData.menuVoList.data[s].menuVoList[c].condimentRoundList, q = 0; q < N.length; q++) {
                                        var L = N[q].condimentItemList[0];
                                        v.condimentItems.push({
                                            ruleid: L.productId,
                                            productId: L.productId,
                                            nameCN: L.menuCn,
                                            nameEN: "",
                                            itemType: 11,
                                            mealFlag: !1,
                                            price: _.price,
                                            quantity: b * N[q].itemCount,
                                            modify: !0
                                        });
                                    }
                                    v.quantity = 0, r.push(JSON.parse(JSON.stringify(v))), v.quantity = b, r.push(v);
                                } else {
                                    var C = v.quantity;
                                    v.quantity = 0, r.push(JSON.parse(JSON.stringify(v))), v.quantity = C, r.push(v);
                                }
                            } else _.taste && 0 != _.taste.length ? a.addTasteProducts(e, _, r, m[d].classExtId) : r.push(v);
                        } else r[p].quantity += _.__quantity__;
                    }
                }
            }
        }
        return r;
    },
    _caculateOrder: function(e, a, i) {
        if (!e.__total__) {
            for (var r = 0, n = "", o = 0; o < e.items.length; o++) {
                var s = e.items[o];
                s.__price__ = (s.realPrice / 100).toFixed(1), s.price > s.realPrice && (s.__originPrice__ = (s.price / 100).toFixed(1)), 
                s.__nameCN__ = t._trimD(s.nameCN), 4 != s.promotionType && 5 != s.promotionType && 6 != s.promotionType && s.show && (r += s.quantity), 
                (s.mealFlag || s.condimentItems && s.condimentItems.length > 0) && (s.__mealItems__ = this._getMealItems(s)), 
                s.primeCardName && (n = s.primeCardName);
            }
            if (e.__total__ = r, e.__totalPrice__ = (parseInt(e.total) / 100).toFixed(1), this._caculatePromotions(e.usedPromotions), 
            this._caculatePromotions(e.promotions), a) {
                var u = {};
                i ? u = a : (u.provincialAmount = a.provincialAmount, u.onSaleDiscountAmount = a.onSaleDiscountAmount), 
                u.provincialAmount && (u.__provincialAmount__ = (u.provincialAmount / 100).toFixed(1)), 
                a.onSaleDiscountAmount && (u.__onSaleDiscountAmount__ = (u.onSaleDiscountAmount / 100).toFixed(1)), 
                u.primeCardName = n, e.primeVo = u;
            }
        }
    },
    _getMealItems: function(e) {
        var a = new Array();
        if (e.mealItems.length > 0) for (var i = e.mealItems, r = 0; r < i.length; r++) {
            s = "    ";
            if (i.length - 1 == r && (s = ""), i[r].show) if (i[r].condimentItems && i[r].condimentItems.length > 0) for (o = 0; o < i[r].condimentItems.length; o++) {
                var n = i[r].condimentItems[o];
                a.push(t._trimD(n.nameCN) + "x" + n.quantity + s);
            } else a.push(t._trimD(i[r].nameCN) + "x" + i[r].quantity + s);
        } else if (e.condimentItems.length > 0) for (var o = 0; o < e.condimentItems.length; o++) {
            var s = "    ";
            e.condimentItems.length - 1 == r && (s = ""), (n = e.condimentItems[o]).specialNeeds && 0 != n.specialNeeds.length ? a.push(t._trimD(n.nameCN) + "(" + this.getSpecialNeedsString(n.specialNeeds) + ")x" + n.quantity + s) : a.push(t._trimD(n.nameCN) + "x" + n.quantity + s);
        }
        return a;
    },
    getSpecialNeedsString: function(t) {
        if (!t || 0 == t.length) return "标准";
        for (var e = "", a = 0; a < t.length; a++) e += t[a].laberName, e += "、";
        return e.substring(0, e.length - 1);
    },
    _caculatePromotions: function(e) {
        if (e && !(e.length < 1)) for (var a = 0; a < e.length; a++) {
            var i = e[a];
            i.__index__ = a;
            var r = [];
            if (0 == i.items.length) r.push({
                nameCN: i.couponTitleCn,
                __nameCN__: t._trimD(i.couponTitleCn),
                imagePath: i.imagePath,
                id: i.id,
                pmid: ""
            }); else for (var n = 0; n < i.items.length; n++) {
                var o = i.items[n];
                o.__nameCN__ = t._trimD(o.nameCN), o.__realPrice__ = (o.realPrice / 100).toFixed(1), 
                r.push(o);
            }
            i._items = r;
        }
    },
    _confirmOrder: function(t, e, a, i, r) {
        var n = [], o = "true";
        if (console.log(i), void 0 !== i && null != i || (i = ""), e && a) if (e.quantity += a, 
        e.mealItems = [], n.push(e), e.__fixCondiment__) {
            var s = JSON.parse(JSON.stringify(e));
            s.quantity = 0, n.push(s), e.modify = !1;
        } else 0 == e.promotionType || e.productId ? (o = "false", 0 != e.promotionType ? e.modify = !0 : (e.quantity = a, 
        e.modify = !1)) : (e.modify = !0, e.productId = "delete"); else (n = this._getProductsAdd()).forEach(function(t) {
            t.memberProduct && 2 == t.memberProduct && (t.modify = !0);
        });
        if (e && e.__fixCondiment__ && (e.condimentItems.forEach(function(t) {
            t.quantity = t.quantity / (e.quantity - a) * e.quantity;
        }), e.modify = !0), n.length > 0 && a < 0 && e) {
            var u = e.couponCode;
            if (u) for (var m = 0; m < getApp().globalData.couponNeedCountList.length; m++) if (getApp().globalData.couponNeedCountList[m].couponCode == u) {
                var d = 1;
                break;
            }
        }
        this._orderConfirm(n, o, t, i, d, r);
    },
    _orderConfirm: function(t, a, i, r, n, o) {
        var s = getApp(), u = this;
        r && void 0 !== r || (r = "");
        var m = 0;
        s.globalData.order.primeVo && (m = s.globalData.order.primeVo.provincialAmount);
        var d = {
            orderItems: JSON.stringify(t),
            oid: s.globalData.order.id,
            usedPrimeCardName: s.globalData.usedPrimeCardName,
            provincialAmount: m,
            delFlag: a,
            index: r
        };
        n && (d.isCouponItem = n), o && (d.confirmType = "checkout"), e.orderConfirm(d, function(e) {
            0 == e.data.errorCode ? (s.globalData.bigOrderValue = e.data.showBigOrder ? e.data.bigOrderValue : -1, 
            e.data.order.usedPromotions = e.data.usedPromotions, s.globalData.order = e.data.order, 
            u._caculateOrder(e.data.order, e.data.primeVo, o), "function" == typeof i && i(e)) : 339 == e.data.errorCode ? (wx.showToast({
                title: e.data.errorMsg,
                icon: "none",
                duration: 2e3
            }), "function" == typeof i && i(null)) : (t && t.length > 0 && (s.globalData.order.__total__ = null, 
            u._caculateOrder(s.globalData.order)), "function" == typeof i && i(e));
        });
    },
    _convertPayType: function(t) {
        var e = "";
        switch (t) {
          case 0:
            e = "货到现金付款";
            break;

          case 3:
            e = "肯德基宅急送美食券支付（不足部分支付现金)";
            break;

          case 1:
          case 2:
            e = "支付宝支付";
            break;

          case 4:
            e = "微信支付";
            break;

          case 7:
            e = "心意美食卡支付";
            break;

          case 5:
            e = "财付通支付";
            break;

          case 6:
            e = "肯德基礼品卡";
            break;

          case 22:
            e = "支付宝支付";
        }
        return e;
    },
    _isSupport5000Store: function(t) {
        return 18 != t.status.posStatus && 5 != t.status.iosStatus && 97 != t.status.iosStatus && 98 != t.status.iosStatus && 99 != t.status.iosStatus;
    },
    _dealOrderStatus: function(t, e) {
        var a = getApp().globalData.currPage;
        return e ? t.bookingDate ? "arrival" : "getOrderNumber" : !t.bookingDate || t.posOrderNumber || t.sendByMail ? t.posOrderNumber ? t.bookingDate && 15 != t.status.posStatus && !t.status.modified ? (a.setData({
            queryNum: ++a.queryNum
        }), e || 1 != a.queryNum ? t.store.storecode && t.store.businessdate && a.data.barcodeSwitch ? "barCode" : "getOrderNumberFail" : "arrival") : "orderNumber" : t.sendByMail || t.status && 2 == t.status.posStatus ? "getOrderNumberFail" : "tryAgain" : "arrival";
    },
    isNotFixcondiment: function() {
        for (var t = getApp().globalData.order, e = 0; e < t.items.length; e++) for (var a = t.items[e], i = 0; i < getApp().globalData.condimentIds.length; i++) {
            var r = getApp().globalData.condimentIds[i];
            a.pmId == r && (a.__fixCondiment__ = !1);
        }
    },
    compareTaste: function(t, e) {
        if (!t || !e || t.length != e.length) return !1;
        for (var a = !0, i = 0; i < t.length; i++) if (t[i].__choose__ != e[i].__choose__) {
            a = !1;
            break;
        }
        return a;
    },
    getSpecialNeeds: function(t) {
        for (var e = [], a = 0; a < t.tasteList.length; a++) t.tasteList[a].__choose__ && e.push(t.tasteList[a]);
        return e;
    },
    addTasteProducts: function(e, a, i, r) {
        a.subItemsPrev || (a.subItemsPrev = []), a.subItems || (a.subItems = []);
        for (u = 0; u < a.subItems.length; u++) {
            for (var n = a.subItems[u], o = !1, s = 0; s < a.subItemsPrev.length; s++) {
                m = a.subItemsPrev[s];
                if ("G" == a.menuFlag) {
                    if (n.productId == m.productId && this.compareTaste(n.tasteList, m.tasteList)) {
                        o = !0, n.__quantity__ != m.__quantity__ && (d = {
                            ruleid: n.productId,
                            productId: n.productId,
                            nameCN: t._trimD(n.nameCn),
                            nameEN: n.nameEn,
                            classId: r,
                            itemType: 0,
                            mealFlag: -1 != n.menuFlag.indexOf("M"),
                            lunch: n.lunch,
                            price: n.price,
                            quantity: n.__quantity__,
                            modify: !0,
                            memberProduct: n.memberProduct,
                            maxQty: n.maxQty,
                            specialNeeds: this.getSpecialNeeds(n)
                        }, i.push(d));
                        break;
                    }
                } else if (this.compareTaste(n.tasteList, m.tasteList)) {
                    if (o = !0, n.__quantity__ != m.__quantity__) {
                        d = {
                            ruleid: n.productId,
                            productId: n.productId,
                            nameCN: n.showNameCn,
                            nameEN: n.showNameEn,
                            classId: r,
                            itemType: 0,
                            mealFlag: -1 != n.menuFlag.indexOf("M"),
                            lunch: n.lunch,
                            price: n.price,
                            quantity: e && 0 == n.memberProduct ? 0 : n.__quantity__,
                            modify: !0,
                            condimentItems: [],
                            specialNeeds: this.getSpecialNeeds(n)
                        };
                        i.push(d);
                    }
                    break;
                }
            }
            if (!o) {
                d = {
                    ruleid: n.productId,
                    productId: n.productId,
                    nameCN: t._trimD(n.nameCn),
                    nameEN: n.nameEn,
                    classId: r,
                    itemType: 0,
                    mealFlag: -1 != n.menuFlag.indexOf("M"),
                    lunch: n.lunch,
                    price: n.price,
                    quantity: e && 0 == n.memberProduct ? 0 : n.__quantity__,
                    modify: !0,
                    memberProduct: n.memberProduct,
                    maxQty: n.maxQty,
                    specialNeeds: this.getSpecialNeeds(n)
                };
                i.push(d);
            }
        }
        for (var u = 0; u < a.subItemsPrev.length; u++) {
            for (var m = a.subItemsPrev[u], o = !1, s = 0; s < a.subItems.length; s++) {
                n = a.subItems[s];
                if ("G" == a.menuFlag) {
                    if (n.productId == m.productId && this.compareTaste(n.tasteList, m.tasteList)) {
                        o = !0;
                        break;
                    }
                } else if (this.compareTaste(n.tasteList, m.tasteList)) {
                    o = !0;
                    break;
                }
            }
            if (!o) {
                var d = {
                    ruleid: m.productId,
                    productId: m.productId,
                    nameCN: t._trimD(m.nameCn),
                    nameEN: m.nameEn,
                    classId: r,
                    itemType: 0,
                    mealFlag: -1 != m.menuFlag.indexOf("M"),
                    lunch: m.lunch,
                    price: m.price,
                    quantity: 0,
                    modify: !0,
                    memberProduct: m.memberProduct,
                    maxQty: m.maxQty,
                    specialNeeds: this.getSpecialNeeds(m)
                };
                i.push(d);
            }
        }
    }
};