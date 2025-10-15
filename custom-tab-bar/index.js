// pages/common/tabbar/tabbar.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
  },

  /**
   * 组件的初始数据
   */
  data: {
    value: 'spells',
    list: [
      { value: 'spells', label: '法术列表', icon: 'book' },
      { value: 'mine', label: '我的收藏', icon: 'bookmark' },
    ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(e) {
      const to_value = e.detail.value;
      if (to_value == this.data.value) return;
      wx.switchTab({
        url: `/pages/${to_value}/${to_value}`,
      });
      this.setData({
        value: to_value,
      });
    },
  },
});