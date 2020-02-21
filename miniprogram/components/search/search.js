// components/search/search.js
let keyword = ''
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder:{
      type: String,
      value: "请输入..."
    }
  },

  //父组件传入图标,父组件不可传入样式
  externalClasses:[
    'iconfont',
    'icon-sousuo'
  ],
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onInput(e){
      keyword = e.detail.value
    },
    onSearch(){
      this.triggerEvent('search', {
        keyword
      })
    }
  }
})
