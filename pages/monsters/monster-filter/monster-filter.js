// pages/monsters/monster-filter/monster-filter.js
const sizeOptions = [
  '超微型', '微型', '小型', '中型', 
  '大型', '巨型', '超巨型'
].map((val) => ({
  label: val,
  value: val,
  disabled: false,
}));
const typeOptions = [
  '亡灵', '天族', '妖精', '巨人', 
  '异怪', '怪兽', '构装', '植物', 
  '泥怪', '类人', '邪魔', '野兽', 
  '龙类', '元素', '元素生物', '天族或邪魔'
].map((val) => ({
  label: val,
  value: val,
  disabled: false,
}));
const alignmentOptions = [
  '守序善良', '中立善良', '混乱善良', 
  '守序中立', '绝对中立', '混乱中立', 
  '守序邪恶', '中立邪恶', '混乱邪恶', 
  '中立', '无阵营'
].map((val) => ({
  label: val,
  value: val,
  disabled: false,
}));
const pbOptions = [
  '+2', '+3', '+4', '+5', 
  '+6', '+7', '+8', '+9'
].map((val) => ({
  label: val,
  value: val,
  disabled: false,
}));
const specialOptions = ['仅看集群'].map((val, i) => ({
  label: val,
  value: `${i}`,
  disabled: false,
}));
const crOptionsRange = new Array(25).fill(null).map((_, i) => ({
  label: `${i + 1}`,
  value: i
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
    crVisible: false,
    crText: '[0 - 30]',
    crData: [
      { label: '0', value: 0 },
      { label: '1/8', value: 0.125 },
      { label: '1/4', value: 0.25 },
      { label: '1/2', value: 0.5 },
      ...crOptionsRange,
      { label: '30', value: 30 }
    ],

    searchValue: '',
    searchActionText: '',
    sizeOptions,
    typeOptions,
    alignmentOptions,
    pbOptions,
    specialOptions,
    selectedFilters: {
      size: sizeOptions.map(opt => opt.value),
      type: typeOptions.map(opt => opt.value),
      alignment: alignmentOptions.map(opt => opt.value),
      pb: pbOptions.map(opt => opt.value),
      special: [],
      crValue: [0, 30]
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

    handleClick(e) {
      this.setData({
        crVisible: true
      });
    },
    onColumnChange(e) {
      const { label, value } = e.detail;
      if (value[0] > value[1]) {
        this.setData({
          crText: `[${label[1]} - ${label[0]}]`
        });
      } else {
        this.setData({
          crText: `[${label[0]} - ${label[1]}]`
        });
      }
    },
    onPickerChange(e) {
      const { label, value } = e.detail;
      if (value[0] > value[1]) {
        this.setData({
          selectedFilters: {
            ...this.data.selectedFilters,
            crValue: [value[1], value[0]]
          },
          crText: `[${label[1]} - ${label[0]}]`
        });
      } else {
        this.setData({
          selectedFilters: {
            ...this.data.selectedFilters,
            crValue: [value[0], value[1]]
          },
          crText: `[${label[0]} - ${label[1]}]`
        });
      }
    },
    onPickerCancel(e) {
      const crValue = this.data.selectedFilters.crValue;
      this.setData({
        crText: `[${crValue[0]} - ${crValue[1]}]`
      });
    }
  }
})