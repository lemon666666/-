// pages/blog-edit/blog-edit.js
//输入文字最大个数
const MAX_WORDS_NUM = 140
//图片限制
const MAX_IMG_NUM = 9
//初始化数据库
const db = wx.cloud.database()
//内容
let content = ''
let userInfo = {}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //输入文字限制
    wordsNum:0,
    footerBottom:0,
    images: [],
    selectPhoto: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    userInfo = options
  },
  //输入框
  onInput(e){
    console.log(e)
    //获取输入内容的长度
    let wordsNum = e.detail.cursor
    if(wordsNum >= MAX_WORDS_NUM){
      wordsNum = `最大字数为${MAX_WORDS_NUM}`
    }
    this.setData({
      wordsNum
    })
    content = e.detail.value
  },
  //获取焦点
  onFocus(e){
    //获取键盘高度，模拟器获取的高度为0
    this.setData({
      footerBottom: e.detail.height
    })
  },
  //失去焦点
  onBlur(e){
    this.setData({
      footerBottom: 0
    })
  },

  //选择图片
  onChooseImages(){
    let max = MAX_IMG_NUM - this.data.images.length
    wx.chooseImage({
      count: max,
      sizeType: ['original','compressed'],
      sourceType: ['album','camera'],
      success: (res)=>{
        console.log(res)
        this.setData({
          images: this.data.images.concat(res.tempFilePaths)
        })
        //判断新添加图片的总数
        max = MAX_IMG_NUM - this.data.images.length
        this.setData({
          selectPhoto: max <= 0 ? false : true
        })
      }
    });
  },
  //删除图片
  onDelImage(e){
    //获取当前图片索引
    this.data.images.splice(e.target.dataset.index, 1)
    this.setData({
      images: this.data.images
    })
    if(this.data.images.length == MAX_IMG_NUM - 1){
      this.setData({
        selectPhoto: true
      })
    }
  },
  //预览图片
  onScanImage(e){
    wx.previewImage({
      current: e.target.dataset.imgsrc,
      urls: this.data.images
    });
  },

  //发布  数据-》云数据库  1.内容 图片fieldID openid 昵称 头像  2.图片->云存储
  send(){

    if(content.trim() === ''){
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return 
    }
    wx.showLoading({
      title: '发布中...',
      mask: true
    });
    let promiseArr = []
    let fileIds = []
    //1.先把图片存储到云存储  云存储只支持单张上传  需要循环上传
    for (let i = 0; i < this.data.images.length; i++) {
      let p = new Promise((resolve, reject) => {
          let item = this.data.images[i]
          //取到图片后缀
          let suffix = /\.\w+$/.exec(item)[0]
          wx.cloud.uploadFile({
            cloudPath: 'blog/' + Date.now() + '-' + Math.random() * 1000000 + suffix, // 上传至云端的路径
            filePath: item, // 小程序临时文件路径
            success: (res) => {
              fileIds = fileIds.concat(res.fileID)
              resolve(res.fileID)
            },
            fail: (err) => {
              reject(err)
            }
          }) 
        })
        promiseArr.push(p)
    }
    //等以上数据执行完后，将数据存入到云数据库中
    Promise.all(promiseArr).then(res => {
      //插入内容  图片id 用户信息 服务端时间
      db.collection('blog').add({
        data: {
          content,
          img: fileIds,
          ...userInfo,
          createTime: db.serverDate()
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: '发布成功'
      })
      //返回blog页面，并且刷新
      wx.navigateBack();
      //取到界面
      const curPages =  getCurrentPages();   //返回当前页面和上一级页面  [0,1]
      const prePage = curPages[curPages.length - 2];   //取到上一级页面
      prePage.onPullDownRefresh()
    })
  }).catch(err => {
    wx.hideLoading();
    wx.showToast({
      title: '发布失败',
      icon: 'none'
    });
  })
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