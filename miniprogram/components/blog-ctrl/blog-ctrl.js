// components/blog-ctrl/blog-ctrl.js
let userInfo = {}
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    blogId: String,
    blog: Object
  },
  //引入图标
  externalClasses:[
    'iconfont',
    'icon-pinglun',
    'icon-fenxiang'
  ],
  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    modalShow: false,
    content: ''
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //评论
    onComment(){
      //判断用户是否授权
      wx.getSetting({
        success: (res)=>{
          if(res.authSetting['scope.userInfo']){
            wx.getUserInfo({
              success: (res)=>{
                userInfo = res.userInfo
                //显示评论弹出框
                this.setData({
                  modalShow: true
                })
              }
            });
          }else{
            this.setData({
              isShow: true
            })
          }
        }
      });
    },

    //授权成功
    onloginSuccess(e){
      //授权成功赋予登录信息
      userInfo = e.detail
      this.setData({
        isShow: false
      }, () => {
        this.setData({
          modalShow: true
        })
      })
    },
    onloginFail(){
      wx.showToast({
        title: '授权用户才能评价',
        icon: 'none'
      });
    },

    //表单评论
    onSend(e){
      //获取模板id
      let formId = e.detail.formId
      //插入数据库
      let content = e.detail.value.content
      if(content.trim() == ''){
        wx.showToast({
          title: '评论内容不能为空',
          icon: 'none'
        });
        return 
      }
      wx.showLoading({
        title: '评价中...',
        mask: true
      });
      db.collection('blog-comment').add({
        data: {
          content,
          createTime: db.serverDate(),
          blogId: this.properties.blogId,
          nickName: userInfo.nickName,
          avatarUrl: userInfo.avatarUrl
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '评论成功',
          icon: 'none'
        });
        this.setData({
          modalShow: false,
          content: ''
        })
        //触发父元素事件刷新评论
        this.triggerEvent('refreshCommentList')
        // wx.getSetting({
        //   withSubscriptions: true,
        //   success (res) {
        //     console.log(res)
        //   }
        // })
        //推送模板消息
        wx.cloud.callFunction({
          name: 'sendMsg',
          data: {
            content,
            blogId: this.properties.blogId
          }
        }).then(res => {
          console.log(res)
        })

      })
    }

  }
})
