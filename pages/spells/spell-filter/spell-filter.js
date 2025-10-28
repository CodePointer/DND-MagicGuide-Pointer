// pages/spells/spell-filter/spell-filter.js
const chineseNumber = '〇一二三四五六七八九十'.split('');
const levelSpellOptions = new Array(10).fill(null).map((_, i) => ({
  label: i == 0 ? '戏法' : `${chineseNumber[i]}环`,
  value: `${i}`,
  disabled: false,
}));
const classSpellOptions = ['吟游诗人', '牧师', '德鲁伊', '圣武士', '游侠', '术士', '魔契师', '法师'].map((val, i) => ({
  label: val,
  value: val,
  disabled: false,
}));
const schoolSpellOptions = '防护,咒法,预言,惑控,塑能,幻术,死灵,变化'.split(',').map((val, i) => ({
  label: val,
  value: val,
  disabled: false,
}));
const specialSpellOptions = ['仅看专注', '仅看仪式'].map((val, i) => ({
  label: val,
  value: `${i}`,
  disabled: false,
}));
const sourceSpellOptions = ['PHB24', 'XGE', 'TCE', 'SCC', 'FTD'].map((val, i) => ({
  label: val,
  value: val,
  disabled: false,
}));

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    disabled: Boolean,
  },

  /**
   * 组件的初始数据
   */
  data: {
    searchValue: '',
    searchActionText: '',
    levelSpellOptions,
    classSpellOptions,
    schoolSpellOptions,
    sourceSpellOptions,
    specialSpellOptions,
    selectedFilters: {
      level: levelSpellOptions.map(opt => opt.value),
      class: classSpellOptions.map(opt => opt.value),
      school: schoolSpellOptions.map(opt => opt.value),
      source: sourceSpellOptions.map(opt => opt.value),
      special: []
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    triggerFilterChange() {
      const { searchValue, selectedFilters } = this.data;
      this.triggerEvent('filterChange', {
        searchValue,
        selectedFilters
      });
    },

    onSearchChange(e) {
      const value = e.detail.value;
      this.setData({ searchValue: value });
      // console.log(value);
      this.triggerFilterChange();
    },
    onFilterChange(e) {
      const key = e.currentTarget.dataset.key;
      const selected = e.detail.value || [];
      this.setData({
        [`selectedFilters.${key}`]: selected,
      });
    },
    onFilterConfirm(e) {
      this.triggerFilterChange();
    },
  },
})
