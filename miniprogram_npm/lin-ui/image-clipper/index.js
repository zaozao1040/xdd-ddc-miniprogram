import dataUtil from "../core/utils/data-util";
import eventUtil from "../core/utils/event-util";
import {
  determineDirection,
  calcImageOffset,
  calcImageScale,
  calcImageSize,
  calcPythagoreanTheorem,
  clipTouchMoveOfCalculate,
  imageTouchMoveOfCalcOffset,
} from "./calculate";
const detail = !0,
  IMAGE_TYPE = { base64: "base64", url: "url" };
Component({
  externalClasses: ["l-class"],
  relations: { "../image-clipper-tools/index": { type: "child" } },
  options: { pureDataPattern: /^_/ },
  properties: {
    show: { type: Boolean, value: !1 },
    zIndex: { type: Number, value: 99 },
    imageUrl: { type: String },
    type: { type: String, options: ["url", "base64"], value: "url" },
    quality: { type: Number, value: 1 },
    width: { type: Number, value: 400 },
    height: { type: Number, value: 400 },
    minWidth: { type: Number, value: 200 },
    maxWidth: { type: Number, value: 600 },
    minHeight: { type: Number, value: 200 },
    maxHeight: { type: Number, value: 600 },
    lockWidth: { type: Boolean, value: !1 },
    lockHeight: { type: Boolean, value: !1 },
    lockRatio: { type: Boolean, value: !0 },
    scaleRatio: { type: Number, value: 1 },
    minRatio: { type: Number, value: 0.5 },
    maxRatio: { type: Number, value: 2 },
    disableScale: { type: Number, value: !1 },
    disableRotate: { type: Number, value: !1 },
    limitMove: { type: Boolean, value: !1 },
    checkImage: { type: Boolean, value: !0 },
    checkImageIcon: {
      type: String,
      value: ".https://ddcpub.oss-cn-beijing.aliyuncs.com/diancan/photo.png",
    },
    rotateAlong: { type: Boolean, value: !0 },
    rotateAlongIcon: {
      type: String,
      value:
        ".https://ddcpub.oss-cn-beijing.aliyuncs.com/diancan/rotate-along.png",
    },
    rotateInverse: { type: Boolean, value: !0 },
    rotateInverseIcon: {
      type: String,
      value:
        ".https://ddcpub.oss-cn-beijing.aliyuncs.com/diancan/rotate-inverse.png",
    },
    sure: { type: Boolean, value: !0 },
    sureIcon: {
      type: String,
      value: ".https://ddcpub.oss-cn-beijing.aliyuncs.com/diancan/sure.png",
    },
    close: { type: Boolean, value: !0 },
    closeIcon: {
      type: String,
      value: ".https://ddcpub.oss-cn-beijing.aliyuncs.com/diancan/close.png",
    },
    rotateAngle: { type: Number, value: 90 },
  },
  data: {
    CANVAS_WIDTH: 0,
    CANVAS_HEIGHT: 0,
    cutX: 0,
    cutY: 0,
    clipWidth: 0,
    clipHeight: 0,
    cutAnimation: !1,
    imageWidth: 0,
    imageHeight: 0,
    imageTop: 0,
    imageLeft: 0,
    scale: 1,
    angle: 0,
    _SYS_INFO: {},
    _MOVE_THROTTLE: null,
    _MOVE_THROTTLE_FLAG: !0,
    _TIME_CUT_CENTER: null,
    _flagCutTouch: !1,
    _flagEndTouch: !1,
    _CUT_START: {},
    _cutAnimationTime: null,
    _touchRelative: [{ x: 0, y: 0 }],
    _hypotenuseLength: 0,
    _ctx: null,
  },
  observers: {
    imageUrl(t) {
      t &&
        (this.imageReset(),
        wx.showLoading({ title: "请稍候...", mask: !0 }),
        wx.getImageInfo({
          src: t,
          success: (t) => {
            this.imgComputeSize(t.width, t.height),
              this.properties.limitMove &&
                (this.imgMarginDetectionScale(),
                eventUtil.emit(this, "linimageready", t));
          },
          fail: () => {
            this.imgComputeSize(),
              this.properties.limitMove && this.imgMarginDetectionScale();
          },
        }));
    },
    "clipWidth, clipHeight"(t, e) {
      let { minWidth: i, minHeight: a } = this.data;
      (i /= 2),
        (a /= 2),
        t < i && dataUtil.setDiffData(this, { clipWidth: i }),
        e < a && dataUtil.setDiffData(this, { clipHeight: a }),
        this.computeCutSize();
    },
    rotateAngle(t) {
      dataUtil.setDiffData(this, { cutAnimation: !0, angle: t });
    },
    angle(t) {
      this.moveStop();
      const { limitMove: e } = this.properties;
      e &&
        t % 90 &&
        dataUtil.setDiffData(this, { angle: 90 * Math.round(t / 90) }),
        this.imgMarginDetectionScale();
    },
    cutAnimation(t) {
      if ((clearTimeout(this.data._cutAnimationTime), t)) {
        let t = setTimeout(() => {
          dataUtil.setDiffData(this, { cutAnimation: !1 });
        }, 260);
        dataUtil.setDiffData(this, { _cutAnimationTime: t });
      }
    },
    limitMove(t) {
      t &&
        (this.data.angle % 90 &&
          dataUtil.setDiffData(this, {
            angle: 90 * Math.round(this.data.angle / 90),
          }),
        this.imgMarginDetectionScale());
    },
    "cutY, cutX"() {
      this.cutDetectionPosition();
    },
    "width, height"(t, e) {
      t !== this.width && dataUtil.setDiffData(this, { clipWidth: t / 2 }),
        e !== this.height && dataUtil.setDiffData(this, { clipHeight: e / 2 });
    },
  },
  methods: {
    setCutInfo() {
      const { width: t, height: e } = this.properties,
        { _SYS_INFO: i } = this.data,
        a = t / 2,
        s = e / 2,
        o = (i.windowHeight - s) / 2,
        h = (i.windowWidth - a) / 2,
        l = i.windowWidth / 2,
        n = i.windowHeight / 2,
        c = wx.createCanvasContext("image-clipper", this);
      this.setData({
        clipWidth: a,
        clipHeight: s,
        cutX: h,
        cutY: o,
        CANVAS_HEIGHT: s,
        CANVAS_WIDTH: a,
        _ctx: c,
        imageLeft: l,
        imageTop: n,
      });
    },
    setCutCenter() {
      const {
        sysInfo: t,
        clipHeight: e,
        clipWidth: i,
        imageTop: a,
        imageLeft: s,
      } = this.data;
      let o = t || wx.getSystemInfoSync(),
        h = 0.5 * (o.windowHeight - e),
        l = 0.5 * (o.windowWidth - i);
      this.setData({
        imageTop: a - this.data.cutY + h,
        imageLeft: s - this.data.cutX + l,
        cutY: h,
        cutX: l,
      });
    },
    clipTouchStart(t) {
      if (!this.properties.imageUrl)
        return void wx.showToast({ title: "请选择图片", icon: "none" });
      const e = t.touches[0].clientX,
        i = t.touches[0].clientY,
        { cutX: a, cutY: s, clipWidth: o, clipHeight: h } = this.data,
        l = determineDirection(a, s, o, h, e, i);
      this.moveDuring();
      const n = {
        width: o,
        height: h,
        x: e,
        y: i,
        cutY: s,
        cutX: a,
        corner: l,
      };
      this.setData({ _flagCutTouch: !0, _flagEndTouch: !0, _CUT_START: n });
    },
    clipTouchMove(t) {
      if (!this.properties.imageUrl)
        return void wx.showToast({ title: "请选择图片", icon: "none" });
      if (1 !== t.touches.length) return;
      const { _flagCutTouch: e, _MOVE_THROTTLE_FLAG: i } = this.data;
      if (e && i) {
        const { lockRatio: e, lockHeight: i, lockWidth: a } = this.properties;
        if (e && (a || i)) return;
        dataUtil.setDiffData(this, { _MOVE_THROTTLE_FLAG: !1 }),
          this.moveThrottle();
        const s = clipTouchMoveOfCalculate(this.data, t);
        if (s) {
          const { width: t, height: e, cutX: o, cutY: h } = s;
          a || i
            ? a
              ? i || dataUtil.setDiffData(this, { clipHeight: e, cutY: h })
              : dataUtil.setDiffData(this, { clipWidth: t, cutX: o })
            : dataUtil.setDiffData(this, {
                clipWidth: t,
                clipHeight: e,
                cutX: o,
                cutY: h,
              }),
            this.imgMarginDetectionScale();
        }
      }
    },
    clipTouchEnd() {
      this.moveStop(), this.setData({ _flagCutTouch: !1 });
    },
    moveDuring() {
      clearTimeout(this.data._TIME_CUT_CENTER);
    },
    moveStop() {
      clearTimeout(this.data._TIME_CUT_CENTER);
      const t = setTimeout(() => {
        this.data.cutAnimation ||
          dataUtil.setDiffData(this, { cutAnimation: !0 }),
          this.setCutCenter();
      }, 800);
      dataUtil.setDiffData(this, { _TIME_CUT_CENTER: t });
    },
    moveThrottle() {
      if ("android" === this.data._SYS_INFO.platform) {
        clearTimeout(this.data._MOVE_THROTTLE);
        const t = setTimeout(() => {
          dataUtil.setDiffData(this, { _MOVE_THROTTLE_FLAG: !0 });
        }, 20);
        dataUtil.setDiffData(this, { _MOVE_THROTTLE: t });
      } else dataUtil.setDiffData(this, { _MOVE_THROTTLE_FLAG: !0 });
    },
    imageReset() {
      const t = this.data._SYS_INFO || wx.getSystemInfoSync();
      this.setData({
        scale: 1,
        angle: 0,
        imageTop: t.windowHeight / 2,
        imageLeft: t.windowWidth / 2,
      });
    },
    imageLoad() {
      this.imageReset(),
        wx.hideLoading(),
        eventUtil.emit(this, "linimageload", !0);
    },
    imgComputeSize(t, e) {
      const { imageWidth: i, imageHeight: a } = calcImageSize(t, e, this.data);
      this.setData({ imageWidth: i, imageHeight: a });
    },
    imgMarginDetectionScale(t) {
      if (!this.properties.limitMove) return;
      const e = calcImageScale(this.data, t);
      this.imgMarginDetectionPosition(e);
    },
    imgMarginDetectionPosition(t) {
      if (!this.properties.limitMove) return;
      const { scale: e, left: i, top: a } = calcImageOffset(this.data, t);
      dataUtil.setDiffData(this, { imageLeft: i, imageTop: a, scale: e });
    },
    imageTouchStart(t) {
      this.setData({ _flagEndTouch: !1 });
      const { imageLeft: e, imageTop: i } = this.data,
        a = t.touches[0].clientX,
        s = t.touches[0].clientY;
      let o = [];
      if (1 === t.touches.length)
        (o[0] = { x: a - e, y: s - i }), this.setData({ _touchRelative: o });
      else {
        const h = t.touches[1].clientX,
          l = t.touches[1].clientY;
        let n = Math.abs(a - h),
          c = Math.abs(s - l);
        const u = calcPythagoreanTheorem(n, c);
        (o = [
          { x: a - e, y: s - i },
          { x: h - e, y: l - i },
        ]),
          this.setData({ _touchRelative: o, _hypotenuseLength: u });
      }
    },
    imageTouchMove(t) {
      const { _flagEndTouch: e, _MOVE_THROTTLE_FLAG: i } = this.data;
      if (e || !i) return;
      const a = t.touches[0].clientX,
        s = t.touches[0].clientY;
      if (
        (dataUtil.setDiffData(this, { _MOVE_THROTTLE_FLAG: !1 }),
        this.moveThrottle(),
        this.moveDuring(),
        1 === t.touches.length)
      ) {
        const { left: t, top: e } = imageTouchMoveOfCalcOffset(this.data, a, s);
        dataUtil.setDiffData(this, { imageLeft: t, imageTop: e }),
          this.imgMarginDetectionPosition();
      } else {
        const e = t.touches[1].clientX,
          i = t.touches[1].clientY;
        let o = Math.abs(a - e),
          h = Math.abs(s - i),
          l = calcPythagoreanTheorem(o, h),
          n = this.data.scale * (l / this.data._hypotenuseLength);
        this.properties.disableScale
          ? (n = 1)
          : ((n = n <= this.properties.minRatio ? this.properties.minRatio : n),
            (n = n >= this.properties.maxRatio ? this.properties.maxRatio : n),
            eventUtil.emit(this, "linsizechange", {
              imageWidth: this.data.imageWidth * n,
              imageHeight: this.data.imageHeight * n,
            })),
          this.imgMarginDetectionScale(n),
          dataUtil.setDiffData(this, {
            _hypotenuseLength: Math.sqrt(Math.pow(o, 2) + Math.pow(h, 2)),
            scale: n,
          });
      }
    },
    imageTouchEnd() {
      dataUtil.setDiffData(this, { _flagEndTouch: !0 }), this.moveStop();
    },
    cutDetectionPosition() {
      const {
        cutX: t,
        cutY: e,
        _SYS_INFO: i,
        clipHeight: a,
        clipWidth: s,
      } = this.data;
      let o = () => {
          e < 0 && dataUtil.setDiffData(this, { cutY: 0 }),
            e > i.windowHeight - a &&
              dataUtil.setDiffData(this, { cutY: i.windowHeight - a });
        },
        h = () => {
          t < 0 && dataUtil.setDiffData(this, { cutX: 0 }),
            t > i.windowWidth - s &&
              dataUtil.setDiffData(this, { cutX: i.windowWidth - s });
        };
      if (null === e && null === t) {
        let t = 0.5 * (i.windowHeight - a),
          e = 0.5 * (i.windowWidth - s);
        dataUtil.setDiffData(this, { cutX: e, cutY: t });
      } else
        null !== e && null !== t
          ? (o(), h())
          : null !== e && null === t
          ? (o(), dataUtil.setDiffData(this, { cutX: (i.windowWidth - s) / 2 }))
          : null === e &&
            null !== t &&
            (h(),
            dataUtil.setDiffData(this, { cutY: (i.windowHeight - a) / 2 }));
    },
    computeCutSize() {
      const {
        clipHeight: t,
        clipWidth: e,
        _SYS_INFO: i,
        cutX: a,
        cutY: s,
      } = this.data;
      e > i.windowWidth
        ? dataUtil.setDiffData(this, { clipWidth: i.windowWidth })
        : e + a > i.windowWidth &&
          dataUtil.setDiffData(this, { cutX: i.windowWidth - a }),
        t > i.windowHeight
          ? dataUtil.setDiffData(this, { clipHeight: i.windowHeight })
          : t + s > i.windowHeight &&
            dataUtil.setDiffData(this, { cutY: i.windowHeight - s });
    },
    getImageData() {
      if (!this.properties.imageUrl)
        return void wx.showToast({ title: "请选择图片", icon: "none" });
      wx.showLoading({ title: "加载中" });
      const {
        clipHeight: t,
        clipWidth: e,
        _ctx: i,
        scale: a,
        imageLeft: s,
        imageTop: o,
        cutX: h,
        cutY: l,
        angle: n,
      } = this.data;
      let { CANVAS_HEIGHT: c, CANVAS_WIDTH: u } = this.data;
      const {
          scaleRatio: g,
          imageUrl: r,
          quality: d,
          type: m,
        } = this.properties,
        p = () => {
          const c = this.data.imageWidth * a * g,
            u = this.data.imageHeight * a * g,
            p = s - h,
            f = o - l;
          i.translate(p * g, f * g),
            i.rotate((n * Math.PI) / 180),
            i.drawImage(r, -c / 2, -u / 2, c, u),
            i.draw(!1, () => {
              let i = {
                  width: e * g,
                  height: Math.round(t * g),
                  destWidth: e * g,
                  destHeight: Math.round(t) * g,
                  fileType: "png",
                  quality: d,
                },
                a = { url: "", base64: "", width: e * g, height: t * g };
              IMAGE_TYPE.base64 === m
                ? wx.canvasGetImageData({
                    canvasId: "image-clipper",
                    x: 0,
                    y: 0,
                    width: e * g,
                    height: Math.round(t * g),
                    success: (t) => {
                      const e = new Uint8Array(t.data),
                        i = wx.arrayBufferToBase64(e);
                      (a.url = i),
                        (a.base64 = i),
                        wx.hideLoading(),
                        eventUtil.emit(this, "linclip", a);
                    },
                  })
                : wx.canvasToTempFilePath(
                    {
                      ...i,
                      canvasId: "image-clipper",
                      success: (t) => {
                        (a.url = t.tempFilePath),
                          (a.base64 = t.tempFilePath),
                          wx.hideLoading(),
                          eventUtil.emit(this, "linclip", a);
                      },
                      fail(t) {
                        throw t;
                      },
                    },
                    this
                  );
            });
        };
      u !== e || c !== t
        ? ((u = e),
          (c = t),
          i.draw(),
          setTimeout(() => {
            p();
          }, 100))
        : p();
    },
    uploadImage() {
      wx.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (t) => {
          const e = t.tempFilePaths;
          this.setData({ imageUrl: e });
        },
      });
    },
    rotate(t) {
      if (this.properties.disableRotate) return;
      if (!this.properties.imageUrl)
        return void wx.showToast({ title: "请选择图片", icon: "none" });
      const { rotateAngle: e } = this.properties,
        i = this.data.angle;
      "along" === t.currentTarget.dataset.type
        ? this.setData({ angle: i + e })
        : this.setData({ angle: i - e }),
        eventUtil.emit(this, "linrotate", { currentDeg: this.data.angle });
    },
    close() {
      this.setData({ show: !1 });
    },
    doNothing() {},
  },
  lifetimes: {
    ready() {
      const t = wx.getSystemInfoSync();
      this.setData({ _SYS_INFO: t }),
        this.setCutInfo(),
        this.setCutCenter(),
        this.computeCutSize(),
        this.cutDetectionPosition();
    },
  },
});
