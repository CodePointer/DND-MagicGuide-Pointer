// pages/common/monster-card/monster-card.js
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
    title: '怪物名称',
    description: '',
    proficienciesLevel: ''
  },

  observers: {
    item(monster) {
      this.setData({
        procMonster: {
          id: monster.id || '[id]',
          monsterId: monster.monsterId || '[monsterId]',
          chineseName: monster.chineseName || '[怪物名称]',
          englishName: monster.englishName || '[Name]',
          type: monster.type || '[类型]',
          alignment: monster.alignment || '[阵营]',
          challengeRating: monster.challengeRating || 'xx',
          proficiencies: monster.proficiencies || '+0',
          marked: monster.marked || false,
          ...monster
        }
      });
      this.setData({
        title: `${monster.chineseName} - ${monster.englishName}`,
        description: `${monster.type} | ${monster.alignment} | CR ${monster.challengeRating}`,
        proficienciesLevel: monster.proficiencies[1]
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleClick() {
      this.triggerEvent('itemCellClick', {
        itemId: this.data.procMonster.monsterId
      });
    },
    stopTap() {
    },
    handleSwitchChange(e) {
      const newValue = e.detail.value
      this.triggerEvent('itemSwitchChange', {
        itemId: this.data.procMonster.monsterId,
        marked: newValue
      });
    }
  }
})