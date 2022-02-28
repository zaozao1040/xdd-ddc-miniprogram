Component({
  /* 通信数据 */
  properties: {
    title: {
      type: String,
      value: "提示",
    },
    content: String,
    content1: String,
    content2: String,
    content3: String,
    content4: String,
    content5: String,
    money: String,
    money1: String,
    money2: String,
    money3: String,
    money4: String,
    money5: String,
    cancel: {
      type: String,
      value: "取消",
    },
    confirm: {
      type: String,
      value: "确定",
    },
    params: Object,
  },
  /* 私有数据 */
  data: {},
  methods: {
    closeModal: function (e) {
      this.triggerEvent("closemodal");
    },
    handleConfirm: function (e) {
      this.triggerEvent("handleconfirm", e.currentTarget.dataset.modalparam);
    },
  },
  /* 生命周期 */
  pageLifetimes: {
    show() {
      console.log("3333", this.data.useType);
    },
  },
});
