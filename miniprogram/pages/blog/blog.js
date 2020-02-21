// pages/blog/blog.js
let keyword = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    blogList: []
  },
  //发布
  onPublic(){
    //判断用户是否授权
    wx.getSetting({
      success: (res)=>{
        console.log(res)
        //如果授权过
        if(res.authSetting['scope.userInfo']){
          wx.getUserInfo({
            success: (res)=>{
              //获取授权过的用户信息
              wx.navigateTo({
                url: `../blog-edit/blog-edit?nickName=${res.userInfo.nickName}&avatarUrl=${res.userInfo.avatarUrl}`
              });
            }
          });
        } else {
          //授权过的隐藏弹出框
          this.setData({
            isShow: true
          })
        }
      }
    });
  },
  //成功授权
  loginSuccess(e){
    console.log(e)
    const userInfo = e.detail
    //将授权信息传到编辑页面
    wx.navigateTo({
      url: `../blog-edit/blog-edit?nickName=${userInfo.nickName}&avatarUrl=${userInfo.avatarUrl}`
    });
  },
  //失败授权
  loginFail(){
    wx.showToast({
      title: '授权用户才能发布',
      icon: "none"
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._loadBlogList()
  },
  _loadBlogList(start = 0){
    wx.showLoading({
      title: '拼命加载中...'
    });
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        keyword,
        $url: 'list',
        start: start,
        count: 10
      }
    }).then(res => {
      this.setData({
        blogList: this.data.blogList.concat(res.result)
      })
      wx.hideLoading();
      wx.stopPullDownRefresh()
    })
  },
  //博客列表跳转
  goComment(e){
    wx.navigateTo({
      url: '../../pages/blog-comment/blog-comment?blogid=' + e.target.dataset.blogid
    })
  },
  //子组件搜索
  onSearch(e){
 //   console.log(e.detail.keyword)
    this.setData({
      blogList : []
    })
    keyword = e.detail.keyword
    this._loadBlogList(0)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      blogList: []
    })
    this._loadBlogList(0)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._loadBlogList(this.data.blogList.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    console.log(e)
    let blog = e.target.dataset.blog
    return {
      title: blog.content,
      path: `/pages/blog-comment/blog-comment?blogId=${blog._id}`,
      // imageUrl: ''
    }
  }
})