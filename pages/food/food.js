import { base } from '../../comm/public/request'
let requestModel = new base()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1, // 设置加载的第几次，默认是第一次
        limit: 10, // 每页条数
        hasMoreDataFlag: true, //是否还有更多数据  默认还有
        itemStatusActiveFlag: true,
        //
        windowHeight: 0,
        scrollTop: 0,
        //
        foodCode: undefined,
        foodInfo: {},
        btnFlag: 'all',
        ratingsInfoList: [],
        ratingsListNoResult: false,
        ratingsInfoListAll: [],
        hasContentFlag: false,
        hasImgFlag: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let { mealDate, mealType, foodCode } = options
        this.setData({
            foodCode: foodCode
        })
        let url = '/food/getFoodDetail?userCode=' + wx.getStorageSync('userCode') + '&mealDate=' + mealDate + '&mealType=' + mealType.toUpperCase() + '&foodCode=' + foodCode
        let param = {
            url
        }
        requestModel.request(param, data => {
            this.setData({
                foodInfo: data
            })
        })

        this.initRatings()
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },
    /* 页面隐藏后回收定时器指针 */
    onHide: function() {

    },
    // 获取高度等信息
    initRatings: function() {
        let _this = this
        wx.getSystemInfo({
            success: function(res) {
                _this.setData({
                    windowHeight: res.windowHeight
                })
            }
        })
        const query = wx.createSelectorQuery()
        query.select('.c_scrollPosition_forCalculate').boundingClientRect()
        query.selectViewport().scrollOffset()
        query.exec(function(res) {
            _this.setData({
                scrollTop: res[0].bottom // #the-id节点的上边界坐标
            })
        })
    },
    /* 获取评价列表 */
    getRatings: function() {
        let _this = this
        this.setData({
                loadingData: true
            })
            //获取后台数据
        let page = _this.data.page
        let limit = _this.data.limit

        let url = '/food/getFoodEvaluate?userCode=' + wx.getStorageSync('userCode') + '&foodCode=' + _this.data.foodCode + '&page=' + page + '&limit=' + limit
            // let url = '/food/getFoodEvaluate?userCode=' + wx.getStorageSync('userCode') + '&foodCode=FOOD532153295062564864&page=' + page + '&limit=' + limit
        let param = { url }
        requestModel.request(param, (data) => {

            let { list, amount } = data
            // 大于amount，说明已经加载完了
            if (page * limit >= amount) {
                _this.setData({
                    hasMoreDataFlag: false
                })
            } else {
                _this.setData({
                    hasMoreDataFlag: true,
                    page: page + 1
                })
            }
            _this.setData({
                ratingsInfoList: _this.data.ratingsInfoList.concat(list), //concat是拆开数组参数，一个元素一个元素地加进去
                loadingData: false
            })

        })
    },

    /* 手动点击触发下一页 */
    gotoNextPage: function() {
        if (this.data.hasMoreDataFlag) {
            this.getRatings()
        }
    },
    /* 切换标题 */
    changeItemStatusActiveFlag: function(e) {
        let flag = e.currentTarget.dataset.flag
        if (flag == 'detail') {
            this.setData({
                itemStatusActiveFlag: true
            })
        } else if (flag == 'ratings') {
            this.setData({
                itemStatusActiveFlag: false,
                page: 1
            })
            this.getRatings() //获取该food的评论列表
        }

    },

    /* 切换评价标签 */
    changeBtnActiveFlag: function(e) {
        if (e.currentTarget.dataset.flag == 'all') {
            this.data.btnFlag = 'all'
            this.setData({
                btnFlag: 'all'
            })
        } else {
            this.data.btnFlag = 'fivestar'
            this.setData({
                btnFlag: 'fivestar'
            })
        }
    },
    /* 切换 是否内容 标签 */
    changeHasContentFlag: function() {
        this.setData({
            hasContentFlag: !this.data.hasContentFlag
        })
    },
    /* 切换 是否有图 标签 */
    changeHasImgFlag: function() {
        this.setData({
            hasImgFlag: !this.data.hasImgFlag
        })
    }
})