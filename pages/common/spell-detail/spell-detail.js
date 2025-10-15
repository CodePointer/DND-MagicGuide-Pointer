// pages/common/spell-detail.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    spellId: String,
    chineseName: String,
    englishName: String,
    level: String,
    school: String,
    concentration: Boolean,
    ritual: Boolean,
    castingTime: String,
    range: String,
    duration: String,
    components: Array,
    materials: String,
    description: String,
    classes: Array,
    source: String
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
    'concentration, ritual': function(concentration, ritual) {
      this.setData({
        keywordDesc: this.updateKeywordDesc(concentration, ritual)
      });
    },
    'components, materials': function(components, materials) {
      this.setData({
        componentsDesc: this.updateComponentsDesc(components, materials)
      });
    },
    'classes': function(classes) {
      this.setData({
        classDesc: classes.join('/')
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