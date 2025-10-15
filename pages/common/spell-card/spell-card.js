// pages/common/spell-card/spell-card.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    spellId: String,
    chineseName: String,
    englishName: String,
    level: String,
    concentration: Boolean,
    ritual: Boolean,
    marked: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: '法术名称',
    description: ''
  },

  observers: {
    'chineseName, englishName': function(chineseName, englishName) {
      this.setData({
        title: `${chineseName} - ${englishName}`
      })
    },
    'concentration, ritual': function(concentration, ritual) {
      this.setData({
        description: this.computeDescription(concentration, ritual)
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    computeDescription(concentration, ritual) {
      const parts = []
      if (concentration) parts.push('专注');
      if (ritual) parts.push('仪式');
      return parts.join(' | ');
    },
    handleClick() {
      this.triggerEvent('spellCellClick', {
        spellId: this.data.spellId
      });
    },
    stopTap() {
    },
    handleSwitchChange(e) {
      const newValue = e.detail.value
      this.triggerEvent('markedSwitchChange', {
        spellId: this.data.spellId,
        marked: newValue
      });
    }
  }
})