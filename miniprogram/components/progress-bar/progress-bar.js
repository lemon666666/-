// components/progress-bar/progress-bar.js
let movableAreaWidth = 0;
let movableViewWidth = 0;
const backAudioManager = wx.getBackgroundAudioManager();
let currentSec = -1; //当前秒数
let duration = 0; //当前歌曲总时长 秒
let isMoving = false //表示进度条是否拖拽 解决：当进度条拖动和updatetime冲突

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isSame: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00',
      movableDis: 0,
      progress: 0
    }
  },

  /**
   * 生命周期
   */
  lifetimes:{
    ready(){
      if(this.properties.isSame && this.data.showTime.totalTime == '00:00'){
        this._setTime()
      }
      this._getMovableDis();
      this._bindBGEvent();
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    onChange(e){
      console.log(e)
      if(e.detail.source == 'touch'){
        this.data.progress = e.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = e.detail.x
        isMoving = true
      }
    },
    onTouchEnd(){
      const currentTimeFmt = this._dateFormat(Math.floor(backAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.second}`
      })
      backAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis(){
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()  //获取宽度
      query.select('.movable-view').boundingClientRect()
      query.exec(rect => {
       // console.log(rect);
        movableAreaWidth = rect[0].width;
        movableViewWidth = rect[1].width;
        console.log(movableAreaWidth,movableViewWidth);
      })
    },
    _bindBGEvent(){
      backAudioManager.onPlay(()=>{
        console.log('onPlay')
        isMoving = false
        this.triggerEvent('musicPlay')
      });
      backAudioManager.onPause(()=>{
        console.log('onPause')
        this.triggerEvent('musicPause')
      });
      backAudioManager.onStop(()=>{
        console.log('onStop')
      });
      backAudioManager.onWaiting(()=>{
        console.log('onWaiting')
      });
      backAudioManager.onCanplay(()=>{
        console.log('onCanplay')
        console.log(backAudioManager.duration)  //获取歌曲播放总时长，刚开始可能会出现undefined，设置定时器1秒后再获取就可以
        if(typeof backAudioManager.duration !== 'undefined'){
          this._setTime()
        }else{
          setTimeout(() => {
            this._setTime()
          },1000)
        }
        });
      backAudioManager.onEnded(()=>{
        console.log('onEnded')
        //触发父组件事件
        this.triggerEvent('musicEnd')
      });
      backAudioManager.onTimeUpdate(()=>{
        console.log('onTimeUpdate')
        //判断是否拖拽
        if(!isMoving){
           //获取当前已经播放的时间
          const currentTime = backAudioManager.currentTime;
          const duration = backAudioManager.duration;
          const currentTimeFmt = this._dateFormat(currentTime)
          //防止1秒内多次setData时间
          if(currentTime.toString().split('.')[0] != currentSec){
            console.log(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.second}`
            })
            currentSec = currentTime.toString().split('.')[0]
            //联动歌词
            this.triggerEvent('timeUpdate',{
              currentTime
            })
          }
        }
      });
      backAudioManager.onError((errMsg)=>{
        console.log(errMsg)
      });
    },
    //播放总时长
    _setTime(){
     duration = backAudioManager.duration;
    //  console.log(duration)   //时间为秒数
      const durationFmt = this._dateFormat(duration);   //格式化时间
   //  console.log(durationFmt)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.second}`
      })
    },
    //格式化时间
    _dateFormat(sec){
      const min = Math.floor(sec / 60)
       sec = Math.floor(sec % 60)
      return {
        'min': this._parseZero(min),
        'second': this._parseZero(sec),
      }
    },
    //补零
    _parseZero(date){
      return date < 10 ? '0'+date : date;
    }
  }
})
