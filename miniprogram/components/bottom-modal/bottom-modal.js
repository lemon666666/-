// components/bottom-modal/bottom-modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: Boolean
  },

  options: {
    //子组件样式分享,可以得到外部样式
    styleIsolation: 'apply-shared',
    //开启多个插槽功能
    multipleSlots: true  
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    onClose(){
      this.setData({
        isShow: false
      })
    }
  }
})
