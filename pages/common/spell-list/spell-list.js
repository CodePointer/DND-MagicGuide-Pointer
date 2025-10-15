// pages/spells/spell-list/spell-list.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {
    spellTotalNumber: Number,
    spells: Array
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
    onSpellCellClick(e) {
      const { spellId } = e.detail;
      // console.log('Cell clicked:', spellId);
      this.triggerEvent('spellCellClick', {
        spellId: spellId,
      });
    },
    onMarkSwitchChange(e) {
      const { spellId, marked } = e.detail;
      this.triggerEvent('spellMarkChange', {
        spellId: spellId,
        marked: marked
      });
    },
    onLoadMoreButtonClick(e) {
      this.triggerEvent('loadMoreSpell');
    }
  }
})