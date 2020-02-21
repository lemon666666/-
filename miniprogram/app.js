//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        //云开发的环境
        env: 'test-fqoui',
        traceUser: true,
      })
    }
    this.getOpenId()
    this.globalData = {
      playingMusicId: -1,
      openid: -1
    }
  },

  //设置正在播放的音乐
  setPlayMusicId(musicId){
    this.globalData.playingMusicId = musicId
  },
  getPlayingMusicId(){
    return this.globalData.playingMusicId
  },
  //设置最近播放缓存
  getOpenId(){
    wx.cloud.callFunction({
      name: "login",
    }).then(res => {
      const openid = res.result.openid
      this.globalData.openid = openid
      if(wx.getStorageSync(openid) == ''){
        wx.setStorageSync(openid, []);
      }
    })
  }
})
