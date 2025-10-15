// pages/common/spell-popup/spell-popup.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    spell: Object,
    visible: {
      type: Boolean,
      value: false
    }
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
    onVisibleChange(e) {
      this.triggerEvent('close');
    },
  }
})