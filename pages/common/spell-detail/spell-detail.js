// pages/common/spell-detail.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    spell: {
      type: Object,
      value: {}
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    keywordDesc: '',
    componentsDesc: '',
    classDesc: ''
  },

  observers: {
    spell(spell) {
      this.setData({
        procSpell: {
          spellId: spell.spellId || '[spellId]',
          chineseName: spell.chineseName || '[法术名称]',
          englishName: spell.englishName || '[Name]',
          level: spell.level || '[level]',
          school: spell.school || '[school]',
          concentration: spell.concentration || false,
          ritual: spell.ritual || false,
          castingTime: spell.castingTime || '[casting time]',
          range: spell.range || '[range]',
          duration: spell.duration || '[duration]',
          components: spell.components || [],
          materials: spell.materials || '',
          description: spell.description || '[description]',
          classes: spell.classes || [],
          source: spell.source || '[source]',

          keywordDesc: this.updateKeywordDesc(spell.concentration, spell.ritual),
          componentsDesc: this.updateComponentsDesc(spell.components, spell.materials),
          classDesc: (spell.classes || []).join('/'),

          ...spell
        }
      });
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateKeywordDesc(concentration, ritual) {
      const parts = [];
      if (concentration) parts.push('专注');
      if (ritual) parts.push('仪式');
      return parts.join(' | ');
    },
    updateComponentsDesc(components, materials) {
      const parts = [components.join(' | ')];
      if (materials) parts.push(`(${materials})`);
      return parts.join(' ');
    }
  }
});