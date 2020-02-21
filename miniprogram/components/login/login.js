// components/login/login.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取用户授权信息
    onUserInfo(e){
      const userInfo = e.detail.userInfo
      //允许授权
      if(userInfo){
        //隐藏弹出框
        this.setData({
          isShow: false
        })
        //传递给父组件事件
        this.triggerEvent('loginSuccess', userInfo)
      }else{
        this.triggerEvent('loginFail')
      }
    }
  }
})
