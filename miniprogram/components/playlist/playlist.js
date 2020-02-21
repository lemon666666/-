// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //接收父组件传过来的数据
    playlist: {
      type: Object
    }
  },

  //监听音乐播放数量
  observers:{
    //取到对象的指定属性
    ['playlist.playCount'](count){
     // console.log(count)    打印播放数量
     this.setData({
       _count : this._tranNumber(count, 2)
     })
    }
  },
  

  /**
   * 组件的初始数据
   */
  data: {
    //播放数量
    _count:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //跳转到歌單列表详情页
    JumpMusicList(){
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlist.id}`
      });
    },
    //歌单显示小数点
    _tranNumber(num, point){
      //舍去小数点取前面
      let numStr = num.toString().split('.')[0];
      //数字万不操作
      if(numStr.length < 6){
        return numStr
      } else if (numStr.length >= 6 && numStr.length <= 8){    //大于万小于千万
        let decimal = numStr.substring(numStr.length - 4, numStr.length - 4 + point)
        return parseFloat(parseInt(num / 10000) + '.' + decimal) + '万'
      } else if(numStr.length > 8){
        let decimal = numStr.substring(numStr.length - 8, numStr.length - 8 + point)
        return parseFloat(parseInt(num / 100000000) + '.' + decimal) + '亿'
      }
    }
  }
})
