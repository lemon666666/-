// pages/playlist/playlist.js
const MAX_LIMIT = 15
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperUrl:[],
    playlist:[]
  },
  //获取轮播图
  _getSwiper(){
    db.collection('swiper').get().then(res => {
      this.setData({
        swiperUrl: res.data
      })
    })
  },
   //请求歌曲列表云函数
  _getplaylist(){
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    //调用云函数
    wx.cloud.callFunction({
      name:'music',
      data:{
        start: this.data.playlist.length,
        count: MAX_LIMIT,
        $url: 'playlist'
      }
    }).then(res => {
      console.log(res)
      this.setData({
        playlist: this.data.playlist.concat(res.result.data)
      })
    })
   wx.stopPullDownRefresh()
    wx.hideLoading();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this._getplaylist()
    this._getSwiper()
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
      playlist:[]
    })
    this._getplaylist()
    this._getSwiper()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this._getplaylist()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})