// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowLyric:{
      type: Boolean,
      value:false
    },
    lyric: String
  },

  //监听
  observers: {
    lyric(lrc){
      if(lrc == '暂无歌词'){
        this.setData({
          lrcList: [
            {
              lrc,
              time:0
            }
          ],
          nowLyricIndex: -1
        })
      }else{
    //  console.log(lrc)
      this._parseLyric(lrc)
      }
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0, //选中的歌词索引
    scrollTop: 0
  },

  /**
   * 生命周期
   */
  lifetimes:{
    ready(){
      //750rpx  px与rpx换算
      wx.getSystemInfo({
        success: (res)=>{
          console.log(res)
          //算出1rpx大小
         lyricHeight = res.screenWidth / 750 * 64

        }
      });
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //解析歌词
    _parseLyric(sLyric){
      let line = sLyric.split('\n')
      console.log(line)
      let _lyric = []
      line.forEach(el => {
        let time = el.match(/\[(\d{2,}):(\d{2,})(?:\.(\d{2,3}))?]/g)
        if(time!=null){
          let lrc = el.split(time)[1]
          let timeReg = time[0].match(/(\d{2,}):(\d{2,})(?:\.(\d{2,3}))?/)
          //把时间转换成秒
          let time2Seconds = parseInt(timeReg[1] * 60 + timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lyric.push({
            time: time2Seconds,
            lrc
          })
        }
      })

      this.setData({
        lrcList: _lyric
      })
    },

    //设置歌词高亮显示
    update(currentTime){
      console.log(currentTime)
      let lrcList = this.data.lrcList
      if(lrcList.length == 0){
        return 
      }
      if(currentTime > lrcList[lrcList.length-1].time){
        if(this.data.nowLyricIndex != -1){
          this.setData({
            nowLyricIndex: -1,
            scrollTop: lrcList.length * lyricHeight
          })
        }
      }
      for (let i = 0; i < lrcList.length; i++) {
          if(currentTime <= lrcList[i].time){
            this.setData({
              nowLyricIndex: i - 1,
              scrollTop: (i - 1) * lyricHeight
            })
            break
          }

      }
    }
  }
})
