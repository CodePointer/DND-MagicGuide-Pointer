const chineseNumber = '〇一二三四五六七八九十'.split('');
const levelSpellOptions = new Array(10).fill(null).map((_, i) => ({
  label: i == 0 ? '戏法' : `${chineseNumber[i]}环`,
  value: `option_${i}`,
  disabled: false,
}));
const classSpellOptions = ['吟游诗人', '牧师', '德鲁伊', '圣武士', '游侠', '术士', '魔契师', '法师'].map((val, i) => ({
  label: val,
  value: `option_${i}`,
  disabled: false,
}));
const schoolSpellOptions = '防护,咒法,预言,惑控,塑能,幻术,死灵,变化'.split(',').map((val, i) => ({
  label: val,
  value: `option_${i}`,
  disabled: false,
}));
const specialSpellOptions = ['仅看专注', '仅看仪式'].map((val, i) => ({
  label: val,
  value: `option_${i}`,
  disabled: false,
}));
const sourceSpellOptions = ['PHB24', 'XGE', 'TCE', 'FTD', 'SCC'].map((val, i) => ({
  label: val,
  value: `option_${i}`,
  disabled: false,
}));


Page({
  data: {
    searchValue: '',
    searchActionText: '',
    levelSpellOptions,
    classSpellOptions,
    schoolSpellOptions,
    specialSpellOptions,
    sourceSpellOptions
  },
  methods: {
    changeHandle(e) {
      const { value } = e.detail;
      this.setData({ 
        value, 
      });
    },

    focusHandle() {
      this.setData({
        searchActionText: '取消',
      });
    },

    blurHandle() {
      this.setData({
        searchActionText: '',
      });
    },

    actionHandle() {
      this.setData({
        searchValue: '',
        searchActionText: '',
      });
    },
  },
});