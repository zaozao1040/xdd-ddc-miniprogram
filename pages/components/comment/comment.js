Component({
    /* 通信数据 */
    properties: {
        detail: {
            type: Object
        }
    },
    data: {
        comment: {}
    },
    lifetimes: {
        ready: function() {

            let weekend = {
                MONDAY: '周一',
                TUESDAY: '周二',
                WEDNESDAY: '周三',
                THURSDAY: '周四',
                SATURDAY: '周六',
                FRIDAY: '周五',
                SUNDAY: '周日'
            }
            let mealType = {
                BREAKFASE: '早餐',
                LUNCH: '午餐',
                DINNER: '晚餐',
                NIGHT: '夜宵'
            }
            let comment = this.data.detail
            let dates = comment.mealDate.split('-')
            comment.dateDes = dates[1] + '月' + dates[2] + '日 (' + weekend[comment.dayOfWeek] + ') ' + mealType[comment.mealType]
            this.setData({
                comment: comment
            })
        },
    },
    // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
    ready: function() {

    },
})