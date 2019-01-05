import { base } from '../../comm/public/base' 
class myPublic extends base{
  /* 判断是否登录，登录状态下的userStatus状态 */
  //用户状态，(NO_CHECK/NORMAL/CHECK_NO_PASS)（待审核、审核通过、审核未通过）
  getUserStatus(){
    let tmp_userInfo = wx.getStorageSync('userInfo')
    let msg = ''
    let code = 100
    //console.log('xxxx',tmp_userInfo)
    if(tmp_userInfo==''){
/*       msg = '未登录 请先登录'
      code = 1
      wx.showToast({
        title: msg,
        icon: 'none',
        duration: 5000
      }) */
    }else{
      if(tmp_userInfo.userStatus=='NO_CHECK'){
        msg = '待审核中 请先审核通过'
        code = 2
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 5000
        })
      }else if(tmp_userInfo.userStatus=='CHECK_NO_PASS'){
        msg = '审核未通过 请先审核通过'
        code = 3
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 5000
        })
      }else if(tmp_userInfo.userStatus=='NORMAL'){
        msg = '审核通过'
        code = 0
      }else{
        msg = '无此状态..'
        code = 100
      }
    }
    return code
  }
}
export { myPublic }