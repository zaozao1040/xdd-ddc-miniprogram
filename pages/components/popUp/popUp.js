Component({
    /* 通信数据 */
    properties: {
        title: {
            type: String,
            value: '提示'
        },
        content: String,
        text: {
            type: String,
            value: '知道了'
        }

    },
    /* 私有数据 */
    data: {},
    methods: {
        closeModal: function(e) {
            this.triggerEvent('closemodal')
        },
    },
    /* 生命周期 */
    pageLifetimes: {
        show() {
            console.log('3333', this.data.useType)
        }
    }

})