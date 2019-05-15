// 保存接口的key:value
// 用于接口固定的
let urlMaps = {
    //首页
    //获取首页图片
    //返回值 alertImage:新人大礼， bannerImage:开始点餐上的轮播图 ，centerImage，footImage
    getHomeImage: '/home/getHomeImage?userCode=',
    // 获取公告
    getHomeNotice: '/home/getHomeNotice?userCode=',

    //预查询今天/明天可点情况
    getPreMealDateAndType: '/meal/getPreMealDateAndType?userCode=',

    //获取企业列表
    getOrganizeListByLocation: '/organize/getOrganizeListByLocation?userCode=USER557617089184137216&longitude=120.640714&latitude=31.232887&organizeName=星点点&distance=5000',
    //绑定企业
    bindOrganize: '/user/bindOrganize',
    suggestion: '/help/suggestion', //用户吐槽提交
    orgAdminChange: '/user/orgAdminChange', //企业管理员修改当前是普通用户还是管理员用户
}