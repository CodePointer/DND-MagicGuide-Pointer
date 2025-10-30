// pages/common/spell-card/spell-card.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    item: {
      type: Object,
      value: {}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    title: '法术名称',
    description: ''
  },

  observers: {
    item(spell) {
      this.setData({
        procSpell: {
          id: spell.id || '[id]',
          spellId: spell.spellId || '[spellId]',
          chineseName: spell.chineseName || '[法术名称]',
          englishName: spell.englishName || '[Name]',
          level: spell.level || 0,
          concentration: spell.concentration || false,
          ritual: spell.ritual || false,
          marked: spell.marked || false,
          ...spell
        }
      });
      this.setData({
        title: `${spell.chineseName} - ${spell.englishName}`,
        description: this.computeDescription(spell.concentration, spell.ritual)
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
      this.triggerEvent('itemCellClick', {
        itemId: this.data.procSpell.spellId
      });
    },
    stopTap() {
    },
    handleSwitchChange(e) {
      const newValue = e.detail.value
      this.triggerEvent('itemSwitchChange', {
        itemId: this.data.procSpell.spellId,
        marked: newValue
      });
    }
  }
})