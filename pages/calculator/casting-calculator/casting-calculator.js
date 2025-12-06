// pages/calculator/casting-calculator/casting-calculator.js
const levelData = new Array(20).fill(null).map((_, i) => ({
  label: `Lv ${i + 1}`,
  value: i + 1
}));

const abilityData = new Array(21).fill(null).map((_, i) => ({
  label: `属性 ${20 - i}`,
  value: 20 - i
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
    selectedAbility: null,
    
    reportAttachRoll: null,
    detailAttachRoll: [],

    reportDifficulty: null,
    detailDifficulty: [],

    activePanels: [],
  },

  observers: {
    'selectedLevel, selectedAbility'(
      level, ability
    ) {
      if (level && ability) {
        const proficiencyValue = Math.floor(2 + (level.value - 1) / 4);
        const abilityValue = Math.floor((ability.value - 10) / 2);
        const totalAttachRoll = abilityValue + proficiencyValue;
        this.setData({
          reportAttachRoll: `+${totalAttachRoll}`,
          detailAttachRoll: [
            `+${abilityValue}`,
            `+${proficiencyValue}`,
          ],
        });
        const totalDifficulty = 8 + abilityValue + proficiencyValue;
        this.setData({
          reportDifficulty: `${totalDifficulty}`,
          detailDifficulty: [
            `8`,
            `+${abilityValue}`,
            `+${proficiencyValue}`,
          ],
        });
      } else {
        this.setData({
          reportAttachRoll: null,
          detailAttachRoll: [],
          reportDifficulty: null,
          detailDifficulty: [],
        });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handlePanelChange(e) {
      this.setData({
        activePanels: e.detail.value,
      });
    },
    onLevelButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择等级',
        pickerData: levelData,
        pickerDataKey: 'level',
      });
    },
    onAbilityButtonTap() {
      this.setData({
        pickerVisible: true,
        pickerTitle: '选择施法属性',
        pickerData: abilityData,
        pickerDataKey: 'ability',
      });
    },
    onPickerCancel() {
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
          pickerVisible: false,
        });
      } else if (dataKey === 'ability') {
        this.setData({
          selectedAbility: selectedItem,
          pickerVisible: false,
        });
      }
    },
  }
})