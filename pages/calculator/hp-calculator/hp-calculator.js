// pages/calculator/hp-calculator/hp-calculator.js
const levelData = new Array(20).fill(null).map((_, i) => ({
  label: `Lv ${i + 1}`,
  value: i + 1
}));
const hpDiceData = [6, 8, 10, 12].map((val) => ({
  label: `D${val}`,
  value: val
}));
const constitutionData = new Array(21).fill(null).map((_, i) => ({
  label: `体质 ${i}`,
  value: i
}));
const defaultData = [{ label: '无', value: 0 }];


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
    pickerVisible: false,
    pickerTitle: '',
    pickerData: defaultData,
    pickerDataKey: '',

    selectedLevel: null,
    selectedHpDice: null,
    selectedConstitution: null,
    reportText: '',
    detailTexts: [],
    detailTextsTitle: ['等级', '生命骰点数', '体质加值', '本级生命值'],
  },

  observers: {
    'selectedLevel, selectedHpDice, selectedConstitution'(level, hpDice, constitution) {
      if (level && hpDice && constitution !== null) {
        const levelValue = level.value;
        const hpDiceValue = hpDice.value;
        const constitutionValue = Math.floor((constitution.value - 10) / 2);

        let totalHp = 0;
        const detailTexts = [];
        for (let i = 1; i <= levelValue; i++) {
          const hpFromDice = i > 1 ? Math.ceil((hpDiceValue + 1) / 2) : hpDiceValue;
          let hpForThisLevel = hpFromDice + constitutionValue;
          totalHp += hpForThisLevel;
          detailTexts.push({
            level: i,
            hpFromDice: hpFromDice,
            constitution: constitutionValue,
            hpForThisLevel: hpForThisLevel,
          });
        }
        this.setData({
          reportText: `${totalHp}`,
          detailTexts: detailTexts,
        });
      } else {
        this.setData({
          reportText: '',
          detailTexts: [],
        });
        return;
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onLevelButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择等级',
        pickerData: levelData,
        pickerDataKey: 'level',
      });
    },
    onHpDiceButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择生命骰',
        pickerData: hpDiceData,
        pickerDataKey: 'hpDice',
      });
    },
    onConstitutionButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择体质',
        pickerData: constitutionData,
        pickerDataKey: 'constitution',
      });
    },
    onPickerCancel(e) {
      this.setData({
        pickerVisible: false,
      });
    },
    onPickerConfirm(e) {
      const dataKey = e.currentTarget.dataset.key;
      const selectedItem = {
        value: e.detail.value[0],
        label: e.detail.label[0]
      };
      if (dataKey === 'level') {
        this.setData({
          selectedLevel: selectedItem,
        });
      } else if (dataKey === 'hpDice') {
        this.setData({
          selectedHpDice: selectedItem,
        });
      } else if (dataKey === 'constitution') {
        this.setData({
          selectedConstitution: selectedItem,
        });
      }
      this.setData({
        pickerVisible: false,
      });
    }
  }
})