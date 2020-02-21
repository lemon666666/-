// pages/player/player.js

let musiclist = [];
//正在播放的歌曲index
let nowPlayingIndex = 0;
//获取全局唯一背景音频管理器 
const backAudioManager = wx.getBackgroundAudioManager();

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false, //false表示不播放
    isShowLyric: false, //是否显示歌词
    lyric: '', //歌词
    isSame: false //表示是否为同一首歌
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    nowPlayingIndex = options.index;
    //从缓存中获取歌曲信息
    musiclist = wx.getStorageSync('musiclist');
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId){
    if(musicId == app.getPlayingMusicId()){
        this.setData({
          isSame: true
        })
    }else{
      this.setData({
        isSame: false
      })
    }
    if(!this.data.isSame){
      //先停止当前歌曲，再加载下一首
      backAudioManager.stop();
    }
    //通过索引获取当前歌曲信息
    let music = musiclist[nowPlayingIndex];
    wx.setNavigationBarTitle({
      title: music.name
    });
    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })
    //设置全局当前正在播放的id
    app.setPlayMusicId(musicId)

    wx.showLoading({
      title: '歌曲加载中...',
      mask: true
    });
    //获取播放歌曲url
    wx.cloud.callFunction({
      name:'music',
      data:{
        musicId,
        $url:'musicUrl'
      }
    }).then(res => {
      console.log(JSON.parse(res.result))
      let result = JSON.parse(res.result)
      if(result.data[0].url == null){
        wx.showToast({
          title: '无权限播放'
        });
        return 
      }
      if(!this.data.isSame){
        backAudioManager.src = result.data[0].url;
        backAudioManager.title = music.name;

        //保存播放历史
        this.savePlayHistory()
      }

      this.setData({
        isPlaying: true
      })

      wx.hideLoading();
      //加载歌词
      wx.cloud.callFunction({
        name:'music',
        data:{
          $url:'lyric',
          musicId,
        }
      }).then(res => {
        console.log(res)
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if(lrc){
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },

  //播放按钮
  togglePlaying(){
    //正在播放
    if(this.data.isPlaying){
      backAudioManager.pause()
    }else{
      backAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  //上一首
  onPrev(){
    nowPlayingIndex--;
    if(nowPlayingIndex < 0){
      nowPlayingIndex = musiclist.length-1;  //等于最后一首歌曲
    }
    //播放歌曲
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  //下一首
  onNext(){
    nowPlayingIndex++;
    if(nowPlayingIndex === musiclist.length){
      nowPlayingIndex = 0   //等于第一首歌曲
    }
     //播放歌曲
     this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },
  //显示歌词
  onShowLyric(){
    this.setData({
      isShowLyric: !this.data.isShowLyric
    })
  },

  timeUpdate(e){
    this.selectComponent('.lyric').update(e.detail.currentTime)
  },

  onPlay(){
    this.setData({
      isPlaying: true
    })
  },
  onPause(){
    this.setData({
      isPlaying: false
    })
  },
  //保存播放历史
  savePlayHistory(){
    //当前正在播放的歌曲
    const music = musiclist[nowPlayingIndex]
    const openid = app.globalData.openid
    const history = wx.getStorageSync(openid);
    let beHave = false;
    for (let i = 0; i < history.length; i++) {
      if(history[i].id == music.id){
        beHave = true
        break;
      }
    }
    if(!beHave){
      history.unshift(music)
      wx.setStorage({
        key: openid,
        data: history
      });
    }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})