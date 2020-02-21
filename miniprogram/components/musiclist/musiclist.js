// components/musiclist/musiclist.js
const app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    musiclist: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    playingId: -1
  },

  //生命周期
  pageLifetimes: {
    show(){
      this.setData({
        playingId: parseInt(app.getPlayingMusicId())
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //单条歌曲选择
    onSelect(e){
   //  console.log(e.currentTarget.dataset.musicid)   //获取data-属性
      const musicid = e.currentTarget.dataset.musicid
      this.setData({
        playingId: musicid
      })
      wx.navigateTo({
        url: `../../pages/player/player?musicId=${musicid}&index=${e.currentTarget.dataset.index}`
      });
    }
  }
})
