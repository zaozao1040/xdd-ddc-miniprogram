Component({
    /* 通信数据 */
    properties: {
        title: {
            type: String,
            value: '提示'
        },
        content: String,
        content2: String,
        money: String,
        cancel: {
            type: String,
            value: '取消'
        },
        confirm: {
            type: String,
            value: '确定'
        },
        params: Object,


    },
    /* 私有数据 */
    data: {},
    methods: {
        closeModal: function(e) {
            this.triggerEvent('closemodal')
        },
        handleConfirm: function(e) {

            this.triggerEvent('handleconfirm', e.currentTarget.dataset.modalparam)
        },
    },
    /* 生命周期 */
    pageLifetimes: {
        show() {
            console.log('3333', this.data.useType)
        }
    }

})